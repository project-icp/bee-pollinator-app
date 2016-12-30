from __future__ import print_function
from __future__ import division

import numpy as np
import rasterio
import sys
import json

from copy import copy
from datetime import datetime
from subprocess import call

from cdl_colormap import COLORMAP

# When you want to test changes on a smaller raster use:
# src_path = '../../../tests/data/cdl_test.tif'
# instead and comment out the setting of the blocksize
SRC_PATH = '/opt/icp-crop-data/cdl_5070.tif'
DST_PATH = './cdl_reclass.tif'
FINAL_PATH = './cdl_reclass_lzw_5070.tif'

# If set to True, the written cells are verified after each
# block but will slow down the execution considerably
DEBUG = False


def init():
    with rasterio.open(SRC_PATH) as src:
        new_meta = copy(src.meta)
        # Make sure the block size is carried over to the new raster
        # and the compression is not
        new_meta.update(blockxsize=src.block_shapes[0][0],
                        blockysize=src.block_shapes[0][1],
                        tiled='yes', compress='none')

        with rasterio.open(DST_PATH, 'w', **new_meta) as dst:
            # Add a colormap based on the original raster's values
            # but where each id's color is unique
            dst.write_colormap(1, COLORMAP)

            # This script takes a while to run, so set up for printing
            # its progress
            count = 0
            total = 113778  # the number of windows in the national cdl raster

            with open('./cdl_reclass_map.json', 'r') as reclass_map_json:
                reclass_map = json.loads(reclass_map_json.read())

                for ji, window in src.block_windows(1):
                    data = src.read(1, window=window)
                    reclass_data = data.copy()

                    for key, reclass_values in reclass_map.iteritems():
                        # Create a mask for all cells equal to one of
                        # the current key's reclassify values
                        mask = np.in1d(data, reclass_values).reshape(data.shape)
                        reclass_data[mask] = int(key)

                    dst.write_band(1, reclass_data, window=window)

                    if DEBUG:
                        check_assignment(data, reclass_data, reclass_map)

                    count += 1
                    print_progress(count, total)

    post_process()


def post_process():
    """ Compress and tile the new output raster at 512x512 with LZW"""

    cmd = 'gdalwarp \
            -ot Byte -dstnodata 0 \
            -t_srs "epsg:5070" \
            -co "TILED=YES" \
            -co "BLOCKXSIZE=512" \
            -co "BLOCKYSIZE=512" \
            -co "COMPRESS=LZW" {} {}'

    call(cmd.format(DST_PATH, FINAL_PATH), shell=True)


def check_assignment(old_data, new_data, reclass_map):
    for new_cell, old_cell in zip(np.ravel(new_data), np.ravel(old_data)):
        if (new_cell != 0):
            assert(old_cell in reclass_map[str(new_cell)])


def print_progress(count, total, frequency=1000):
    if count % frequency == 0:
        print('(', count, '/', total, '):', datetime.now())


if __name__ == '__main__':
    msg = """
       Uses output of `group_cdl_data.py` to reclassify the CDL raster.
       Exports a new `cdl_reclass.tif`

       If you're running this from the VM you may need to update v.memory
       to 4096

       Takes no arguments but expects to have access to CDL raster at:
           `/opt/icp-crop-data/cdl_5070.tif`
    """
    if len(sys.argv) > 1:
        print('\nUsage:', msg)
        sys.exit()

    init()
