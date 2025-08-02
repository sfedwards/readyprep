#! /usr/bin/env bash

# Exit when any command fails
set -e

cd "$(dirname "$0")"

pushd client
npm run build:"$ENV"
popd

pushd server
npm run build
popd

docker build -t readyprep-api-"$ENV":latest .
