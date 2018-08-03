/* eslint-env browser */
// @flow
import cuid from 'cuid';
import gql from 'graphql-tag';

import createClient from './createClient';
import createRuntime from './createRuntime';
import log from './log';
import {parseResourceQuery} from './util';

declare var __resourceQuery: string;

const appId = cuid();
const {url: originalUrl, compilerId} = parseResourceQuery(__resourceQuery);

const hostRegex = /:(\/\/)?(.*?)(\/|$)/;

const extractHost = (input) => {
  const result = hostRegex.exec(input);
  if (result) {
    return result[2];
  }
  return null;
};

const replaceHost = (url, newHost) => {
  return url.replace(hostRegex, (_all, slashes, host, suffix) => {
    return `:${slashes}${newHost}${suffix}`;
  });
};

const newHost = extractHost(window.location.href);
const url = replaceHost(originalUrl, newHost);

log.info(`Connecting to ${url}...`);

const client = createClient(url);

const registerApp = gql`
  mutation registerApp($appId: ID!, $compilerId: ID!) {
    registerApp(appId: $appId, compilerId: $compilerId)
  }
`;

const unregisterApp = gql`
  mutation unregisterApp($appId: ID!) {
    unregisterApp(appId: $appId)
  }
`;

createRuntime({
  appId,
  compilerId,
  client,
  reload() {
    log.warn('Reload window to see changes.');
  },
});

client.mutate({
  mutation: registerApp,
  variables: {appId, compilerId},
});

window.addEventListener('beforeunload', () => {
  client.mutate({
    mutation: unregisterApp,
    variables: {appId},
  });
});
