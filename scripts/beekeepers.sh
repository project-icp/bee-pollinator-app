#!/bin/bash

# Run Yarn commands for Beekeepers

set -e
set -x

ARGS=$*

vagrant ssh app -c "cd /opt/app/apps/beekeepers && \
    envdir /etc/icp.d/env ./yarn.sh $ARGS"
