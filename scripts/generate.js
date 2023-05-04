const fs = require('fs/promises');
const path = require('path');
const swc = require("@swc/core");

const svgPathRegex = /<path\s([^>]*)>/g;
const svgAttrRegex = /(?:\s*|^)([^= ]*)="([^"]*)"/g;
const validIconName = /^[A-Z]/;

function normalizeName(name) {
  const normalizedName = 'Svg' + name.split(/[ -]/g).map(part => {
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join('');

  // Avoid name collisions between categories (only casing differs otherwise)
  if (normalizedName === 'SvgBookMarkFill') {
    return 'SvgDocumentBookMarkFill';
  } else if (normalizedName === 'SvgBookMarkLine') {
    return 'SvgDocumentBookMarkLine';
  }

  return normalizedName;
}

function checkAllowedAttr(attr, value, content, name) {
  if (attr === 'd') {
    return true
  }
  if (attr === 'fill') {
    if (value === 'none') {
      // Will be filtered out.
      return true
    }
    if (value === '#000') {
      // Default value.
      return true
    }
  }
  if (attr === 'fill-rule' && value === 'nonzero') {
    // Default value.
    return true
  }
  return false
}

function extractPath(content, name) {
  const allPaths = []
  while (true) {
    const svgPathMatches = svgPathRegex.exec(content);
    const svgPath = svgPathMatches && svgPathMatches[1];
    if (!svgPath) {
      break
    }
    const attrs = {}
    while (true) {
      const svgAttrMatches = svgAttrRegex.exec(svgPath);
      if (!svgAttrMatches) {
        break
      }
      if (!checkAllowedAttr(svgAttrMatches[1], svgAttrMatches[2])) {
        throw new Error(
          `Unknown SVG attr in ${name}: ${svgAttrMatches[1]}="${svgAttrMatches[2]}"\n${content}`,
        )
      }
      attrs[svgAttrMatches[1]] = svgAttrMatches[2]
    }
    if (attrs.fill === 'none') {
      continue
    }
    allPaths.push(attrs)
  }
  if (allPaths.length !== 1 || !allPaths[0].d) {
    throw new Error(
      `Wrong number of path in ${name}: ${allPaths.length}\n` +
      `${JSON.stringify(allPaths, undefined, 2)}\n${content}`,
    )
  }
  return allPaths[0].d
}

async function collectComponents(svgFilesPath) {
  const svgFiles = await fs.readdir(svgFilesPath);

  const icons = [];
  for (const svgFile of svgFiles) {
    const svgFilePath = path.join(svgFilesPath, svgFile);

    // Handle sub-directories.
    const stats = await fs.stat(svgFilePath);
    if (stats.isDirectory()) {
      icons.push(...await collectComponents(svgFilePath));
      continue;
    }

    const origName = svgFile.slice(0, -4);
    const name = normalizeName(origName);

    if (!validIconName.exec(name)) {
      console.log(`Skipping icon with invalid name: ${svgFilePath}`)
      continue;
    }

    const content = await fs.readFile(svgFilePath);
    let svgPath
    try {
      svgPath = extractPath(content, svgFilePath);
    } catch (err) {
      // Ignore file.
      console.log(err)
      continue;
    }

    const icon = {
      name,
      fileName: name + '.js',
      defFileName: name + '.d.ts',
      svgPath
    };

    icons.push(icon);
  }

  return icons;
}

async function generate(target, jsCb, tsCb, tsAllCb) {
  const basePath = path.resolve(__dirname, '..');
  const svgFilesPath = path.resolve(basePath, 'node_modules/remixicon/icons');
  const buildPath = path.resolve(basePath, 'build');
  await fs.mkdir(buildPath, { recursive: true });
  const publishPath = path.resolve(basePath, 'publish-' + target);
  await fs.mkdir(publishPath, { recursive: true });
  const distPath = path.resolve(publishPath, 'dist');
  await fs.mkdir(distPath, { recursive: true });

  console.log('Collecting components...');
  const components = await collectComponents(svgFilesPath);
  console.log('Generating components...');
  const componentNames = [];
  for (const [index, component] of components.entries()) {
    if (!component.aliasFor) {
      console.log(`Generating ${component.name}... (${index + 1}/${components.length})`);
    } else {
      console.log(`Generating alias ${component.name}... (${index + 1}/${components.length})`);
    }

    const fileContent = jsCb(component);
    const outputPath = path.resolve(publishPath, component.fileName);

    const output = await swc.transform(fileContent, {
      jsc: {
        parser: {
          jsx: true
        },
        target: 'es2020',
      },
    })

    await fs.writeFile(outputPath, output.code)

    const definitionContent = tsCb(component);
    await fs.writeFile(path.join(publishPath, component.defFileName), definitionContent);
    componentNames.push(component.name)
  }

  console.log('Generating index.ts')
  await fs.writeFile(
    path.resolve(publishPath, 'index.ts'),
    componentNames.map((name) => `export { default as ${name} } from './${name}';`).join('\n')
  )

  console.log('Generating typings...');
  // create the global typings.d.ts
  const typingsContent = tsAllCb(componentNames);
  await fs.writeFile(path.resolve(distPath, 'typings.d.ts'), typingsContent);
}

module.exports = generate;
