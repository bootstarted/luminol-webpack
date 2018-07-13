import observeCompiler from '/internal/webpack/observeCompiler';
import webpack from 'webpack';
import demoConfig from '/../demo/webpack/client.webpack.config.js';

describe('/internal/webpack/observeCompiler', () => {
  it('should work with a real compiler', async () => {
    const spy = jest.fn();
    const compiler = webpack({
      ...demoConfig,
      devServer: {
        compilerId: 'foo',
      },
    });
    const client = {
      mutate: spy,
    };
    observeCompiler(client, compiler);
    const promise = new Promise((resolve, reject) => {
      compiler.run((err) => {
        err ? reject(err) : resolve();
      });
    });
    await promise;
    // TODO: Verify test.
  });
  it('should set pending status when invalid', () => {
    let m;
    const compiler = {
      options: {
        devServer: {
          compilerId: 'foo',
        },
      },
      hooks: {
        compile: {tap: () => {}},
        invalid: {
          tap: (name, fn) => {
            m = fn;
          },
        },
        done: {tap: () => {}},
      },
    };
    const client = {
      mutate: () => {},
    };
    observeCompiler(client, compiler);
    m();
  });
});
