// @flow
import {identity} from 'ramda';
import {resolve} from 'path';

import type {WebpackConfigInput, WebpackConfig, WebpackConfigs} from './types';
type ConfigInput = string | WebpackConfig;

const getConfig = (config: ConfigInput): WebpackConfig => {
  if (typeof config === 'object') {
    return config;
  }
  const path = resolve(process.cwd(), config);
  const result = require(path);
  if (result.__esModule) {
    return result.default;
  }
  return result;
};

const normalizeConfig = (
  config: ?WebpackConfigInput,
  fn: (x: WebpackConfig) => WebpackConfig = identity,
): WebpackConfigs => {
  if (Array.isArray(config)) {
    if (config.length === 0) {
      throw new TypeError('Invalid webpack config: must not be empty.');
    } else if (config.length === 1) {
      return fn(getConfig(config[0]));
    }
    return config.map((x) => fn(getConfig(x)));
  } else if (
    (typeof config === 'object' && config !== null) ||
    (typeof config === 'string' && config.length > 0)
  ) {
    return fn(getConfig(config));
  }
  throw new TypeError(`Invalid webpack config type: ${typeof config}.`);
};

export default normalizeConfig;
