/* eslint-disable import/no-commonjs */
const path = require('path');
const partial = require('webpack-partial');

module.exports = {
  name: 'client',
  entry: require.resolve('../client'),
  target: 'web',
  mode: 'development',
  output: {
    publicPath: '/js',
    path: path.resolve(path.join(__dirname, '..', 'dist', 'client')),
  },
};

module.exports = partial.loader(
  {
    loader: 'babel-loader',
    test: /\.js$/,
    exclude: /node_modules/,
  },
  module.exports,
);
