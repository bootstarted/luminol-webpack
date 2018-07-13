# meta-serve-webpack

Use [webpack] with [meta-serve].

![build status](http://img.shields.io/travis/metalabdesign/meta-serve-webpack/master.svg?style=flat)
![coverage](http://img.shields.io/codecov/c/github/metalabdesign/meta-serve-webpack/master.svg?style=flat)
![license](http://img.shields.io/npm/l/meta-serve-webpack.svg?style=flat)
![version](http://img.shields.io/npm/v/meta-serve-webpack.svg?style=flat)
![downloads](http://img.shields.io/npm/dm/meta-serve-webpack.svg?style=flat)

Features:

- Supports [react-native].
- Supports `webpack@1`, `webpack@2`, `webpack@3`, `webpack@4`.
- Custom HMR runtime.

## Usage

```sh
#!/bin/sh
meta-serve -c client.webpack.config.js -c server.webpack.config.js
```

[meta-serve]: https://github.com/metalabdesign/meta-serve
[webpack]: https://webpack.github.io/
[dev-server]: https://webpack.github.io/docs/webpack-dev-server.html
[react-native]: https://github.com/facebook/react-native
