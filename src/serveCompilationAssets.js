// @flow
import {listen} from 'midori';
import serveCompilerOutput from './serveCompilerOutput';
import URL from 'url';
import gql from 'graphql-tag';

import createDebug from './createDebug';

import type {WebpackCompiler, Client} from './types';

const debug = createDebug('web');

const REGISTER_PROXY_MUTATION = gql`
  mutation registerProxy($url: String, $path: String) {
    registerProxy(url: $url, path: $path) {
      id
    }
  }
`;

const UPDATE_PROXY_MUTATION = gql`
  mutation updateProxy($id: ID!, $url: String) {
    updateProxy(id: $id, url: $url)
  }
`;

const getPath = (compiler: WebpackCompiler) => {
  if (
    compiler.options.target !== 'web' &&
    compiler.options.target !== 'webworker'
  ) {
    return null;
  }
  return URL.parse(compiler.options.output.publicPath).pathname;
};

export default async (client: Client, compiler: WebpackCompiler) => {
  const path = getPath(compiler);

  if (typeof path !== 'string') {
    return;
  }

  const app = serveCompilerOutput(compiler, {path});
  const server = listen(app);

  const result = await client.mutate({
    mutation: REGISTER_PROXY_MUTATION,
    variables: {path, url: ''},
  });

  if (!result.data) {
    debug('Unable to create proxy.');
    return;
  }

  const proxy = result.data.registerProxy;
  debug(`Registered proxy ${proxy.id} for ${path}`);

  compiler.hooks.invalid.tap('web', () => {
    client.mutate({
      mutation: UPDATE_PROXY_MUTATION,
      variables: {id: proxy.id, url: ''},
    });
  });

  compiler.hooks.done.tap('web', async (_stats) => {
    const address = server.address();
    if (address) {
      const base = `http://localhost:${address.port}`;
      debug(`webpack assets available at ${base}`);
      await client.mutate({
        mutation: UPDATE_PROXY_MUTATION,
        variables: {id: proxy.id, url: `${base}${path}`},
      });
    }
  });
};
