from __future__ import division
from __future__ import print_function

from scipy.ndimage.filters import generic_filter
from collections import defaultdict

from raster_ops import extract, reclassify_from_data, geometry_mask

import numpy as np
import csv
import math
import os

CUR_PATH = os.path.dirname(__file__)
DEFAULT_DATA_PATH = os.path.join(CUR_PATH, 'data/cdl_data_grouped.csv')
RASTER_PATH = '/opt/icp-crop-data/cdl_reclass_lzw_5070.tif'

SETTINGS = {}
ABUNDANCE_IDX = 0.1  # A constant for managing wild bee yield
CELL_SIZE = 30
FORAGE_DIST = 670
AG_CLASSES = [12, 16, 17, 18, 20, 27, 33, 46, 47]


def initialize():
    """
    Determine model settings which do not change between requests
    """
    # Nesting and Floral suitability values per CDL crop type
    nesting_reclass, floral_reclass, yield_config = load_crop_data()
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
    SETTINGS['yield'] = yield_config


def load_crop_data(data_src=DEFAULT_DATA_PATH):
    """
    Load the reclassification values for both floral and nesting attributes
    from the CDL CSV.
    """
    with open(data_src, mode='r') as cdl_data:
        reader = csv.reader(cdl_data)
        nesting_reclass = []
        floral_reclass = []
        yield_config = defaultdict(dict)

        hf_idx = 3
        hn_idx = 4
        id_idx = 0

        next(reader, None)  # Skip headers
        for row in reader:
            id = int(row[id_idx])
            nesting_reclass.append([id, float(row[hn_idx])])
            floral_reclass.append([id, float(row[hf_idx])])
            yield_config[id]['demand'] = id / 65  # Temporary unique default
            yield_config[id]['density'] = 2.5  # Temporary default

        return nesting_reclass, floral_reclass, yield_config


def focal_op(x):
    """
    Determine focal center value for the window function.
    """
    return np.sum(x * SETTINGS['effective_dist']/SETTINGS['sum_dist'])


def calc_abundance(cdl):
    """
    Calculate farm abundance based on nesting and floral coefficients for
    various crop types.
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


def yield_calc(crop_id, abundance, managed_hives, config):
    """
    Determines the yield change due to landscape factors related to forage
    and nesting suitability for wild bees and managed honey bee hives.
    Calculate the yield for a single cell position based on values from
    the abundance calcualation and the crop data layer.

    Args:
        crop_id (int): The cell value from the CLD raster
        abundance(float): The cell value of abundance at the same position
            as crop_id
        managed_hives (float): Number of managed hives per acre implemented
        config (dict): Crop specific configuration detailing `demand` the crop
            places on bee pollination and the recommended `density` of hives
            for that crop type
    Returns
        yield (float): The predicted yield for this cell position
    """
    demand = config[crop_id]['demand']
    rec_hives = config[crop_id]['density']

    # Calculate the yield for managed honeybee, keeping a ceiling such
    # that if more hives are used than recommended, yield remains at 1
    yield_hb = (1 - demand) + demand * min(1, managed_hives/rec_hives)

    # Determine the remainig yield to be had from wild bee abundance
    yield_wild = (1 - yield_hb) * (abundance / (ABUNDANCE_IDX + abundance))

    # Determind total yield from all sources of bee pollination
    return yield_hb + yield_wild


def aggregate_crops(yield_field, cdl_field, crops=AG_CLASSES):
    """
    Within the unmasked field portion of the provided yield_field, avg the
    yield quantities per ag type, resulting in a total yield increase per
    relavent crop type on the field and report the yield in terms of average
    crop yield on a scale of 0-100
    Args:
        yield_field (masked ndarray): The bee shed area of computed yield with
            a mask of the field applied.
        cdl (masked ndarray): The raw crop data layer corresponding to the same
            area covered in `yield_field` with a mask of the field applied
        crops (list<int>): Optional. The CDL class types to aggregate on,
            defaults to system specified list

    Returns:
        dict<cld_id, yield_avg>: A mapping of bee pollinated agricultural
            CDL crop types with the avg of their yield across the field
            portion of the yield data, reported on 0-100 scale
    """

    crop_yields = {}
    field_mask = yield_field.mask.copy()

    # Average the yield for each each crop type cell, by crop
    for crop in crops:
        # Create a mask for values that are not this crop type and include
        # the mask which is already applied to non-field areas of AoI
        cdl_mask = np.ma.masked_where(cdl_field != crop, cdl_field).mask
        crop_mask = np.ma.mask_or(field_mask, cdl_mask)

        # Average the yield from this one crop only over the field
        yield_field.mask = crop_mask
        crop_yield = np.ma.mean(yield_field).item() * 100 or 0

        crop_yields[str(crop)] = crop_yield

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
    area_abundance = calc_abundance(cdl)

    # Vectorize the yield function to allow paired element position input
    # from the CDL, area abundance raster, plus user input and system config
    total_yield = np.vectorize(yield_calc, otypes=[np.float16],
                               excluded=['managed_hives', 'config'])

    # Determine yield change due to abundance and managed hives
    yield_area = total_yield(cdl, area_abundance,
                             managed_hives=managed_hives,
                             config=SETTINGS['yield'])

    # Mask the bee shed into just the delineated field
    yield_field = geometry_mask(field_geom, yield_area, affine)
    cdl_field = geometry_mask(field_geom, cdl, affine)

    # Aggregate yield by agricultural cdl type on the field mask
    return aggregate_crops(yield_field, cdl_field)


# Determine settings when module is loaded
if __name__ != '__main__':
    initialize()
