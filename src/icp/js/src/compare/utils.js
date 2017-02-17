"use strict";

var _ = require('lodash');

function getChartableCrops(scenarios) {
    return scenarios.reduce(function(cropTypes, scenario) {
        var nonZeroCrops = scenario.get('results').map(function(result) {
            return Object.keys(_.omit(result.get('result'), function(value) {
                return value === 0;
            }));
        });
        return _.uniq(cropTypes.concat(_.flatten(nonZeroCrops)));
    }, []);
}

module.exports = {
    getChartableCrops: getChartableCrops,
};
