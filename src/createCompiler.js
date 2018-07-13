// @flow
import webpack from 'webpack';
import MemoryFileSystem from 'memory-fs';
import cuid from 'cuid';

import createConfig from './createConfig';
import normalizeConfig from './normalizeConfig';
import observeCompiler from './observeCompiler';

import serveCompilationAssets from './serveCompilationAssets';
import spawnCompilationProcess from './spawnCompilationProcess';

import type {
  WebpackConfigInput,
  WebpackConfigs,
  WebpackConfig,
  Client,
} from './types';

const getTarget = (config: ?WebpackConfig) => {
  if (config) {
    return config.target.toString();
  }
  return 'web';
};

const canUseMemoryFS = (config: WebpackConfig | Array<WebpackConfig>) => {
  if (Array.isArray(config)) {
    return config.every(canUseMemoryFS);
  }
  const target = getTarget(config);
  return target === 'web' || target === 'webworker';
};

type Options = {
  client: Client,
  config: WebpackConfigInput,
  url: string,
};

const createCompiler = ({client, config: input, url}: Options) => {
  const finalConfig: WebpackConfigs = normalizeConfig(input, (config) => {
    const compilerId = cuid();
    return createConfig({url, compilerId}, config);
  });
  const compiler = webpack(finalConfig);
  if (canUseMemoryFS(finalConfig)) {
    compiler.outputFileSystem = new MemoryFileSystem();
  }

  observeCompiler(client, compiler);
  serveCompilationAssets(client, compiler);
  spawnCompilationProcess(client, compiler);

  return compiler;
};

export default createCompiler;
