// @flow
const runtimes = {
  node: require.resolve('./runtime/node'),
  web: require.resolve('./runtime/web'),
  webworker: require.resolve('./runtime/web'),
};

type Options = {
  compilerId: string,
  target: string,
  url: string,
};

export default ({compilerId, target, url}: Options) => {
  if (!url) {
    throw new TypeError('Must give valid `url`.');
  }
  if (!compilerId) {
    throw new TypeError('Must give valid `compilerId` property.');
  }
  if (target in runtimes) {
    return `${runtimes[target]}?${compilerId}|${url}`;
  }
  throw new TypeError(`No runtime available for '${target}'.`);
};
