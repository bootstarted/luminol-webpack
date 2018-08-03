// @flow
import {compose, curry, assocPath, path, identity} from 'ramda';
import {entry, plugin} from 'webpack-partial';
import {HotModuleReplacementPlugin} from 'webpack';

import runtime from './getRuntimeRequest';

import type {WebpackConfig} from './types';

const isDirectory = (path) => {
  return path.charAt(path.length - 1) === '/';
};

const createToken = () =>
  Math.random()
    .toString(36)
    .substr(2);

// https://github.com/webpack/webpack/blob
// /1b9e880f388f49bc88b52d5a6bbab5538d4c311e
// /lib/JsonpMainTemplate.runtime.js#L27
const getPublicPath = (config: WebpackConfig): string => {
  const existing = path(['output', 'publicPath'], config);
  if (!existing) {
    return '/';
  } else if (!isDirectory(existing)) {
    return `${existing}/`;
  }
  return existing;
};

const fixPublicPath = (config: WebpackConfig): WebpackConfig => {
  return assocPath(['output', 'publicPath'], getPublicPath(config), config);
};

const assignName = (config: WebpackConfig): WebpackConfig => {
  const name = path(['name'], config) || createToken();
  return assocPath(['name'], name, config);
};

const assignCompilerId = curry(
  (compilerId, config: WebpackConfig): WebpackConfig => {
    return {
      ...config,
      devServer: {
        ...config.devServer,
        compilerId,
      },
    };
  },
);

const withHot = (config: WebpackConfig): WebpackConfig => {
  const hasHMR = (config.plugins || []).some((x) => {
    return x instanceof HotModuleReplacementPlugin;
  });
  if (hasHMR) {
    return config;
  }
  return plugin(new HotModuleReplacementPlugin(), config);
};

const withRuntime = curry(
  (options, config: WebpackConfig): WebpackConfig => {
    const value = runtime({
      target: config.target || 'web',
      ...options,
    });
    return entry((previous) => {
      if (!previous.length) {
        throw new TypeError('Must have a valid `entry`.');
      }
      if (previous.indexOf(value) !== -1) {
        return previous;
      }
      const last = previous.length - 1;
      return previous
        .slice(0, last)
        .concat(value)
        .concat([previous[last]]);
    }, config);
  },
);

type Options = {
  compilerId: string,
  url: string,
  hot?: boolean,
};

const createConfig = curry(
  (
    {url, compilerId, hot = true}: Options,
    config: WebpackConfig,
  ): WebpackConfig =>
    compose(
      withRuntime({
        url,
        compilerId,
      }),
      hot ? withHot : identity,
      assignCompilerId(compilerId),
      assignName,
      fixPublicPath,
    )(config),
);

export default createConfig;
