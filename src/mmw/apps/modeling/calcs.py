# -*- coding: utf-8 -*-
from __future__ import print_function
from __future__ import unicode_literals
from __future__ import absolute_import

from django.contrib.gis.geos import GEOSGeometry

from django.db import connection

from apps.modeling.mapshed.calcs import (animal_energy_units,
                                         get_point_source_table)

ANIMAL_DISPLAY_NAMES = {
    'sheep': 'Sheep',
    'horses': 'Horses',
    'turkeys': 'Turkeys',
    'layers': 'Chickens, Layers',
    'beef_cows': 'Cows, Beef',
    'hogs': 'Pigs/Hogs/Swine',
    'dairy_cows': 'Cows, Dairy',
    'broilers': 'Chickens, Broilers',
}


def animal_population(geojson):
    """
    Given a GeoJSON shape, call MapShed's `animal_energy_units` method
    to calculate the area-weighted county animal population. Returns a
    dictionary to append to the outgoing JSON for analysis results.
    """
    geom = GEOSGeometry(geojson, srid=4326)
    aeu_for_geom = animal_energy_units(geom)[2]
    aeu_return_values = []

    for animal, aeu_value in aeu_for_geom.iteritems():
        aeu_return_values.append({
            'type': ANIMAL_DISPLAY_NAMES[animal],
            'aeu': int(aeu_value),
        })

    return {
        'displayName': 'Animals',
        'name': 'animals',
        'categories': aeu_return_values
    }


def point_source_pollution(geojson):
    return {}


def catchment_water_quality(geojson):
    """
    Given a GeoJSON shape, retrieve Catchment Water Quality data
    from the `drb_catchment_water_quality` table to display
    in the Analyze tab.

    Returns a dictionary to append to the outgoing JSON for analysis
    result
    """
    geom = GEOSGeometry(geojson, srid=4326)
    table_name = 'drb_catchment_water_quality'
    sql = '''
          SELECT nord, areaha, tn_tot_kgy, tp_tot_kgy, tss_tot_kg,
              tn_urban_k, tn_riparia, tn_ag_kgyr, tn_natural, tn_pt_kgyr,
              tp_urban_k, tp_riparia, tp_ag_kgyr, tp_natural, tp_pt_kgyr,
              tss_urban_, tss_rip_kg, tss_ag_kgy, tss_natura,
              ST_AsGeoJSON(geom) as geom
          FROM {table_name}
          WHERE ST_Intersects(geom, ST_SetSRID(ST_GeomFromText(%s), 4326))
          '''.format(table_name=table_name)

    with connection.cursor() as cursor:
        cursor.execute(sql, [geom.wkt])

        if cursor.rowcount != 0:
            columns = [col[0] for col in cursor.description]
            catchment_water_quality_results = [
                # The TN, TP, and TSS values return as type Decimal,
                # but we want floats.
                dict(zip(columns,
                         [row[0],
                          float(row[1]) if row[1] else None,
                          float(row[2]) if row[2] else None,
                          float(row[3]) if row[3] else None,
                          float(row[4]) if row[4] else None,
                          float(row[5]) if row[5] else None,
                          float(row[6]) if row[6] else None,
                          float(row[7]) if row[7] else None,
                          float(row[8]) if row[8] else None,
                          float(row[9]) if row[9] else None,
                          float(row[10]) if row[10] else None,
                          float(row[11]) if row[11] else None,
                          float(row[12]) if row[12] else None,
                          float(row[13]) if row[13] else None,
                          float(row[14]) if row[14] else None,
                          float(row[15]) if row[15] else None,
                          float(row[16]) if row[16] else None,
                          float(row[17]) if row[17] else None,
                          float(row[18]) if row[18] else None,
                          row[19]]))
                for row in cursor.fetchall()
            ]
        else:
            catchment_water_quality_results = []
    return {
        'displayName': 'Water Quality',
        'name': 'catchment_water_quality',
        'categories': catchment_water_quality_results
    }
