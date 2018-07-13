// @flow
import ApolloClient from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {WebSocketLink} from 'apollo-link-ws';
import urlJoin from 'url-join';

import WebSocket from './WebSocket';

const createClient = (url?: string): ApolloClient => {
  if (typeof url === 'undefined') {
    if (typeof global.__webpack_udev_client__ !== 'undefined') {
      return global.__webpack_udev_client__;
    }
    throw new TypeError('Must provide valid `url`.');
  }

  const cache = new InMemoryCache();
  const link = new WebSocketLink({
    uri: urlJoin(url.replace(/^http/, 'ws'), '/__webpack_udev_graphql__'),
    options: {
      reconnect: true,
    },
    webSocketImpl: WebSocket,
  });
  return new ApolloClient({
    cache,
    link,
  });
};

export default createClient;
