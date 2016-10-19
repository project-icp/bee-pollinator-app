"use strict";

var $ = require('jquery'),
    _ = require('lodash'),
    Backbone = require('../../shim/backbone'),
    coreModels = require('../core/models');

var LayerModel = Backbone.Model.extend({});

// Each layer returned from the analyze endpoint.
// Land, soil, etc.
var LayerCollection = Backbone.Collection.extend({
    url: '/api/modeling/',
    model: LayerModel
});

// Each category that makes up the areas of each layer
var LayerCategoryCollection = Backbone.Collection.extend({

});

var AnalyzeTaskModel = coreModels.TaskModel.extend({
    defaults: _.extend( {
            area_of_interest: null,
            taskName: 'analyze',
            taskType: 'modeling'
        }, coreModels.TaskModel.prototype.defaults
    ),

    /**
     * Returns a promise that completes when Analysis has been fetched. If
     * fetching is not required, returns an immediatley resolved promise.
     */
    fetchAnalysisIfNeeded: function() {
        var self = this,
            aoi = self.get('area_of_interest'),
            result = self.get('result');

        if (aoi && !result && self.fetchAnalysisPromise === undefined) {
            var promises = self.start({
                postData: {
                    'area_of_interest': JSON.stringify(aoi)
                }
            });
            self.fetchAnalysisPromise = $.when(promises.startPromise,
                                               promises.pollingPromise);
            self.fetchAnalysisPromise
                .always(function() {
                    delete self.fetchAnalysisPromise;
                });
        }

        return self.fetchAnalysisPromise || $.when();
    }
});

var AnalyzeTaskCollection = Backbone.Collection.extend({
    model: AnalyzeTaskModel
});

function createAnalyzeTaskCollection(aoi) {
    return new AnalyzeTaskCollection([
        { area_of_interest: aoi, taskName: 'analyze' },
    ]);
}

function createAnalyzeResultViewModelCollection(analyzeTaskCollection) {
    return new Backbone.Collection([
        { name: 'land', displayName: 'Land', taskRunner: analyzeTaskCollection.findWhere({ taskName: 'analyze' }) },
    ]);
}

module.exports = {
    AnalyzeTaskModel: AnalyzeTaskModel,
    LayerModel: LayerModel,
    LayerCollection: LayerCollection,
    LayerCategoryCollection: LayerCategoryCollection,
    createAnalyzeTaskCollection: createAnalyzeTaskCollection,
    createAnalyzeResultViewModelCollection: createAnalyzeResultViewModelCollection,
};
