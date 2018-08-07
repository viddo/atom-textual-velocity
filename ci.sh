#!/bin/sh

set -e

n=1
while true
do
  echo "Testing..."

  bash build-package.sh && npm run test:ci && break

  if [ $n -lt 3 ]; then
    echo "Tests attempt $n failed! Trying again in $n seconds"
    n="$[$n+1]"
    sleep "$n"
  else
    echo "Last tests attempt failed, quitting"
    break
  fi
done
