import runtime from '/internal/webpack/getRuntimeRequest';

describe('/runtime', () => {
  it('should work with web', () => {
    const result = runtime({compilerId: 'foo', target: 'web', url: 'foo'});
    expect(result).toEqual(expect.stringContaining('web.js'));
  });
  it('should work with node', () => {
    const result = runtime({compilerId: 'foo', target: 'node', url: 'foo'});
    expect(result).toEqual(expect.stringContaining('node.js'));
  });
  it('should work with webworker', () => {
    const result = runtime({
      compilerId: 'foo',
      target: 'webworker',
      url: 'foo',
    });
    expect(result).toEqual(expect.stringContaining('web.js'));
  });
  it('should include the hub url', () => {
    const result = runtime({compilerId: 'foo', target: 'web', url: 'foo'});
    expect(result).toEqual(expect.stringContaining('foo'));
  });
  it('should fail on invalid target', () => {
    expect(() => {
      runtime({compilerId: 'foo', target: 'bananas', url: 'foo'});
    }).toThrow(TypeError);
  });
  it('should fail without `compilerId`', () => {
    expect(() => {
      runtime({target: 'web', url: 'foo'});
    }).toThrow(TypeError);
  });
  it('should fail without `url`', () => {
    expect(() => {
      runtime({target: 'web', compilerId: 'foo'});
    }).toThrow(TypeError);
  });
});
