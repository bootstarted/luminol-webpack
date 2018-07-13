// @flow
import {lookup} from 'mime-types';
import {use, send, url, next} from 'midori';

import readFileFromCompiler from './readFileFromCompiler';

import type {WebpackCompiler} from './types';
import type {App} from 'midori';

const contentType = (f) => {
  if (/\.js$/.test(f)) {
    return 'application/javascript; charset=utf-8';
  }
  return lookup(f);
};

type Options = {
  path: string,
};

/**
 * Create a midori app that serves stuff from a webpack compiler.
 * @param {WebpackCompiler} compiler The compiler.
 * @returns {App} Midori app.
 */
const serveCompilerOutput = (
  compiler: WebpackCompiler,
  {path = compiler.options.output.publicPath}: Options = {},
): App => {
  const length =
    path.charAt(path.length - 1) !== '/' ? path.length + 1 : path.length;
  return use(
    path,
    url(({pathname}) => {
      const b = pathname.substr(length);
      return readFileFromCompiler(compiler, b).then(
        (data) => {
          return send(200, {'Content-Type': contentType(b)}, data);
        },
        (err) => {
          if (err.code === 'EISDIR') {
            return send(200, '');
          } else if (err.code === 'ENOENT') {
            return next;
          }
          return Promise.reject(err);
        },
      );
    }),
  );
};

export default serveCompilerOutput;
