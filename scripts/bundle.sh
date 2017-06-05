#!/bin/bash

# Bundle JS and CSS static assets.

set -e
set -x

ARGS=$*

vagrant ssh app -c "cd /opt/app && \
    envdir /etc/icp.d/env ./bundle.sh $ARGS"
