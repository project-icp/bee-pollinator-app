"use strict";

var $ = require('jquery'),
    _ = require('lodash'),
    L = require('leaflet'),
    Marionette = require('../../shim/backbone.marionette'),
    Backbone = require('../../shim/backbone'),
    App = require('../app'),
    router = require('../router').router,
    models = require('./models'),
    settings = require('../core/settings'),
    modalModels = require('../core/modals/models'),
    modalViews = require('../core/modals/views'),
    coreModels = require('../core/models'),
    coreViews = require('../core/views'),
    coreUtils = require('../core/utils'),
    chart = require('../core/chart'),
    utils = require('../core/utils'),
    windowTmpl = require('./templates/window.html'),
    analyzeResultsTmpl = require('./templates/analyzeResults.html'),
    aoiHeaderTmpl = require('./templates/aoiHeader.html'),
    tabPanelTmpl = require('../modeling/templates/resultsTabPanel.html'),
    tabContentTmpl = require('./templates/tabContent.html'),
    barChartTmpl = require('../core/templates/barChart.html'),
    resultsWindowTmpl = require('./templates/resultsWindow.html');

var ResultsView = Marionette.LayoutView.extend({
    id: 'model-output-wrapper',
    className: 'analyze',
    tagName: 'div',
    template: resultsWindowTmpl,

    regions: {
        analyzeRegion: '#analyze-tab-contents'
    },

    ui: {
        'modelPackageLinks': 'a.model-package',
    },

    events: {
        'click @ui.modelPackageLinks': 'selectModelPackage',
    },

    selectModelPackage: function (e) {
        e.preventDefault();

        var modelPackages = settings.get('model_packages'),
            modelPackageName = $(e.target).data('id'),
            modelPackage = _.find(modelPackages, {name: modelPackageName}),
            newProjectUrl = '/project/new/' + modelPackageName,
            projectUrl = '/project',
            aoiModel = new coreModels.GeoModel({
                shape: App.map.get('areaOfInterest'),
                place: App.map.get('areaOfInterestName')
            });

        // Removed Mapshed+GWLFE, kept max area constraints for reference
        // incase bee model has similar constraints
        if (settings.get('mapshed_max_area')) {
            var areaInSqKm = coreUtils.changeOfAreaUnits(aoiModel.get('area'),
                                                         aoiModel.get('units'),
                                                         'km<sup>2</sup>');

            if (areaInSqKm > settings.get('mapshed_max_area')) {
                window.alert("The selected Area of Interest is too big for " +
                             "the Watershed Multi-Year Model. The currently " +
                             "maximum supported size is 1000 km².");
                return;
            }
        }

        if (!modelPackage.disabled) {
            router.navigate(newProjectUrl, {trigger: true});
        }
    },

    onShow: function() {
        this.showDetailsRegion();
    },

    onRender: function() {
        this.$el.find('.tab-pane:first').addClass('active');
    },

    showDetailsRegion: function() {
        this.analyzeRegion.show(new AnalyzeWindow({
            collection: this.collection
        }));
    },

    templateHelpers: function() {
        return {
            modelPackages: settings.get('model_packages')
        };
    },

    transitionInCss: {
        height: '0%'
    },

    animateIn: function(fitToBounds) {
        var self = this,
            fit = _.isUndefined(fitToBounds) ? true : fitToBounds;

        this.$el.animate({ width: '400px' }, 200, function() {
            App.map.setNoHeaderSidebarSize(fit);
            self.trigger('animateIn');
        });
    },

    animateOut: function(fitToBounds) {
        var self = this,
            fit = _.isUndefined(fitToBounds) ? true : fitToBounds;

        // Change map to full size first so there isn't empty space when
        // results window animates out
        App.map.setDoubleHeaderSmallFooterSize(fit);

        this.$el.animate({ width: '0px' }, 200, function() {
            self.trigger('animateOut');
        });
    }
});

var AnalyzeWindow = Marionette.LayoutView.extend({
    template: windowTmpl,

    regions: {
        panelsRegion: '.tab-panels-region',
        contentsRegion: '.tab-contents-region',
    },

    onShow: function() {
        this.panelsRegion.show(new TabPanelsView({
            collection: this.collection
        }));

        this.contentsRegion.show(new TabContentsView({
            collection: this.collection
        }));
    }
});

var TabPanelView = Marionette.ItemView.extend({
    tagName: 'li',
    template: tabPanelTmpl,
    attributes: {
        role: 'presentation'
    },

    initialize: function() {
        this.listenTo(this.model, 'change:polling', this.render);
    }
});

var TabPanelsView = Marionette.CollectionView.extend({
    tagName: 'ul',
    className: 'nav nav-tabs',
    attributes: {
        role: 'tablist'
    },
    childView: TabPanelView,

    onRender: function() {
        this.$el.find('li:first').addClass('active');
    }
});

var TabContentView = Marionette.LayoutView.extend({
    className: 'tab-pane',
    id: function() {
        return this.model.get('name');
    },
    template: tabContentTmpl,
    attributes: {
        role: 'tabpanel'
    },
    regions: {
        aoiRegion: '.aoi-region',
        resultRegion: '.result-region'
    },

    onShow: function() {
        this.aoiRegion.show(new AoiView({
            model: new coreModels.GeoModel({
                place: App.map.get('areaOfInterestName'),
                shape: App.map.get('areaOfInterest')
            })
        }));
    },

});

var TabContentsView = Marionette.CollectionView.extend({
    className: 'tab-content',
    childView: TabContentView,
    onRender: function() {
        this.$el.find('.tab-pane:first').addClass('active');
    }
});

var AoiView = Marionette.ItemView.extend({
    template: aoiHeaderTmpl
});

module.exports = {
    ResultsView: ResultsView,
    AnalyzeWindow: AnalyzeWindow,
};
