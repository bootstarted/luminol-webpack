import webpack from 'webpack';
import createConfig from '/createConfig';

const plugins = (config) => {
  return (config.plugins || []).map((x) => x.constructor.toString()).join('|');
};

describe('/internal/webpack/createConfig', () => {
  it('should throw if no `entry`', () => {
    expect(() => {
      createConfig({compilerId: 'foo', url: 'http://localhost'}, {});
    }).toThrow(TypeError);
  });
  it('should prepend the runtime just before the entrypoint', () => {
    const result = createConfig(
      {compilerId: 'foo', url: 'http://localhost'},
      {
        entry: ['foo.js', 'bar.js'],
        name: 'foo',
      },
    );
    expect(result.entry[result.entry.length - 2]).toEqual(
      expect.stringContaining('http://'),
    );
  });
  it('should ensure `publicPath` has a trailing slash', () => {
    const result = createConfig(
      {compilerId: 'foo', url: 'http://localhost'},
      {
        entry: 'foo.js',
        name: 'foo',
        output: {
          publicPath: '/foo',
        },
      },
    );
    expect(result.output.publicPath).toBe('/foo/');
  });
  it('should ignore `publicPath` with a trailing slash', () => {
    const result = createConfig(
      {compilerId: 'foo', url: 'http://localhost'},
      {
        entry: 'foo.js',
        name: 'foo',
        output: {
          publicPath: '/foo/',
        },
      },
    );
    expect(result.output.publicPath).toBe('/foo/');
  });
  it('should set `publicPath` if none exists', () => {
    const result = createConfig(
      {compilerId: 'foo', url: 'http://localhost'},
      {
        entry: 'foo.js',
        name: 'foo',
      },
    );
    expect(result.output.publicPath).toBe('/');
  });
  it('should add HMR plugin when `hot` is true', () => {
    const result = createConfig(
      {compilerId: 'foo', hot: true, url: 'http://localhost'},
      {
        entry: 'foo.js',
        name: 'foo',
      },
    );
    expect(plugins(result)).toEqual(
      expect.stringContaining('HotModuleReplacementPlugin'),
    );
  });
  it('should not add HMR plugin when `hot` is true and plugin exists', () => {
    const result = createConfig(
      {compilerId: 'foo', hot: true, url: 'http://localhost'},
      {
        entry: 'foo.js',
        name: 'foo',
        plugins: [new webpack.HotModuleReplacementPlugin()],
      },
    );
    expect(plugins(result)).toEqual(
      expect.stringContaining('HotModuleReplacementPlugin'),
    );
  });
  it('should not add HMR plugin when `hot` is false', () => {
    const result = createConfig(
      {compilerId: 'foo', hot: false, url: 'http://localhost'},
      {
        entry: 'foo.js',
        name: 'foo',
      },
    );
    expect(plugins(result)).not.toEqual(
      expect.stringContaining('HotModuleReplacementPlugin'),
    );
  });
});
