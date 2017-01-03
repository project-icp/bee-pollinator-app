from __future__ import print_function
from __future__ import division

import os
import rasterio
import sys
from cdl_colormap import COLORMAP

DST_PATH = '/opt/icp-crop-data/cdl_reclass_lzw_5070.tif'


# from http://stackoverflow.com/a/3380739
def convert_rgb_to_hex(rgb):
    return '#%02x%02x%02x' % rgb


# For creating css variables
def create_hex_colormap():
    return { key: convert_rgb_to_hex(rgb)
        for key, rgb in COLORMAP.iteritems() }


def init():
    with rasterio.open(DST_PATH, 'r+') as dst:
        # Write the new colormap to the file
        dst.write_colormap(1, COLORMAP)

    # Something about opening with r+ results in rasterio
    # creating an auxillary file that sets the color-interop to
    # gray. Delete the file so it doesn't trip up QGIS
    auxillary_file_path = DST_PATH + '.aux.xml'
    if os.path.exists(auxillary_file_path):
        os.remove(auxillary_file_path)


if __name__ == '__main__':
    msg = """
    Applies the colors in `cdl_colormap.py` to the reclassified raster
    in `/opt/icp-crop-data/cdl_reclass_lzw_5070.tif`

    Also provides a utility `create_hex_colormap()`
    for creating the colormap in hex -- you can copy and paste
    its output into the css variable list
    """
    if len(sys.argv) > 1:
        print('\nUsage:', msg)
        sys.exit()
    init()
