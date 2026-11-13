import fs from 'fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReactQRCode } from '@lglab/react-qr-code';

const el = React.createElement(ReactQRCode, {
  value: 'riv-26-9932',
  size: 360,
  level: 'H',
  background: '#FFFFFF',
  dataModulesSettings: { color: '#000000', style: 'circle' },
  finderPatternOuterSettings: { color: '#000000', style: 'rounded' },
  finderPatternInnerSettings: { color: '#000000', style: 'rounded' },
  imageSettings: {
    src: 'https://reinvent.awssbgdhule.in/preview.png',
    height: 40,
    width: 60,
    excavate: true
  }
});

let svg = renderToStaticMarkup(el);
console.log('SVG viewBox:', svg.match(/viewBox="[^"]+"/)?.[0]);
console.log('Image tag:', svg.match(/<image[^>]+>/)?.[0]);
console.log('Excavated modules:');
