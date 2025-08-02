#! /usr/bin/env bash
cd "$(dirname "$0")"

CONTAINER_ID="$(docker run --rm -d --network readyprep --env-file=server/.env -p 3000:3000 readyprep-api-staging)"

function stop ( ) {
  docker stop -t0 "$CONTAINER_ID" &>/dev/null
  echo
}

trap stop SIGINT

docker logs -f "$CONTAINER_ID"

