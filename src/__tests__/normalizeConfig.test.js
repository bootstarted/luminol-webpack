import normalizeConfig from '/internal/webpack/normalizeConfig';
import {identity} from 'ramda';

describe('/internal/compiler/normalizeConfig', () => {
  it('should fail for empty arrays', () => {
    expect(() => {
      normalizeConfig([], identity);
    }).toThrow(TypeError);
  });
  it('should fail for null values', () => {
    expect(() => {
      normalizeConfig(null, identity);
    }).toThrow(TypeError);
  });
  it('should return single value for single item arrays', () => {
    const config = {};
    const result = normalizeConfig([config], identity);
    expect(result).toBe(config);
  });

  it('should return all values for other arrays', () => {
    const config = [{}, {}];
    const result = normalizeConfig(config, identity);
    expect(result).toEqual(config);
  });

  it('should original value for non-arrays', () => {
    const result = normalizeConfig({foo: 5}, identity);
    expect(result).toEqual({foo: 5});
  });

  it('should load files', () => {
    const path = './demo/webpack/client.webpack.config.js';
    const result = normalizeConfig(path, identity);
    expect(result).toHaveProperty('output');
  });

  it('should load esm files', () => {
    const path = require.resolve('./fixture/esm.fixture');
    const result = normalizeConfig(path, identity);
    expect(result).toHaveProperty('output');
  });
});
