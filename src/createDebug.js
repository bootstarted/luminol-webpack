// @flow
import baseDebug from 'debug';

const createDebug = (namespace: string) => {
  return baseDebug(`luminol-webpack:${namespace}`);
};

export default createDebug;
