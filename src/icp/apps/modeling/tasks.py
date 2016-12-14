# -*- coding: utf-8 -*-
from __future__ import print_function
from __future__ import unicode_literals
from __future__ import absolute_import

import logging
import json

from celery import shared_task

logger = logging.getLogger(__name__)

BUFFER_DIST = 2000
SRS = 'epsg:5070'


@shared_task
def calculate_yield(model_input):
    """
    For a field geometry, buffer the area by factor of a bees foraging
    distance.  The bee shed area is modeled for abundance, and the
    field within that shed is then used to calcualate crop yields.
    """
    from pollinator import crop_yield
    from pollinator.raster_ops import reproject
    from shapely.geometry import shape

    # Parse the model input from the request
    aoi_json = model_input['area_of_interest']
    managed_hives = model_input['inputs'][0]['value']
    mods = model_input['modification_pieces']

    modifications = [
        {
            'geom': reproject(shape(mod['shape']['geometry']), SRS),
            'value': mod['value']
        }
        for mod in mods
    ]

    # Buffer the field geometry to a larger bee shed area
    field_geom = reproject(shape(aoi_json), SRS)
    bee_shed_geom = field_geom.buffer(BUFFER_DIST)

    yields = crop_yield.calculate(bee_shed_geom, field_geom,
                                  modifications, managed_hives)
    return json.dumps(yields)
