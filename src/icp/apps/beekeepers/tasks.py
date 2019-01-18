# -*- coding: utf-8 -*-
from __future__ import division
import os

import boto3
import rasterio
from pyproj import Proj
import psycopg2


PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
HOST = os.environ.get('ICP_DB_HOST')
DB_USER = os.environ.get('ICP_DB_USER')
DB_PW = os.environ.get('ICP_DB_PASSWORD')
DB_NAME = os.environ.get('ICP_DB_NAME')


def sample_at_point(geom, raster_path):
    """
    Return the cell value for a raster at a provided lat lon coordinate.

    :param geom: An EPSG:4326 point at which to extract the cell value
                 from the target raster.
    :param raster_path: A file path to a geographic raster containing
                        the value to extract.

    :type geom: Dict with lat and lon values, like {lat: float, lon: float}
    :type raster_path: String
    """
    with gdal_configured_credentials():
        try:
            with rasterio.open(raster_path, mode='r') as src:
                # Reproject latlon to coords in the same SRS as the
                # target raster
                to_proj = Proj(src.crs)
                x, y = to_proj(geom['lng'], geom['lat'])

                # Sample the raster at the given coordinates
                value_gen = src.sample([(x, y)], indexes=[1])
                value = value_gen.next().item(0)
        except rasterio.RasterioIOError as e:
            return ({
                "data": None,
                "error": e.message
            })

    return ({
        "data": value,
        "error": None
    })


class gdal_configured_credentials():
    """
    A context manager which ensures any environment variables containing AWS
    credentials are cleared after the context is closed.
    These must be set again in order for GDAL vsis3 file handlers to work, but
    when running in production, their presence affects how boto will acquire
    new credentials.
    """

    def remove_env_vars(self):
        """Clear all AWS environment variables"""

        if 'AWS_ACCESS_KEY_ID' in os.environ:
            del os.environ['AWS_ACCESS_KEY_ID']

        if 'AWS_SECRET_ACCESS_KEY' in os.environ:
            del os.environ['AWS_SECRET_ACCESS_KEY']

        if 'AWS_SESSION_TOKEN' in os.environ:
            del os.environ['AWS_SESSION_TOKEN']

    def create_new_env_vars(self):
        """
        Fetch new AWS credentials and supply them to the environment variables
        which GDAL will use for vsis3 requests
        """
        credentials = boto3.Session().get_credentials()
        os.environ['AWS_ACCESS_KEY_ID'] = credentials.access_key
        os.environ['AWS_SECRET_ACCESS_KEY'] = credentials.secret_key

        # In dev, the token won't be available. In prod, this should be
        # provided via the instance metadata
        if credentials.token:
            os.environ['AWS_SESSION_TOKEN'] = credentials.token

    def __enter__(self):
        """Context manager start"""
        self.remove_env_vars()
        self.create_new_env_vars()

    def __exit__(self, *args):
        """Context manager close"""
        self.remove_env_vars()


def export_survey_tables():
    """Export all types of beekeepers surveys to CSVs."""

    db_options = "dbname={} user={} host={} password={}".format(
        DB_NAME, DB_USER, HOST, DB_PW
    )
    connection = psycopg2.connect(db_options)
    cur = connection.cursor()

    tables = dict(
        novembersurvey=None,
        aprilsurvey=None,
        monthlysurvey=None,
        usersurvey="""
            SELECT auth_user.username AS username, auth_user.email AS email,
            beekeepers_usersurvey.*
            FROM beekeepers_usersurvey
            INNER JOIN auth_user ON beekeepers_usersurvey.user_id=auth_user.id
        """,
        survey="""
            SELECT beekeepers_survey.*, beekeepers_apiary.lat AS lat,
            beekeepers_apiary.lng AS lng
            FROM beekeepers_survey
            INNER JOIN beekeepers_apiary
            ON beekeepers_survey.apiary_id=beekeepers_apiary.id
        """,
    )
    # collect output CSVs to dedicated folder
    dir = os.path.join(PROJECT_ROOT, 'exports')
    if not os.path.exists(dir):
        os.mkdir(dir)

    for table, query in tables.iteritems():
        if query is None:
            query = "SELECT * FROM beekeepers_{}".format(table)
        output_query = "COPY ({0}) TO STDOUT WITH CSV HEADER".format(query)

        filename = "{}/{}.csv".format(dir, table)
        with open(filename, 'w') as f:
            cur.copy_expert(output_query, f)

    connection.close()
