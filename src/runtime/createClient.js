// @flow
import ApolloClient from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {WebSocketLink} from 'apollo-link-ws';

import WebSocket from './WebSocket';

const createClient = (url: string): ApolloClient => {
  if (typeof url === 'undefined') {
    throw new TypeError('Must provide valid `url`.');
  }

  const cache = new InMemoryCache();
  const link = new WebSocketLink({
    uri: url.replace(/^http/, 'ws'),
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
