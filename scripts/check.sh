#!/bin/bash

# Run flake8 against the Django codebase

set -e
set -x

vagrant ssh app -c "(flake8 /vagrant/scripts/colors && flake8 /opt/app/apps --exclude migrations,node_modules) || echo flake8 check failed"
