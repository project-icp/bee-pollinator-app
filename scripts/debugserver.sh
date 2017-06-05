#!/bin/bash

# Run a gunicorn webserver with expanded logging and auto-restart

set -e
set -x

vagrant ssh app -c "sudo service icp-app stop || /bin/true"
vagrant ssh app -c "cd /opt/app/ && envdir /etc/icp.d/env gunicorn --config /etc/icp.d/gunicorn.py icp.wsgi"
vagrant ssh app -c "sudo start icp-app"
