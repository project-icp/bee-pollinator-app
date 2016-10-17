#!/bin/bash

set -e
set -x

usage="$(basename "$0") [-h] [-b] [-s] \n
--Sets up a postgresql database for MMW \n
\n
where: \n
    -h  show this help text\n
    -b  load/reload boundary data\n
    -f  load a named boundary sql.gz\n
    -s  load/reload stream data\n
    -d  load/reload DRB stream data\n
    -m  load/reload mapshed data\n
    -p  load/reload DEP data\n
    -q  load/reload water quality data\n
"

# HTTP accessible storage for initial app data
FILE_HOST="https://s3.amazonaws.com/data.mmw.azavea.com"
load_boundary=false
file_to_load=
load_stream=false
load_mapshed=false
load_water_quality=false

while getopts ":hbsdpmqf:" opt; do
    case $opt in
        h)
            echo -e $usage
            exit ;;
        b)
            load_boundary=true ;;
        s)
            load_stream=true ;;
        d)
            load_drb_streams=true ;;
        p)
            load_dep=true ;;
        m)
            load_mapshed=true ;;
        q)
            load_water_quality=true ;;
        f)
            file_to_load=$OPTARG ;;
        \?)
            echo "invalid option: -$OPTARG"
            exit ;;
    esac
done

# Export settings required to run psql non-interactively
export PGHOST=$(cat /etc/mmw.d/env/MMW_DB_HOST)
export PGDATABASE=$(cat /etc/mmw.d/env/MMW_DB_NAME)
export PGUSER=$(cat /etc/mmw.d/env/MMW_DB_USER)
export PGPASSWORD=$(cat /etc/mmw.d/env/MMW_DB_PASSWORD)
export PUBLIC_HOSTED_ZONE_NAME=$(cat /etc/mmw.d/env/MMW_PUBLIC_HOSTED_ZONE_NAME)

# Ensure that the PostGIS extension exists
psql -c "CREATE EXTENSION IF NOT EXISTS postgis;"
psql -c "ALTER TABLE spatial_ref_sys OWNER TO ${PGUSER};"

# Run migrations
envdir /etc/mmw.d/env /opt/app/manage.py migrate

function download_and_load {
    for f in "${FILES[@]}"; do
        curl -s $FILE_HOST/$f | gunzip -q | psql --single-transaction
    done
}

if [ ! -z "$file_to_load" ] ; then
    FILES=("$file_to_load")
    download_and_load $FILES
fi

if [ "$load_dep" = "true" ] ; then
    # Fetch DEP layers
    FILES=("dep_urban_areas.sql.gz" "dep_municipalities.sql.gz")

    download_and_load $FILES
fi


if [ "$load_boundary" = "true" ] ; then
    # Fetch boundary layer sql files
    FILES=("boundary_county.sql.gz" "boundary_school_district.sql.gz" "boundary_district.sql.gz" "boundary_huc12.sql.gz" "boundary_huc10.sql.gz" "boundary_huc08.sql.gz")

    download_and_load $FILES
fi

if [ "$load_stream" = "true" ] ; then
    # Fetch stream network layer sql files
    FILES=("nhdflowline.sql.gz")

    download_and_load $FILES
fi

if [ "$load_drb_streams" = "true" ] ; then
    # Fetch DRB stream network layer sql file
    FILES=("drb_streams_50.sql.gz")

    download_and_load $FILES
fi

if [ "$load_mapshed" = "true" ] ; then
    # Fetch map shed specific vector features
    FILES=("ms_weather.sql.gz" "ms_weather_station.sql.gz" "ms_pointsource.sql.gz"
           "ms_pointsource_drb.sql.gz" "ms_county_animals.sql.gz")

    download_and_load $FILES
fi

if [ "$load_water_quality" = "true" ] ; then
    # Fetch water quality data
    FILES=("nhd_water_quality.sql.gz" "drb_catchment_water_quality.sql.gz")

    download_and_load $FILES
fi
