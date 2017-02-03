from __future__ import print_function

import csv
import json
import sys


def init():

    with open('../data/cdl_data_grouped.csv', mode='r') as cdl_data_grouped:
        reader = csv.DictReader(cdl_data_grouped)

        crop_types = {}

        for row in reader:
            crop_group = row['Attributes']
            group_id = row['group_id']
            crop_types[group_id] = crop_group

        with open('./cropTypes.json', mode='w') as crop_types_json:
            crop_types_json.write(json.dumps(crop_types, sort_keys=True,
                                  separators=(',', ':'), indent=4))

if __name__ == '__main__':
    msg = """
      Uses ../data/cdl_data_grouped.csv to create the `cropTypes.json`
      that the frontend uses as a lookup.

      You may want to remove any enhancement/covercrop rows that aren't part
      of the actual raster.

       Takes no arguments but expects to have access to CDL data at:
           ../data/cdl_data_grouped.csv
    """
    if len(sys.argv) > 1:
        print('\nUsage:', msg)
        sys.exit()

    init()
