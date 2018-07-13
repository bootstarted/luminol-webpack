// @flow
import type fs from 'fs';
import type {ApolloClient} from 'apollo-client';

export type Client = ApolloClient;
type WebpackEntry = string | {[string]: string} | [string];

export type WebpackConfig = {
  name: string,
  target: string,
  entry: WebpackEntry,
  plugins: Array<*>,
  output: {
    publicPath: string,
  },
  devServer: {[string]: mixed},
};

export type WebpackFileSystem = {
  readFile: fs.readFile,
};

export type WebpackMultiCompiler = {
  compilers: Array<WebpackCompiler>,
  plugin: (evt: string, fn: (*) => mixed) => void,
  hooks: {
    [string]: {
      tap: (name: string, fn: (*) => mixed) => void,
    },
  },
};

export type WebpackCompiler = {
  options: WebpackConfig,
  outputPath: string,
  outputFileSystem: WebpackFileSystem,
  plugin: (evt: string, fn: (*) => mixed) => void,
  hooks: {
    [string]: {
      tap: (name: string, fn: (*) => mixed) => void,
    },
  },
};

export type WebpackConfigInput =
  | Array<WebpackConfig | string>
  | WebpackConfig
  | string;

export type WebpackConfigs = Array<WebpackConfig> | WebpackConfig;

export type Asset = {
  name: string,
  chunkName: string,
};

export type Chunk = {
  name: string,
};

export type WebpackStats = {
  assets: Array<Asset>,
  chunks: Array<Chunk>,
  hash: string,
  publicPath: string,
  errors: Array<mixed>,
  modules: {[string]: {name: string}},
  hash: string,
};
