# -*- coding: utf-8 -*-
from __future__ import division

import os
import rasterio
from pyproj import Proj

from rest_framework import decorators
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

DATA_BUCKET = os.environ['AWS_BEEKEEPERS_DATA_BUCKET']
# TODO: Move the filenames somewhere more permanent in the front end.
# Filenames will eventually be sent to the fetch_data endpoint
FILENAMES = {
    '3k': [
        'pesticide_3k.tif',
        'forage_spring_3k.tif',
        'forage_sum_3k.tif',
        'forage_fall_3k.tif'
    ],
    '5k': [
        'forage_spring_5k.tif',
        'forage_sum_5k.tif',
        'forage_fall_5k.tif'
    ]
}


def sample_at_point(geom, raster_path):
    """
    Return the cell value for a raster at a provided lat lon coordinate
    Args:
        geom({x: float, y: float}): A EPSG:4326 point in the same SRS as the
            target raster defining the point to extract the cell value.
        raster_path (string): A file path to a geographic raster
            containing the value to extract.
    Returns:
        The cell value, in the data type of the input raster, at the point geom
    """
    with rasterio.open(raster_path, mode='r') as src:
        # reproject xy to coords in the same SRS as the target raster
        to_proj = Proj(src.crs)
        x, y = to_proj(geom['y'], geom['x'])

        # Sample the raster at the given coordinates
        value_gen = src.sample([(x, y)], indexes=[1])
        value = value_gen.next().item(0)
        return value


@decorators.api_view(['POST'])
@decorators.permission_classes((AllowAny, ))
def fetch_data(request):
    """
    Return the cell values from rasters on s3

    TODO: Receives validated geom, forage range, and filename(s) from the
    request
    """
    geom = {
        'x': 39.9473832311,
        'y': -76.9297742315,
    }
    forage_range = '3k'

    filenames_at_buffer = FILENAMES[forage_range]
    resp = {}
    for filename in filenames_at_buffer:
        s3_url = 's3://{}/{}/{}'.format(DATA_BUCKET, forage_range, filename)
        value = sample_at_point(geom, s3_url)
        resp.update({filename: value})

    return Response(resp)
