#!/bin/bash

set -e

ARGS=$*

docker run -it --rm --name beekeepers-node \
           --publish 35729:35729/tcp \
           --volume "$PWD":/usr/src/app \
           --workdir /usr/src/app \
           node:8 \
           yarn ${ARGS}
