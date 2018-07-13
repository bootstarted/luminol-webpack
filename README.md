# luminol-webpack

Use [webpack] with [luminol].

![build status](http://img.shields.io/travis/metalabdesign/luminol-webpack/master.svg?style=flat)
![coverage](http://img.shields.io/codecov/c/github/metalabdesign/luminol-webpack/master.svg?style=flat)
![license](http://img.shields.io/npm/l/luminol-webpack.svg?style=flat)
![version](http://img.shields.io/npm/v/luminol-webpack.svg?style=flat)
![downloads](http://img.shields.io/npm/dm/luminol-webpack.svg?style=flat)

Features:

- Supports [react-native].
- Supports `webpack@1`, `webpack@2`, `webpack@3`, `webpack@4`.
- Custom HMR runtime.

## Usage

```sh
#!/bin/sh
luminol -c client.webpack.config.js -c server.webpack.config.js
```

[luminol]: https://github.com/metalabdesign/luminol
[webpack]: https://webpack.github.io/
[dev-server]: https://webpack.github.io/docs/webpack-dev-server.html
[react-native]: https://github.com/facebook/react-native
