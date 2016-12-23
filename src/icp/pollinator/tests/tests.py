from __future__ import division

import unittest
import os
import numpy as np

from shapely.geometry import Polygon

from pollinator import raster_ops
from pollinator.crop_yield import aggregate_crops


class ReadTests(unittest.TestCase):
    def setUp(self):
        cwd = os.path.abspath(os.path.dirname(__file__))
        self.crop_tif = os.path.join(cwd, 'data', 'cdl_test.tif')
        self.field_geom = Polygon([
            [-2174493.118654, 1879978.16489],
            [-2173930.729551, 1879831.29894],
            [-2173640.579758, 1880848.61427],
            [-2174260.282401, 1880963.24134],
            [-2174260.282401, 1880963.24134],
            [-2174493.118654, 1879978.16489]
        ])
        # The anticipated raster values and approx count were manually verified
        # in QGIS
        self.field_counts = {
            '36': 1,
            '42': 1,
            '61': 128,
            '75': 475,
            '76': 154,
            '226': 2
        }

    def test_read_area(self):
        """
        Test a read in of a portion of the crop raster corresponding to a
        field and test that it read the correct area.
        """
        field, mask = raster_ops.extract(self.field_geom, self.crop_tif)
        values, counts = np.unique(field.compressed(), return_counts=True)
        count_map = dict(zip(map(str, values), counts))

        self.assertEqual(count_map, self.field_counts,
                         "Raster values extracted did not match expected")

    def test_read_and_reclass(self):
        """
        Test reclassifying vector shapes on reading from the crop raster.
        """
        # Convert areas on the field from fallow (61) and walnuts (76)
        # and the likely anomalous oats/corn (226), dry beans (42)
        # alfalfa (31) to almonds (75) via a geometry that covers those areas
        reclass_geom = Polygon([
            [-2174493.11865447228774428, 1879978.16489381645806134],
            [-2173930.72955114673823118, 1879831.29894963605329394],
            [-2173640.5797589854337275, 1880848.61427030107006431],
            [-2174260.28240150306373835, 1880963.24134868592955172],
            [-2174260.28240150306373835, 1880963.24134868592955172],
            [-2174493.11865447228774428, 1879978.16489381645806134]
        ])
        almonds = 75
        reclass = [{
            'geom': reclass_geom,
            'value': almonds
        }]

        expected_count = sum(self.field_counts.values())

        field, mask = raster_ops.extract(self.field_geom, self.crop_tif,
                                         reclass)
        values, counts = np.unique(field.compressed(), return_counts=True)

        self.assertEqual(values, [almonds],
                         "Raster values were not converted to almonds")
        self.assertEqual(counts, [expected_count],
                         "Count of cells in read was modified after reclass")


class ModelTests(unittest.TestCase):
    def setUp(self):
        # Simulate an area with a sub section unmasked
        shed = np.array([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4])
        field_mask =    [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1]  # noqa
        shed.shape = (3, 4)
        self.yield_field = np.ma.masked_array(shed, mask=field_mask)

        # Simulate a crop layer with 4 crop types spread over the bee shed area
        cdl = np.array([100, 100, 100, 200, 200, 200, 300, 300, 300, 400, 400, 400])  # noqa
        cdl.shape = shed.shape
        self.cdl = cdl

    def test_aggregation(self):
        # Crop types 100 and 400 are completely outside of unmasked field area,
        # and types 200 & 300 each have one pixel outside the area
        crops = [100, 200, 300, 400]
        yield_by_crop = aggregate_crops(self.yield_field, self.cdl, crops)

        self.assertEqual(yield_by_crop, {
            '100': 0,
            '200': 4,  # 2 * 2,
            '300': 6,  # 3 * 2,
            '400': 0
        }, "Crop yield amounts were not aggregated correctly")


if __name__ == '__main__':
    unittest.main()