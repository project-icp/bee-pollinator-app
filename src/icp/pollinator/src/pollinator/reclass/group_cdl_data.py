from __future__ import print_function

import csv
import json
import sys

from collections import defaultdict

INIT_ID = 0

# Some specific crop types that yield is reported for require a recommended
# managed hive density value. Addittionally, these have a sibling crop type
# that will be created for "cover crop". For CDL ids which are not in this dict
# we can assume they have 0.
CROP_DENSITY = {
    75: 6,     # Almond
    68: 3.7,   # Apple
    242: 7.5,  # Blueberry
    66: 4.2,   # Cherry
    55: 2,     # Caneberry
    48: 4.5,   # Watermelon
    229: 3.8,  # Pumpkin
}

# Non-specific (ie, group) crops that also get reported for yield also have a
# hive density value, but do not have a sibling "cover crop" type.
GROUP_DENSITY = {
    'Cucurbits': 2.7,
    'Melons': 1.73,
    'Berries': 2.25,
    'Orchard': 1.53,
    'Strawberries': 3.91,
}


def next_id():
    global INIT_ID
    INIT_ID += 1
    return INIT_ID


def adjust_row(row):
    """
    Some rows need adjusting to add hive density values or to synthesize
    a new crop type of the existing crop with a cover crop.
    """
    adjusted_rows = [row]
    crop_id = int(row['CDL_code'])

    if crop_id in CROP_DENSITY:
        row['density'] = CROP_DENSITY[crop_id]

        # Make a cover crop sythetic crop type for this entry
        cc_row = dict(row)
        cc_row['group_id'] = next_id()
        cc_row['Attributes'] = row['Attributes'] + ' with cover crop'

        # Cover crops have a 0.05 increase in HN and HF values over raw type
        cc_row['HF.mean'] = float(cc_row['HF.mean']) + 0.05
        cc_row['HN.mean'] = float(cc_row['HN.mean']) + 0.05

        adjusted_rows.append(cc_row)
    else:
        # Set the density value to 0 unless there is an entry for this group
        # in GROUP_DENSITY
        crop_group = row['Attributes']
        row['density'] = GROUP_DENSITY.get(crop_group, 0)

    return adjusted_rows


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
                adjusted_rows = adjust_row(row)
                [new_data.append(row) for row in adjusted_rows]

            reclass[group_id].append(int(row['CDL_code']))

        with open('./cdl_reclass_map.json', mode='w') as reclass_json:
            reclass_json.write(json.dumps(reclass))

        with open('./cdl_data_grouped.csv', mode='w') as new_csv:
            names = ['group_id', 'Attributes', 'Demand', 'HF.mean',
                     'HN.mean', 'density']
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
