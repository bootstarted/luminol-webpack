import {request, send, listen} from 'midori';
const urlJoin = require('url-join');

const getScripts = (stats) => {
  const main = !Array.isArray(stats.assetsByChunkName.main)
    ? [stats.assetsByChunkName.main]
    : stats.assetsByChunkName.main;
  const entries = main.map((path) => urlJoin(stats.publicPath, path));
  return entries
    .map((path) => {
      return `<script src="${path}"></script>`;
    })
    .join('\n');
};

const app = request(async () => {
  return send(
    200,
    {'Content-Type': 'text/html; charset=utf-8'},
    `
        <!DOCTYPE html>
        <html>
          <body>
            Hello world we are at ${0} bytes.
            ${getScripts({assetsByChunkName: {}})}
          </body>
        </html>
      `,
  );
});

listen(app, process.env.PORT, () => {
  console.log('Demo app listening.');
});
