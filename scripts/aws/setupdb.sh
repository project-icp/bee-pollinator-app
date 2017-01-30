#!/bin/bash

set -e
set -x

usage="$(basename "$0") [-h] \n
--Sets up a postgresql database \n
\n
where: \n
    -h  show this help text\n
"

# Export settings required to run psql non-interactively
export PGHOST=$(cat /etc/icp.d/env/ICP_DB_HOST)
export PGDATABASE=$(cat /etc/icp.d/env/ICP_DB_NAME)
export PGUSER=$(cat /etc/icp.d/env/ICP_DB_USER)
export PGPASSWORD=$(cat /etc/icp.d/env/ICP_DB_PASSWORD)

# Ensure that the PostGIS extension exists
psql -c "CREATE EXTENSION IF NOT EXISTS postgis;"
psql -c "ALTER TABLE spatial_ref_sys OWNER TO ${PGUSER};"

# Run migrations
envdir /etc/icp.d/env /opt/app/manage.py migrate
