// @flow
import type {WebpackCompiler, WebpackMultiCompiler} from './types';

/**
 * This is just a utility function to handle both webpack@4 and older hooks.
 * @param {WebpackCompiler} compiler The compiler.
 * @returns {void}
 */
const supportLegacyHooks = (
  compiler: WebpackCompiler | WebpackMultiCompiler,
): void => {
  // TODO: Consider returning an unhook function.
  if (compiler.hooks) {
    return;
  }
  compiler.hooks = {
    invalid: {tap: (_, f) => compiler.plugin('invalid', f)},
    done: {tap: (_, f) => compiler.plugin('done', f)},
    compile: {tap: (_, f) => compiler.plugin('compile', f)},
  };
};

export default supportLegacyHooks;
