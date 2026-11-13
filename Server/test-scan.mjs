import jsQR from '../Client/node_modules/jsqr/dist/jsQR.js';
import fs from 'fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReactQRCode } from '@lglab/react-qr-code';
import { Resvg } from '@resvg/resvg-js';

const el = React.createElement(ReactQRCode, {
  value: 'riv-26-9932',
  size: 360,
  level: 'H',
  background: '#FFFFFF',
  dataModulesSettings: { color: '#000000', style: 'circle' },
  finderPatternOuterSettings: { color: '#000000', style: 'rounded' },
  finderPatternInnerSettings: { color: '#000000', style: 'rounded' },
});

let svg = renderToStaticMarkup(el);
if (!svg.includes('xmlns=')) {
  svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ');
}

const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 450 } });
const rendered = resvg.render();
const decoded = jsQR(new Uint8ClampedArray(rendered.pixels), rendered.width, rendered.height);
console.log(`Without image => ${decoded ? 'SUCCESS (' + decoded.data + ')' : 'FAILED'}`);
