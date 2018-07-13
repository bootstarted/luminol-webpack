// @flow
import baseDebug from 'debug';

const createDebug = (namespace: string) => {
  return baseDebug(`meta-serve-webpack:${namespace}`);
};

export default createDebug;
