// @flow
import gql from 'graphql-tag';
import {unaccepted} from './util';
import log from './log';

import type {Client} from '/types';

type Options = {
  compilerId: string,
  client: Client,
  reload: () => void,
};

declare var module: {
  hot: {
    accept(callback: () => void): void,
    check(callback?: (err: ?Error, updates: Array<*>) => void): Promise<*>,
    apply(opts: *, callback?: (err: ?Error, result: *) => void): Promise<*>,
    status(): string,
  },
};

declare var __webpack_hash__: string;

const COMPILER_QUERY = gql`
  query Compiler($compilerId: ID!) {
    compiler(compilerId: $compilerId) {
      id
      hash
    }
  }
`;

const COMPILER_SUBSCRIPTION = gql`
  subscription compilerUpdated($compilerId: ID!) {
    compilerUpdated(compilerId: $compilerId) {
      id
      hash
    }
  }
`;

const APP_NOTIFY_UPDATE_PROGRESS_MUTATION = gql`
  mutation upds($appId: ID!, $status: AppUpdateStatus!) {
    notifyAppUpdateStatus(appId: $appId, status: $status)
  }
`;

const APP_NOTIFY_UPDATE_MODULES_UNACCEPTED_MUTATION = gql`
  mutation upds($appId: ID!, $modules: [String]) {
    notifyAppUpdateModulesUnaccepted(appId: $appId, modules: $modules)
  }
`;

const APP_NOTIFY_UPDATE_ERROR_MUTATION = gql`
  mutation upds($appId: ID!, $error: String) {
    notifyAppUpdateError(appId: $appId, error: $error)
  }
`;

const checkz = (): Promise<Array<*>> => {
  if (!module.hot) {
    return Promise.resolve([]);
  }
  // webpack 2+
  if (module.hot.check.length === 1) {
    return module.hot.check();
  }
  // webpack 1
  return new Promise((resolve, reject) => {
    module.hot.check((err, updates) => (err ? reject(err) : resolve(updates)));
  });
};

const applyz = (opts) => {
  // webpack 2+
  if (module.hot.apply.length === 1) {
    return module.hot.apply(opts);
  }
  // webpack 1
  return new Promise((resolve, reject) => {
    module.hot.apply(
      opts,
      (err, result) => (err ? reject(err) : resolve(result)),
    );
  });
};

export default ({reload, client, compilerId, appId}: Options) => {
  let lastHash = '';

  const upToDate = () => lastHash.indexOf(__webpack_hash__) >= 0;

  const getModule = (id: string) => {
    return id;
  };

  const check = () => {
    checkz()
      .then((updatedModules) => {
        if (!updatedModules) {
          client.mutate({
            mutation: APP_NOTIFY_UPDATE_MODULES_UNACCEPTED_MUTATION,
            variables: {appId, modules: []},
          });
          reload();
          return;
        }
        applyz({
          ignoreUnaccepted: true,
        })
          .then((renewedModules) => {
            if (!upToDate()) {
              check();
            }
            const unacceptedModules = unaccepted(
              renewedModules,
              updatedModules,
            );
            if (unacceptedModules.length > 0) {
              log.group.warn('Some modules could not be updated');
              unacceptedModules.forEach((id) => {
                log.warn(id);
              });
              log.group.end();
              client.mutate({
                mutation: APP_NOTIFY_UPDATE_MODULES_UNACCEPTED_MUTATION,
                variables: {appId, modules: unacceptedModules.map(getModule)},
              });
              reload();
              return;
            } else if (upToDate()) {
              log.info('Update ignored, app already up-to-date.');
              client.mutate({
                mutation: APP_NOTIFY_UPDATE_PROGRESS_MUTATION,
                variables: {appId, status: 'IGNORED'},
              });
            } else {
              log.info('Update applied.');
              log.group.info('Update modules:');
              renewedModules.forEach((id) => {
                log.info(id);
              });
              log.group.end();
              client.mutate({
                mutation: APP_NOTIFY_UPDATE_PROGRESS_MUTATION,
                variables: {appId, status: 'APPLIED'},
              });
            }
          })
          .catch((error) => {
            log.error('Unable to apply update.');
            log.error(error);
            client.mutate({
              mutation: APP_NOTIFY_UPDATE_ERROR_MUTATION,
              variables: {appId, error},
            });
            reload();
          });
      })
      .catch((error) => {
        log.error('Unable to fetch update.');
        log.error(error);
        client.mutate({
          mutation: APP_NOTIFY_UPDATE_ERROR_MUTATION,
          variables: {appId, error},
        });
      });
  };

  const handleHash = (hash) => {
    lastHash = hash;
    if (!upToDate()) {
      if (module.hot) {
        if (module.hot.status() === 'idle') {
          log.info('Update in progress.');
          client.mutate({
            mutation: APP_NOTIFY_UPDATE_PROGRESS_MUTATION,
            variables: {appId, status: 'PENDING'},
          });
          check();
        }
      } else {
        reload();
      }
    } else {
      log.info('Update ignored, app already up-to-date.');
      client.mutate({
        mutation: APP_NOTIFY_UPDATE_PROGRESS_MUTATION,
        variables: {appId, status: 'IGNORED'},
      });
    }
  };

  const query = client.watchQuery({
    query: COMPILER_QUERY,
    variables: {compilerId},
  });

  query.subscribe({
    next({data: {compiler}}) {
      if (compiler) {
        handleHash(compiler.hash);
      } else {
        log.error(`Unknown compiler: '${compilerId}'.`);
        log.error('This probably means you need to restart this app.');
      }
    },
  });

  query.subscribeToMore({
    document: COMPILER_SUBSCRIPTION,
    variables: {compilerId},
    updateQuery: (prev, {subscriptionData}) => {
      if (!subscriptionData.data) {
        return prev;
      }
      return {
        ...prev,
        compiler: {
          ...prev.compiler,
          ...subscriptionData.data.compilerUpdated,
        },
      };
    },
  });
};
