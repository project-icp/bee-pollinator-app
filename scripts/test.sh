#!/bin/bash

# run the whole suite of app tests (for use in development or CI)

set -e
set -x

# Run flake8 against the Django codebase and output a known string so that
# the Jenkins text finder plugin can detect a failed check and mark the build
# unstable. This command should only fail the build if the `vagrant ssh`
# command itself fails.
 vagrant ssh app -c "flake8 /opt/app/apps --exclude migrations,node_modules || echo flake8 check failed"

# Run the Django test suite with --noinput flag.
 vagrant ssh app -c "cd /opt/app && envdir /etc/icp.d/env ./manage.py test --noinput"

# Run flake8 against the pollinator model
vagrant ssh app -c "flake8 /opt/app/pollinator --exclude build || echo flake8 check failed"

# Run the pollinator model tests
vagrant ssh worker -c "cd /opt/app/pollinator && python tests/tests.py"

# Check for client-side JS lint.
vagrant ssh app -c "cd /opt/app && npm run lint"

# Run JS unit tests.
# vagrant ssh app -c "cd /var/www/icp/static &&
#    xvfb-run /opt/app/node_modules/.bin/testem -f /opt/app/testem.json ci"
# vagrant ssh app -c "cd /var/www/icp/static &&
#     xvfb-run /opt/app/node_modules/.bin/testem -f /opt/app/testem.json ci Firefox $*"
