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
    Return the cell values from rasters on s3 and any errors.

    :param location: Dict with lat and lng values, i.e {lat: float, lng: float}
    :param forage_range: A string value of "3km" or "5km"
    :param indicators: An array of indicator names corresponding to s3 rasters
    """

    location = request.DATA['location']
    forage_range = request.DATA['forage_range']
    indicators = request.DATA['indicators']

    resp = {}
    for indicator in indicators:
        s3_filename = '{}_{}.tif'.format(indicator, forage_range)
        s3_url = 's3://{}/{}/{}'.format(DATA_BUCKET, forage_range, s3_filename)
        data = sample_at_point(location, s3_url)
        resp.update({indicator: data})

    return Response(resp)
