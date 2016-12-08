from __future__ import division
from __future__ import print_function

from raster_ops import extract, reclassify_from_data

from scipy.ndimage.filters import generic_filter
import numpy as np
import csv
import math
import os

CUR_PATH = os.path.dirname(__file__)
DEFAULT_DATA_PATH = os.path.join(CUR_PATH, 'data/cdl_data.csv')
RASTER_PATH = '/opt/icp-crop-data/cdl_5070.tif'

SETTINGS = {}
CELL_SIZE = 30
FORAGE_DIST = 670


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
    Load reclassification instructions from crop data
    """
    with open(data_src, mode='r') as cdl_data:
        reader = csv.reader(cdl_data)
        nesting_reclass = []
        floral_reclass = []

        next(reader, None)  # Skip headers
        for row in reader:
            nesting_reclass.append([int(row[0]), float(row[4])])
            floral_reclass.append([int(row[0]), float(row[5])])

        return nesting_reclass, floral_reclass


def focal_op(x):
    """
    Determine focal center value
    """
    return np.sum(x * SETTINGS['effective_dist']/SETTINGS['sum_dist'])


def abundance(field_geom, raster_path=RASTER_PATH):
    """
    Calculate farm abundance
    """
    # Read in the crop raster and mask field geom on it.
    cdl, a = extract(field_geom, raster_path)

    fl_out = np.zeros(shape=cdl.shape, dtype=np.float32)
    n_out = np.zeros(shape=cdl.shape, dtype=np.float32)
    floral = reclassify_from_data(cdl, SETTINGS['floral_reclass'], fl_out)
    nesting = reclassify_from_data(cdl, SETTINGS['nesting_reclass'], n_out)

    forage = generic_filter(floral, footprint=SETTINGS['window'],
                            function=focal_op)
    source = forage * nesting
    farm = generic_filter(source, footprint=SETTINGS['window'],
                          function=focal_op)
    return np.sum(farm)


# Determine settings when module is loaded
if __name__ != '__main__':
    initialize()
