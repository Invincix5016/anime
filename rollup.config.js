import { babel } from '@rollup/plugin-babel';
import { terser } from "rollup-plugin-terser";
import replace from '@rollup/plugin-replace';
import pkg from './package.json';

const inputPath = 'src/anime.js';
const outputName = 'anime';

const banner = format => {
  const date = new Date();
  return `/*
  * anime.js v${ pkg.version } - ${ format }
  * (c) ${ date.getFullYear() } Julian Garnier
  * Released under the MIT license
  * animejs.com
*/
`;
}

const replaceOptions = {
  __packageVersion__: pkg.version,
  preventAssignment: true
}

const babelOptions = {
  presets: ["@babel/preset-env"],
  babelHelpers: 'bundled',
}

const tasks = [];

tasks.push(
  // ES6 UMD & Module
  {
    input: inputPath,
    output: [
      { file: pkg.module, format: 'esm', banner: banner('ES6 ESM') }
    ],
    plugins: [
      replace(replaceOptions),
    ]
  }
);

if (process.env.build) {
  tasks.push(
    // ES6 UMD & Module
    {
      input: inputPath,
      output: [
        { file: pkg.main, format: 'umd', name: outputName, banner: banner('ES6 UMD') },
      ],
      plugins: [
        replace(replaceOptions),
      ]
    }
  );

  tasks.push(
    // ES6 UMD & Module minified
    {
      input: inputPath,
      output: [
        { file: pkg.files + '/anime.umd.min.js', format: 'umd', name: outputName, banner: banner('ES6 UMD') },
        { file: pkg.files + '/anime.esm.min.js', format: 'esm', banner: banner('ES6 ESM') }
      ],
      plugins: [
        replace(replaceOptions),
        terser(),
      ]
    }
  );

  tasks.push(
    // ES5
    {
      input: inputPath,
      output: { file: pkg.files + '/anime.es5.js', format: 'iife', name: outputName, banner: banner('ES5 IIFE') },
      plugins: [
        replace(replaceOptions),
        babel(babelOptions),
      ]
    }
  );

  tasks.push(
    // ES5 Minified
    {
      input: inputPath,
      output: { file: pkg.files + '/anime.es5.min.js', format: 'iife', name: outputName, banner: banner('ES5 IIFE') },
      plugins: [
        replace(replaceOptions),
        babel(babelOptions),
        terser(),
      ]
    }
  );
}

export default tasks;
