#!/bin/sh -e

trap "exit" INT TERM
trap "kill 0" EXIT

export DEBUG="meta-serve:*"

chmod +x ./bin/meta-serve.js

./bin/meta-serve.js \
  --ui=false \
  --config ./demo/webpack/client.webpack.config.js \
  --content ./demo \
  --clipboard false \
  --port 7653 &

sleep 5

echo "Testing static content..."
curl -sf http://localhost:7653 | grep -q "Hello world."

echo "Testing client assets..."
curl -sf http://localhost:7653/js/main.js > /dev/null

echo "Done."

exit 0
