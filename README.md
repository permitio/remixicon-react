# remixicon-react [![npm package](https://img.shields.io/npm/v/remixicon-react.svg?style=flat-square)](https://npmjs.org/package/remixicon-react) [![Remix Icons version](https://img.shields.io/badge/remixicon-v2.4.0-blue.svg?style=flat-square)](https://remixicon.com/) [![build status](https://img.shields.io/travis/bayesimpact/remixicon-react/master.svg?style=flat-square)](https://travis-ci.org/bayesimpact/remixicon-react)
[Remix Icons](https://remixicon.com/) for React packaged as single components

This repo is based on the very good [mdi-react](https://github.com/levrik/mdi-react) package.

## Installation

```bash
npm install dathost-remixicon-react
# or if you use Yarn
yarn add dathost-remixicon-react
```

## Usage

Just search for an icon on [remixicon.com](https://remixicon.com) and look for its name.  
The name translates to Svg followed by the name in `remixicon-react` converted to PascalCase.

For example the icons named `alert-line` and `alert-fill`:

```javascript
import SvgAlertLine from 'dathost-remixicon-react/SvgAlertLine';
import SvgAlertFill from 'dathost-remixicon-react/SvgAlertFill';

const MyComponent = () => {
  return (
    <div>
      <SvgAlertFill />
      <SvgAlertLine className="some-class" />
    </div>
  );
};
```
