#!/bin/bash

set -e
set -x

usage="$(basename "$0") [-h] [-b] [-f] \n
--Sets up a postgresql database \n
\n
where: \n
    -h  show this help text\n
    -b  load/reload bee data\n
    -f  load/reload a specific file\n
"

# HTTP accessible storage for initial app data
FILE_HOST="https://s3.amazonaws.com/data.icp.azavea.com"
file_to_load=
load_bee_data=false

while getopts ":hmf:" opt; do
    case $opt in
        h)
            echo -e $usage
            exit ;;
        b)
            load_bee_data=true ;;
        f)
            file_to_load=$OPTARG ;;
        \?)
            echo "invalid option: -$OPTARG"
            exit ;;
    esac
done

# Export settings required to run psql non-interactively
export PGHOST=$(cat /etc/icp.d/env/ICP_DB_HOST)
export PGDATABASE=$(cat /etc/icp.d/env/ICP_DB_NAME)
export PGUSER=$(cat /etc/icp.d/env/ICP_DB_USER)
export PGPASSWORD=$(cat /etc/icp.d/env/ICP_DB_PASSWORD)
export PUBLIC_HOSTED_ZONE_NAME=$(cat /etc/icp.d/env/ICP_PUBLIC_HOSTED_ZONE_NAME)

# Ensure that the PostGIS extension exists
psql -c "CREATE EXTENSION IF NOT EXISTS postgis;"
psql -c "ALTER TABLE spatial_ref_sys OWNER TO ${PGUSER};"

# Run migrations
envdir /etc/icp.d/env /opt/app/manage.py migrate

function download_and_load {
    for f in "${FILES[@]}"; do
        curl -s $FILE_HOST/$f | gunzip -q | psql --single-transaction
    done
}

if [ ! -z "$file_to_load" ] ; then
    FILES=("$file_to_load")
    download_and_load $FILES
fi

if [ "$load_bee_data" = "true" ] ; then
    # Fetch map shed specific vector features
    FILES=("bee_pollinator_data.sql.gz")

    download_and_load $FILES
fi
