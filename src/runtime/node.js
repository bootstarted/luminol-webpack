// @flow
import http from 'http';
import gql from 'graphql-tag';
import cuid from 'cuid';
import createClient from './createClient';
import createRuntime from './createRuntime';
import log from './log';
import {parseResourceQuery} from './util';

declare var __webpack_public_path__: string;
declare var __resourceQuery: string;

const listen = http.Server.prototype.listen;

const {url, compilerId} = parseResourceQuery(__resourceQuery);

const client = createClient(url);

const appId = cuid();

const REGISTER_APP_MUTATION = gql`
  mutation registerApp($appId: ID!, $compilerId: ID!, $processId: ID!) {
    registerApp(appId: $appId, compilerId: $compilerId, processId: $processId)
  }
`;

const REGISTER_PROXY_MUTATION = gql`
  mutation registerProxy(
    $url: String!
    $path: String!
    $appId: ID!
    $compilerId: ID!
    $processId: ID!
  ) {
    registerProxy(
      url: $url
      path: $path
      appId: $appId
      compilerId: $compilerId
      processId: $processId
    ) {
      id
    }
  }
`;

const getProxyPath = (): string => {
  // TODO: FIXME: Figure out mechanism of supplying proxy path.
  return '/';
};

// Hack the HTTP server prototype to send address information upstream.
// $ExpectError: TODO: Fix flow ignoring this.
http.Server.prototype.listen = function() {
  const _this = this;
  this.once('listening', () => {
    const address = _this.address();
    const path = getProxyPath();
    client.mutate({
      mutation: REGISTER_PROXY_MUTATION,
      variables: {
        appId,
        compilerId,
        url: `http://localhost:${address.port}${path}`,
        path,
        processId: process.env.LUMINOL_PROCESS_ID,
      },
    });
  });
  listen.apply(this, arguments);
};

createRuntime({
  appId,
  compilerId,
  client,
  reload() {
    log.info('Killing self due to app update.');
    process.exit(218);
  },
});

client.mutate({
  mutation: REGISTER_APP_MUTATION,
  variables: {appId, compilerId, processId: process.env.LUMINOL_PROCESS_ID},
});
