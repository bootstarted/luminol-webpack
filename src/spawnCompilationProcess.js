// @flow
import path from 'path';
import gql from 'graphql-tag';

import type {WebpackCompiler, Client} from './types';

const REGISTER_PROCESS_MUTATION = gql`
  mutation registerProcess(
    $path: String
    $args: [String]
    $title: String
    $env: [EnvVarInput]
  ) {
    registerProcess(path: $path, args: $args, title: $title, env: $env) {
      id
    }
  }
`;

const spawnCompilationProcess = (client: Client, compiler: WebpackCompiler) => {
  if (compiler.options.target !== 'node') {
    return;
  }
  let hasProc = false;
  let stats = null;
  let lastHash = null;

  // const devPath = get(['devServer', 'publicPath'], compiler.options);
  // const proxyPath = devPath ? URL.parse(devPath).pathname : null;

  compiler.hooks.done.tap('node', (_stats) => {
    lastHash = stats && stats.hash;
    stats = _stats.toJson();

    if (!stats || stats.errors.length > 0) {
      return;
    }
    // This is half optimization half rescuing the OS from a fork bomb that
    // gets caused via https://github.com/webpack/watchpack/issues/25.
    if (lastHash && lastHash === stats.hash) {
      return;
    }

    const entries = stats.chunks.filter((chunk) => chunk.entry);
    // Only support one entrypoint right now. Maybe support more later.
    if (entries.length !== 1) {
      // TODO: Report error!
      return;
    }
    const target = path.join(compiler.outputPath, entries[0].files[0]);
    if (!hasProc) {
      hasProc = true;
      client.mutate({
        mutation: REGISTER_PROCESS_MUTATION,
        variables: {
          title: `${path.basename(target)} (${compiler.options.name})`,
          path: 'node',
          args: [target],
          env: [{key: 'PORT', value: '0'}],
        },
      });
    }
  });
};

export default spawnCompilationProcess;
