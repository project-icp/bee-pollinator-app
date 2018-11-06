# -*- coding: utf-8 -*-
from __future__ import division

import rasterio
from pyproj import Proj


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
    try:
        with rasterio.open(raster_path, mode='r') as src:
            # reproject latlon to coords in the same SRS as the target raster
            to_proj = Proj(src.crs)
            x, y = to_proj(geom['lng'], geom['lat'])

            # Sample the raster at the given coordinates
            value_gen = src.sample([(x, y)], indexes=[1])
            value = value_gen.next().item(0)
    except rasterio.RasterioIOError:
        return 0
    return value
