"use strict";

var $ = require('jquery'),
    _ = require('underscore'),
    Backbone = require('../../../shim/backbone'),
    Marionette = require('../../../shim/backbone.marionette'),
    chart = require('../../core/chart.js'),
    barChartTmpl = require('../../core/templates/barChart.html'),
    resultTmpl = require('./templates/result.html'),
    tableRowTmpl = require('./templates/tableRow.html'),
    tableTmpl = require('./templates/table.html'),
    cropTypes = require('../../core/cropTypes.json');

var ResultView = Marionette.LayoutView.extend({
    className: 'tab-pane',

    id: function() {
        return this.model.get('name');
    },

    template: resultTmpl,

    attributes: {
        role: 'tabpanel'
    },

    regions: {
        tableRegion: '.yield-table-region',
        chartRegion: '.yield-chart-region'
    },

    modelEvents: {
        'change': 'onShow'
    },

    initialize: function(options) {
        this.selectedCrops = options.scenario.get('selectedCrops');
        this.compareMode = options.compareMode;
        this.isCurrentConditions = options.scenario.get('is_current_conditions');
        this.currentConditionsModel = options.currentConditions.get('results').models[0];
    },

    onShow: function() {
        this.tableRegion.reset();
        this.chartRegion.reset();
        if (this.model.get('result') && this.currentConditionsModel.get('result')) {
            var scenarioResults = this.model.get('result'),
                currentConditionsResults = this.currentConditionsModel.get('result'),
                filteredScenarioResults = _.pick(scenarioResults, function(value, key) {
                    return value !== 0 || currentConditionsResults[key] !== 0;
                }),
                filteredCurrentConditionsResults = _.pick(currentConditionsResults, function(value, key) {
                    return value !== 0 || scenarioResults[key] !== 0;
                });
            if (this.compareMode) {
                this.chartRegion.show(new CompareChartView({
                    selectedCrops: this.selectedCrops,
                    model: this.model,
                    currentConditionsModel: this.currentConditionsModel,
                }));
            } else {
                this.tableRegion.show(new TableView({
                    scenarioResults: filteredScenarioResults,
                    currentConditionsResults: filteredCurrentConditionsResults,
                    isCurrentConditions: this.isCurrentConditions
                }));

                this.chartRegion.show(new ChartView({
                    scenarioResults: filteredScenarioResults,
                    currentConditionsResults: filteredCurrentConditionsResults,
                    isCurrentConditions: this.isCurrentConditions
                }));
            }
        }
    }
});

var TableRowView = Marionette.ItemView.extend({
    tagName: 'tr',
    template: tableRowTmpl,

    templateHelpers: function() {
        return {
            isCurrentConditions: this.options.isCurrentConditions,
        };
    }
});

var TableView = Marionette.CompositeView.extend({
    childView: TableRowView,
    childViewContainer: 'tbody',
    childViewOptions: function() {
        return {
            scenarioResults: this.options.scenarioResults,
            currentConditionsResults: this.options.currentConditionsResults,
            isCurrentConditions: this.options.isCurrentConditions
        };
    },

    template: tableTmpl,

    initialize: function() {
        this.collection = this.formatData();
    },

    onAttach: function() {
        $('[data-toggle="table"]').bootstrapTable();
    },

    templateHelpers: function() {
        return {
            isCurrentConditions: this.options.isCurrentConditions,
        };
    },

    formatData: function() {
        var collection = new Backbone.Collection();

        collection.add(this.makeRowsForScenario(this.options.currentConditionsResults,
            this.options.scenarioResults));

        return collection;
    },

    makeRowsForScenario: function(currentConditionsResults, scenarioResults) {
        var self = this;
        return _.map(_.keys(currentConditionsResults), function(cropType) {
            return _.extend(self.getCropTypeValue(currentConditionsResults, scenarioResults, cropType));
        });
    },

    getCropTypeValue: function(currentConditionsResults, scenarioResults, cropType) {
        return {
            cropType: cropTypes[cropType],
            currentConditionsYield: currentConditionsResults[cropType],
            scenarioYield: scenarioResults[cropType]
        };
    }

});

var ChartView = Marionette.ItemView.extend({
    template: barChartTmpl,
    className: 'chart-container yield-chart-container',

    initialize: function(options) {
        this.compareMode = options.compareMode;
    },

    onAttach: function() {
        this.addChart();
    },

    addChart: function() {
        var chartEl = this.$el.find('.bar-chart').get(0),
            data = formatData(this.options.currentConditionsResults,
                this.options.scenarioResults, this.options.isCurrentConditions),
            chartOptions = {
                yAxisLabel: 'Relative Yield',
                yAxisUnit: 'Relative Yield',
                showLegend: false,
                barClasses: _.pluck(_.flatten(_.pluck(data, 'values')), 'class'),
                yAxisDomain: [0,100]
            };

        chart.renderGroupedVerticalBarChart(chartEl, data, chartOptions);
    }
});

var CompareChartView = Marionette.ItemView.extend({
    template: barChartTmpl,

    className: 'chart-container yield-chart-container',

    modelEvents: {
        'change': 'addChart'
    },

    initialize: function(options) {
        this.scenario = options.scenario;
    },

    onAttach: function() {
        this.addChart();
    },

    addChart: function() {
        var chartEl = this.$el.find('.bar-chart').get(0),
            result = this.model.get('result'),
            data,
            chartOptions;

        function getData(result, selectedCrops ) {
            var values = selectedCrops.map(function(cropId) {
                return {
                    x: cropTypes[cropId],
                    y: result[cropId],
                    class: 'crop-' + cropId
                };
            });

            return [{values: values}];
        }

        $(chartEl).empty();
        if (result) {
            data = getData(result, this.options.selectedCrops),
            chartOptions = {
                yAxisLabel: 'Relative Yield',
                yAxisUnit: 'Relative Yield',
                barClasses: _.pluck(_.flatten(_.pluck(data, 'values')), 'class'),
                maxBarWidth: 100,
                margin: {top: 20, right: 0, bottom: 40, left: 40},
                showLegend: false,
                disableToggle: true,
                yAxisDomain: [0, 100],
                compareMode: true
            };

            chart.renderGroupedVerticalBarChart(chartEl, data, chartOptions);
        }
    }
});

var formatResultsFromModel = function(results, seriesName, useCurrentConditionsClass) {
    return {
        key: seriesName,
        values: _.map(results, function(value, key) {
            return {
                x: cropTypes[key],
                y: value,
                class: 'crop-' + key +
                        (useCurrentConditionsClass ? ' current-conditions' : ' scenario'),
            };
        })
    };
};

var formatData = function(currentConditionsResults, scenarioResults, isCurrentConditions) {
    var data = [
        formatResultsFromModel(currentConditionsResults, "Current Conditions",
            isCurrentConditions ? false : true),
    ];
    if (!isCurrentConditions) {
        data.push(formatResultsFromModel(scenarioResults, "This Scenario",
            false));
    }
    // Make the scenario be the leftmost bar
    return data;
};


module.exports = {
    ResultView: ResultView
};
