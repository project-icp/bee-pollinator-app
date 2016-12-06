from __future__ import division

import collections
import numpy as np
import pyproj
import rasterio

from rasterio import features
from affine import Affine
from functools import partial
from shapely.ops import transform


def mask_geom_on_raster(geom, raster_path, mods=None, all_touched=True):
    """"
    For a given polygon, returns a numpy masked array with the intersecting
    values of the raster at `raster_path` unmasked, all non-intersecting
    cells are masked.  This assumes that the input geometry is in the same
    SRS as the raster.  Currently only reads from a single band.
    Args:
        geom (Shapley Geometry): A polygon in the same SRS as `raster_path`
            which will define the area of the raster to mask.
        raster_path (string): A local file path to a geographic raster
            containing values to extract.
        mods (optional list): A list of modifications to make to the source
            raster, provided as json objects containing the following keys:
            geom (geojson): polygon of area where modification should be
                applied.
            newValue (int|float): value to be written over the source raster
                in areas where it intersects geom.  Modifications are applied
                in order, meaning subsequent items can overwrite earlier ones.
        all_touched (optional bool|default: True): If True, the cells value
            will be unmasked if geom interstects with it.  If False, the
            intersection must capture the centroid of the cell in order to be
            unmasked.
    Returns
       Numpy masked array of source raster, cropped to the extent of the
       input geometry, with any modifications applied. Areas where the
       supplied geometry does not intersect are masked.
    """
    # Read a chunk of the raster that contains the bounding box of the
    # input geometry.  This has memory implications if that rectangle
    # is large. The affine transformation maps geom coordinates to the
    # image mask below.
    with rasterio.open(raster_path) as src:
        window, shifted_affine = get_window_and_affine(geom, src)
        data = src.read(1, window=window)

    # Burn new raster values in from provided vector modifications. Mods
    # are applied in order, so later polygons will overwrite previous ones
    # if they overlap
    if mods:
        # This copies over `data` in place.
        for mod in mods:
            features.rasterize(
                [(mod['geom'], mod['newValue'])],
                out=data,
                transform=shifted_affine,
                all_touched=all_touched,
            )

    # Create a numpy array to mask cells which don't intersect with the
    # polygon. Cells that intersect will have value of 0 (unmasked), the
    # rest are filled with 1s (masked)
    geom_mask = features.geometry_mask(
        [geom],
        out_shape=data.shape,
        transform=shifted_affine,
        all_touched=all_touched
    )

    # Mask the data array, with modifications applied, by the query polygon
    return np.ma.array(data=data, mask=geom_mask), shifted_affine


def get_window_and_affine(geom, raster_src):
    """
    Get a rasterio window block from the bounding box of a vector feature and
    calculates the affine transformation needed to map the coordinates of the
    geometry onto a resulting array defined by the shape of the window.
    Args:
        geom (Shapely geometry): A geometry in the spatial reference system
            of the raster to be read.
        raster_src (rasterio file-like object): A rasterio raster source which
            will have the window operation performed and contains the base
            affine transformation.
    Returns:
        A pair of tuples which define a rectangular range that can be provided
        to rasterio for a windowed read
        See: https://mapbox.github.io/rasterio/windowed-rw.html#windowrw
        An Affine object used to transform geometry coordinates to cell values
    """

    # Create a window range from the bounds
    ul = raster_src.index(*geom.bounds[0:2])
    lr = raster_src.index(*geom.bounds[2:4])
    window = ((lr[0], ul[0]+1), (ul[1], lr[1]+1))

    # Create an affine transformation relative to that window.  Still a little
    # opaque to me and lifted from:
    # https://snorfalorpagus.net/blog/2014/11/09/masking-rasterio-layers-with-vector-features/
    t = raster_src.affine
    c = t.c + ul[1] * t.a
    f = t.f + lr[0] * t.e
    shifted_affine = Affine(t.a, t.b, c, t.d, t.e, f)

    return window, shifted_affine


def reproject(geom, to_srs='epsg:5070', from_srs='epsg:4326'):
    """"
    Reproject `geom` from one spatial ref to another
    Args:
        geom (Shapely Geometry): A geometry object with coordinates to
            transform.
        from_srs (string): An EPSG code in the format of `epsg:nnnn` that
            specifies the existing spatial ref for `geom`
        to_srs (string): An EPSG code in the format of `epsg:nnnn` that
            specifies the desired ref for the returned geometry
    Returns:
        Shapely Geometry with coordinates transformed to the desired srs
    """
    projection = partial(
        pyproj.transform,
        pyproj.Proj(init=from_srs),
        pyproj.Proj(init=to_srs),
    )

    return transform(projection, geom)


def reclassify_from_data(layer, substitutions, out=None):
    """
    Reclassifies a raster by substituting all occurences of a value or range of
    values with another provided value.  Substitutions are applied in order.
    Args:
        geom (Shapley Geometry): A polygon in the same SRS as `raster_path`
            which will define the area of interest where the reclass is applied
        raster_path (string): A  local file path to a geographic raster
            containing values reclassify.
        substitutions (list<[oldVal, newval]>): A list of pairs whose first
            index represents the old value to be replaced with the value in
            the second index.  If oldVal is an iterable, it will create an
            inclusive range of values for reclassification:
               [11, 1]: all 11 values will be replaced by 1
               [[90,99], 9]: all values >= 90 & <=99 will be replaced by 9
    Returns:
        Numpy masked array of the results of making the changes defined for
        all cells represented by `substitutions`
    """
    # For every range or direct replacement, copy over existing values
    reclassed = out
    if out is None:
        reclassed = layer

    for reclass in substitutions:
        old, new = reclass

        if isinstance(old, collections.Iterable):
            low, high = old
            expression = np.ma.where((low <= layer) & (layer <= high))
        else:
            expression = np.ma.where(old == layer)

        reclassed[expression] = new

    return reclassed
