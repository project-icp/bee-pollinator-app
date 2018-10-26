# -*- coding: utf-8 -*-
from __future__ import division

import os

from rest_framework import decorators
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from tasks import sample_at_point


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


@decorators.api_view(['POST'])
@decorators.permission_classes((AllowAny, ))
def fetch_data(request):
    """
    Return the cell values from rasters on s3.

    TODO: Receive validated geom, forage range, and filename(s) from the
    request
    """
    geom = {
        'lat': 39.9473832311,
        'lon': -76.9297742315,
    }
    forage_range = '3k'

    filenames_at_buffer = FILENAMES[forage_range]
    resp = {}
    for filename in filenames_at_buffer:
        s3_url = 's3://{}/{}/{}'.format(DATA_BUCKET, forage_range, filename)
        value = sample_at_point(geom, s3_url)
        resp.update({filename: value})

    return Response(resp)
