#!/bin/sh
# taken from build-package.sh, since it appears to cause OOM on Travis CI
echo "Linting package using eslint..."
./node_modules/.bin/eslint lib
rc=$?; if [ $rc -ne 0 ]; then exit $rc; fi
