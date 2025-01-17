const generate = require('./generate');

generate('react', component => `import React from 'react';

const ${component.name} = ({ color = 'currentColor', size = 24, children, ...props }) => {
  return (
    <svg {...props} viewBox="0 0 24 24">
      <path d="${component.svgPath}" />
    </svg>
  );
};

export default React.memo ? React.memo(${component.name}) : ${component.name};
`, component => `import { RemixiconReactIconComponentType } from './dist/typings';

declare const ${component.name}: RemixiconReactIconComponentType;
export default ${component.name};
`, () => `import { ComponentType, SVGProps } from 'react';

type AllSVGProps = SVGProps<SVGSVGElement>

export interface RemixiconReactIconProps extends Pick<AllSVGProps, Exclude<keyof AllSVGProps, 'viewBox'>> {
  // should not have any children
  children?: never;
}
export type RemixiconReactIconComponentType = ComponentType<RemixiconReactIconProps>;
`).catch(err => console.error(err));
