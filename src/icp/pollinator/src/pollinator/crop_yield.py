from __future__ import division
from __future__ import print_function

from raster_ops import extract, reclassify_from_data, geometry_mask

from scipy.ndimage.filters import generic_filter
import numpy as np
import csv
import math
import os

CUR_PATH = os.path.dirname(__file__)
DEFAULT_DATA_PATH = os.path.join(CUR_PATH, 'data/cdl_data_grouped.csv')
RASTER_PATH = '/opt/icp-crop-data/cdl_5070.tif'

SETTINGS = {}
CELL_SIZE = 30
FORAGE_DIST = 670
AG_CLASSES = [46, 50, 54, 66, 67, 68, 69, 72, 74, 75, 76, 77, 204, 209, 212, 213, 217, 218, 220, 221, 222, 223, 229, 242, 249]  # noqa


def initialize():
    """
    Determine model settings which do not change between requests
    """
    # Nesting and Floral suitability values per CDL crop type
    nesting_reclass, floral_reclass = load_reclass()
    max_dist = FORAGE_DIST * 2

    # Boundary of matrix for focal window, essentially the number of
    # cells a bee can travel
    radius = int(round(max_dist/CELL_SIZE)) * 2 + 1
    window = np.ones(shape=(radius, radius))
    dist_matrix = np.empty(shape=(radius, radius), dtype=np.float32)
    focal_center = int(round(radius/2))

    # Set cell values to their distance to center of focal window
    for (i, j), _ in np.ndenumerate(dist_matrix):
        x, y = i+1, j+1
        dist_matrix[i, j] = math.sqrt(
            ((x-0.5) * CELL_SIZE - (focal_center-0.5) * CELL_SIZE)**2 +
            ((y-0.5) * CELL_SIZE - (focal_center-0.5) * CELL_SIZE)**2)

    distances = dist_matrix.ravel()
    effective_dist = np.exp(-distances / FORAGE_DIST)

    # Where the effective distance > max forage distance, set 0
    effective_dist[np.where(distances > max_dist)] = 0
    sum_dist = np.sum(effective_dist)

    # These settings are valid against all requests and only need to
    # be computed once.
    SETTINGS['effective_dist'] = effective_dist
    SETTINGS['sum_dist'] = sum_dist
    SETTINGS['window'] = window
    SETTINGS['floral_reclass'] = floral_reclass
    SETTINGS['nesting_reclass'] = nesting_reclass


def load_reclass(data_src=DEFAULT_DATA_PATH):
    """
    Load the reclassification values for both floral and nesting attributes
    from the CDL CSV.
    """
    with open(data_src, mode='r') as cdl_data:
        reader = csv.reader(cdl_data)
        nesting_reclass = []
        floral_reclass = []
        hf_idx = 3
        hn_idx = 4
        id_idx = 0

        next(reader, None)  # Skip headers
        for row in reader:
            nesting_reclass.append([int(row[id_idx]), float(row[hn_idx])])
            floral_reclass.append([int(row[id_idx]), float(row[hf_idx])])

        return nesting_reclass, floral_reclass


def focal_op(x):
    """
    Determine focal center value for the window function.
    """
    return np.sum(x * SETTINGS['effective_dist']/SETTINGS['sum_dist'])


def abundance(cdl):
    """
    Calculate farm abundance.
    """

    # Create floral and nesting rasters derived from the CDL
    fl_out = np.zeros(shape=cdl.shape, dtype=np.float32)
    n_out = np.zeros(shape=cdl.shape, dtype=np.float32)
    floral = reclassify_from_data(cdl, SETTINGS['floral_reclass'], fl_out)
    nesting = reclassify_from_data(cdl, SETTINGS['nesting_reclass'], n_out)

    # Create an abundance index based on forage and nesting indexes
    # over the area a bee may travel
    forage = generic_filter(floral, footprint=SETTINGS['window'],
                            function=focal_op)
    source = forage * nesting
    area_abundance = generic_filter(source, footprint=SETTINGS['window'],
                                    function=focal_op)
    return area_abundance


def apply_managed_hives(field_abundance, hives):
    """
    Applies a function to equally distribute managed honey bee hives across
    a field.
    """
    return field_abundance


def yield_calc(abundance_field):
    """
    Determines the yield change due to landscape factors related to forage
    and nesting suitability for wild bees and managed honey bee hives.
    """

    return abundance_field


def aggregate_crops(yield_field, cdl, crops=AG_CLASSES):
    """
    Within the unmasked field portion of the provided ndarray, sum the yield
    quantities per ag type, resulting in a total yield increase per relavent
    crop type on the field.

    Args:
        yield_field (masked ndarray): The bee shed area of computed yield with
            a mask of the field applied.
        cdl (ndarray): The raw crop data layer corresponding to the same area
            covered in `yield_field`
        crops (list<int>): Optional. The CDL class types to aggregate on,
            defaults to system specified list

    Returns:
        dict<cld_id, yield_sum>: A mapping of bee pollinated agricultural
            CDL crop types with the sum of their yield across the field
            portion of the yield data.
    """
    crop_yields = {}
    field_mask = yield_field.mask.copy()

    for crop in crops:
        # Create a mask for values that are not this crop type and include
        # the mask which is already applied to non-field areas of AoI
        cdl_mask = np.ma.masked_where(cdl != crop, cdl).mask
        crop_mask = np.ma.mask_or(field_mask, cdl_mask)

        # Sum the yield from this one crop only over the field
        yield_field.mask = crop_mask
        crop_yields[str(crop)] = np.ma.sum(yield_field).item()

    # Restore the original mask of just the field
    yield_field.mask = field_mask
    return crop_yields


def calculate(bee_shed_geom, field_geom, modifications, managed_hives,
              raster_path=RASTER_PATH):
    """
    Calculate the change in specific crop yield due to bee abundance
    """
    # Read in the crop raster clipped to the bee shed geometry
    cdl, affine = extract(bee_shed_geom, raster_path, modifications)

    # Determine pollinator abundance across the entire area
    area_abundance = abundance(cdl)

    # Clip the bee shed into just the delineated field
    field_abundance = geometry_mask(field_geom, area_abundance, affine)

    # Apply stocking density function for managed hives
    stocked_abundance = apply_managed_hives(field_abundance, managed_hives)

    # Apply yield function
    yield_field = yield_calc(stocked_abundance)

    # Aggregate yield by agricultural cdl type
    return aggregate_crops(yield_field, cdl)


# Determine settings when module is loaded
if __name__ != '__main__':
    initialize()
