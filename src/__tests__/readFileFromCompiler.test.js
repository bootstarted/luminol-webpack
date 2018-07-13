import readFileFromCompiler from '/readFileFromCompiler';

describe('/internal/webpack/readFileFromCompiler', () => {
  it('should pass file name through', async () => {
    const readFile = jest
      .fn()
      .mockImplementation((x, cb) => cb(null, 'bananas'));
    const compiler = {outputFileSystem: {readFile}};
    await readFileFromCompiler(compiler, '/foo');
    // TODO: Verify '/foo'
    expect(readFile).toHaveBeenCalled();
  });
});
