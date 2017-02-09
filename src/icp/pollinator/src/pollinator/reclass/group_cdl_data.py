from __future__ import print_function

import csv
import json
import sys

from collections import defaultdict

INIT_ID = 0
DEMAND_LOOKUP = {
    'none': 0,
    'little': 0.05,
    'modest': 0.25,
    'great': 0.65,
    'essential': 0.95
}


def next_id():
    global INIT_ID
    INIT_ID += 1
    return INIT_ID


def init():

    with open('../data/cdl_data.csv', mode='r') as cdl_data:
        reader = csv.DictReader(cdl_data)

        groups = {}
        reclass = defaultdict(list)
        new_data = []

        for row in reader:
            crop_group = row['Attributes']
            if crop_group in groups:
                group_id = groups[crop_group]
            else:
                group_id = groups.setdefault(crop_group, next_id())
                row['group_id'] = group_id
                row['Demand'] = DEMAND_LOOKUP[row['Demand']]
                new_data.append(row)

            reclass[group_id].append(int(row['CDL_code']))

        with open('./cdl_reclass_map.json', mode='w') as reclass_json:
            reclass_json.write(json.dumps(reclass))

        with open('./cdl_data_grouped.csv', mode='w') as new_csv:
            names = ['group_id', 'Attributes', 'Demand', 'HF.mean',
                     'HN.mean', 'Density']
            writer = csv.DictWriter(new_csv, names, extrasaction='ignore')
            writer.writeheader()
            writer.writerows(new_data)


if __name__ == '__main__':
    msg = """
       Converts the CSV of raw CDL values to an aggreggated list of
       just the unique values of `Attributes`, assigning new ids to
       represent the groups and retaining the static HN and HF mean
       values per group.

       Additionally creates a json mapping file that can be used to
       reclassify CDL codes from the CDL raster to the new grouped
       codes.

       Takes no arguments but expects to have access to CDL data at:
           ../data/cdl_data.csv
    """
    if len(sys.argv) > 1:
        print('\nUsage:', msg)
        sys.exit()

    init()
