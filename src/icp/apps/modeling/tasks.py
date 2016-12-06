# -*- coding: utf-8 -*-
from __future__ import print_function
from __future__ import unicode_literals
from __future__ import absolute_import

import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task
def calculate_yield(model_input):
    from pollinator import crop_yield
    from pollinator.raster_ops import reproject
    from shapely.geometry import shape

    aoi_json = model_input['area_of_interest']
    geom = reproject(shape(aoi_json), 'epsg:5070')

    return crop_yield.abundance(geom).item()
