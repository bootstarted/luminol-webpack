const prefix = '[hmr]';

const info = (...msg) => {
  console.log(prefix, ...msg);
};

const warn = (...msg) => {
  console.warn(prefix, ...msg);
};

const error = (...msg) => {
  console.error(prefix, ...msg);
};

const mkgroup = (_fn) => {
  return (...args) => {
    if (typeof console.groupCollapsed === 'function') {
      console.groupCollapsed(prefix, ...args);
    } else if (typeof console.group === 'function') {
      console.group(prefix, ...args);
    }
  };
};

const log = {
  info,
  warn,
  error,
  group: {
    info: mkgroup(info),
    warn: mkgroup(warn),
    error: mkgroup(error),
    end: () => {
      if (typeof console.groupEnd === 'function') {
        console.groupEnd();
      }
    },
  },
};

export default log;
