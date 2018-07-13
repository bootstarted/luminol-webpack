// @flow
import createCompiler from './createCompiler';
import createDebug from './createDebug';

const debug = createDebug('root');

type Options = {
  client: mixed,
  url: string,
};

export default (config: string, {client, url}: Options) => {
  debug(`Compiling ${config} for ${url}`);
  const compiler = createCompiler({client, url, config});
  compiler.watch({}, () => {
    // TODO: Anything here?
  });
};
