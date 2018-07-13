import webpack from 'webpack';
import demoConfig from '/../demo/webpack/client.webpack.config.js';
import {compose, status, error} from 'midori';
import {fetch} from 'midori/test';
import MemoryFileSystem from 'memory-fs';

import serveCompilerOutput from '/internal/webpack/serveCompilerOutput';

const compile = (compiler) =>
  new Promise((resolve, reject) => {
    compiler.run((err) => {
      err ? reject(err) : resolve();
    });
  });

describe('/internal/webpack/serveCompilerOutput', () => {
  it('should serve files', () => {
    const compiler = webpack({
      ...demoConfig,
      name: 'foo',
      output: {
        ...demoConfig.output,
        publicPath: '/foo',
      },
    });
    compiler.outputFileSystem = new MemoryFileSystem();
    const app = serveCompilerOutput(compiler);
    return compile(compiler).then(() => {
      return fetch(app, '/foo/main.js').then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(expect.stringContaining('webpackBootstrap'));
      });
    });
  });

  it('should ignore directories', () => {
    const compiler = webpack({
      ...demoConfig,
      name: 'foo',
      output: {
        ...demoConfig.output,
        publicPath: '/foo',
      },
    });
    compiler.outputFileSystem = new MemoryFileSystem();
    const app = serveCompilerOutput(compiler);
    return compile(compiler).then(() => {
      return fetch(app, '/foo').then((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toBe('');
      });
    });
  });

  it('should fetch next if no file matches', () => {
    const compiler = webpack({
      ...demoConfig,
      name: 'foo',
      output: {
        ...demoConfig.output,
        publicPath: '/foo',
      },
    });
    compiler.outputFileSystem = new MemoryFileSystem();
    const app = compose(
      serveCompilerOutput(compiler),
      status(207),
    );
    return compile(compiler).then(() => {
      return fetch(app, '/bananars').then((res) => {
        expect(res.statusCode).toBe(207);
      });
    });
  });

  it('should propagate errors', () => {
    const compiler = {
      options: {
        output: {
          ...demoConfig.output,
          publicPath: '/foo',
        },
      },
      outputFileSystem: {
        readFile: (x, cb) => {
          cb(new Error());
        },
      },
    };
    compiler.outputFileSystem = new MemoryFileSystem();
    const app = compose(
      serveCompilerOutput(compiler),
      error(() => status(207)),
    );
    return fetch(app, '/foo/main.js').then((res) => {
      expect(res.statusCode).toBe(207);
    });
  });
});
