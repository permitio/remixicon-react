import React from 'react'
import SvgAccountBoxFill from './publish-react/SvgAccountBoxFill';
import { SvgAccountBoxLine } from './publish-react'

// this will throw a type error
const noRender = () => (
  <>
    <SvgAccountBoxFill>Things that are not shown</AccessPointIcon>
    <SvgAccountBoxFill color={0} />
    <SvgAccountBoxLine size />
    <SvgAccountBoxLine className={5} />
  </>
);

// this should be the one to use
const render = () => (
  <>
    <SvgAccountBoxFill></SvgAccountBoxFill>
    <SvgAccountBoxFill fill="#fff" className="some-class" />
    <SvgAccountBoxLine
      style={{display: 'block', margin: 'auto'}}
      onClick={() => {}} />
  </>
);
