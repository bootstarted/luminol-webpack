// @flow
export const unaccepted = (
  renewedModules: Array<string>,
  updatedModules: Array<string>,
) => {
  return updatedModules.filter((moduleId) => {
    return renewedModules && renewedModules.indexOf(moduleId) < 0;
  });
};

export const empty = (renewedModules: Array<*>) => {
  return !renewedModules || renewedModules.length === 0;
};

type QueryObject = {
  compilerId: string,
  url: string,
};

export const parseResourceQuery = (query: string): QueryObject => {
  const [compilerId, url] = query.substr(1).split('|');
  return {compilerId, url};
};
