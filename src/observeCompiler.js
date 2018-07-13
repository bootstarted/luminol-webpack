// @flow
import gql from 'graphql-tag';
import createDebug from './createDebug';
import type {WebpackCompiler, WebpackStats, Client} from '/types';

const debug = createDebug('thing');

const setCompilerStatus = gql`
  mutation setCompilerStatus($compilerId: ID, $status: CompilerStatus) {
    setCompilerStatus(compilerId: $compilerId, status: $status)
  }
`;

const publishCompilerState = gql`
  mutation publishCompilerState(
    $compilerId: ID
    $hash: String
    $state: String
  ) {
    publishCompilerState(compilerId: $compilerId, hash: $hash, state: $state)
  }
`;

/**
 * Handles hooking the webpack compiler.
 * @param {Object} client Client.
 * @param {Object} compiler Webpack compiler
 * @param {Array} platforms Platforms
 * @returns {void}
 */
const observeCompiler = (client: Client, compiler: WebpackCompiler) => {
  const compilerId = compiler.options.devServer.compilerId;

  compiler.hooks.compile.tap('observeCompiler', () => {
    debug('compilation started');
    client.mutate({
      mutation: setCompilerStatus,
      variables: {compilerId, status: 'COMPILING'},
    });
  });

  compiler.hooks.invalid.tap('observeCompiler', () => {
    debug('compilation invalid');
    client.mutate({
      mutation: setCompilerStatus,
      variables: {compilerId, status: 'PENDING'},
    });
  });

  compiler.hooks.done.tap('observeCompiler', (stats) => {
    if (!stats.hasErrors()) {
      client.mutate({
        mutation: setCompilerStatus,
        variables: {compilerId, status: 'DONE'},
      });
    } else {
      client.mutate({
        mutation: setCompilerStatus,
        variables: {compilerId, status: 'ERROR'},
      });
    }
    const state = stats.toString({
      colors: true,
    });
    console.log(state);
    const data: WebpackStats = stats.toJson({
      hash: true,
    });
    client.mutate({
      mutation: publishCompilerState,
      variables: {compilerId, hash: data.hash, state},
    });
  });
};

export default observeCompiler;
