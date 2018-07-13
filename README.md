# meta-serve-webpack

Use [webpack] with [meta-serve].

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
