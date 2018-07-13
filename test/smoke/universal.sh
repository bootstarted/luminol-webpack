#!/bin/sh -e

trap "exit" INT TERM
trap "kill 0" EXIT

export DEBUG="luminol:* luminol-webpack:*"

./node_modules/.bin/luminol \
  --ui=false \
  --config ./demo/webpack/client.webpack.config.js \
  --config ./demo/webpack/server.webpack.config.js \
  --clipboard false \
  --port 7653 &

sleep 5

echo "Testing server process..."
curl -sf http://localhost:7653 | grep -q "Hello world."

echo "Testing client assets..."
curl -sf http://localhost:7653/js/main.js > /dev/null

echo "Done."

exit 0
