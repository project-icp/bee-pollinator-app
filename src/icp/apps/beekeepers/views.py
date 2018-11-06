# -*- coding: utf-8 -*-
from __future__ import division

import os

from rest_framework import decorators
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from tasks import sample_at_point


DATA_BUCKET = os.environ['AWS_BEEKEEPERS_DATA_BUCKET']


@decorators.api_view(['POST'])
@decorators.permission_classes((AllowAny, ))
def fetch_data(request):
    """
    Return the cell values from rasters on s3.

    :param location: Dict with lat and lng values, like {lat: float, lng: float}
    :param forage_range: A string value of "3k" or "5k"
    :param filenames: A dict of base raster filenames, like {"FORAGE": forage_range"}
    """

    location = request.DATA['location']
    forage_range = request.DATA['forage_range']
    filenames = ['{}_{}.tif'.format(v, forage_range) for k,v in request.DATA['filenames'].items()]

    resp = {}
    for filename in filenames:
        s3_url = 's3://{}/{}/{}'.format(DATA_BUCKET, forage_range, filename)
        value = sample_at_point(location, s3_url)
        resp.update({filename: value})

    return Response(resp)
