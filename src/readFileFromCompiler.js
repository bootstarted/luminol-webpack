// @flow
import nodeFs from 'fs';
import path from 'path';

import type {WebpackCompiler} from './types';

import createDebug from './createDebug';

const debug = createDebug('read');

/**
 * Read a file from a webpack compiler instance. This is useful for fetching
 * the data you've just compiled. If the path is a relative path then it is
 * resolved relative to the compiler's output path.
 * @param {WebpackCompiler} compiler Compiler to read from.
 * @param {String} file File to read.
 * @returns {Promise<Buffer>} The file data or error on failure.
 */
const readFileFromCompiler = (
  compiler: WebpackCompiler,
  file: string,
): Promise<Buffer | string> => {
  // TODO: The `fs` here pretty much only works with `MemoryFileSystem`. The
  // webpack@4 `NodeOutputFileSystem` doesn't have any of the functions that
  // are required to read files – only write them.
  const fs =
    typeof compiler.outputFileSystem.readFile === 'function'
      ? compiler.outputFileSystem
      : nodeFs;
  const resolved =
    file.charAt(0) !== '/' ? path.join(compiler.outputPath, file) : file;

  debug(`Reading file ${resolved} from compiler`);

  return new Promise((resolve, reject) => {
    fs.readFile(resolved, (err: ?ErrnoError, result: Buffer | string) => {
      err ? reject(err) : resolve(result);
    });
  });
};

export default readFileFromCompiler;
