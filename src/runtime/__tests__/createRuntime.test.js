import createRuntime from '/internal/webpack/runtime/createRuntime';
import createClient from '#test/util/createClient';

describe('createRuntime', () => {
  it('should work', () => {
    const client = createClient();
    createRuntime({
      compilerId: 'foo',
      client,
    });
  });
});
