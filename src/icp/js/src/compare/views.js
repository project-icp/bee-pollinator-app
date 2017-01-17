"use strict";

var _ = require('lodash'),
    $ = require('jquery'),
    Backbone = require('../../shim/backbone'),
    Marionette = require('../../shim/backbone.marionette'),
    App = require('../app'),
    coreModels = require('../core/models'),
    coreViews = require('../core/views'),
    modelingViews = require('../modeling/views'),
    modConfigUtils = require('../modeling/modificationConfigUtils'),
    compareWindowTmpl = require('./templates/compareWindow.html'),
    compareScenariosTmpl = require('./templates/compareScenarios.html'),
    compareScenarioTmpl = require('./templates/compareScenario.html'),
    compareModelingTmpl = require('./templates/compareModeling.html'),
    compareModificationsTmpl = require('./templates/compareModifications.html');

var CompareWindow = Marionette.LayoutView.extend({
    //model: modelingModels.ProjectModel,

    template: compareWindowTmpl,

    id: 'compare-window',

    regions: {
        containerRegion: '#compare-scenarios-region'
    },

    ui: {
        'slideLeft': '#slide-left',
        'slideRight': '#slide-right'
    },

    events: {
        'click @ui.slideLeft': 'slideLeft',
        'click @ui.slideRight': 'slideRight'
    },

    initialize: function() {
        // Left-most visible scenario
        this.slideInd = 0;

        // Resizing the window can change the column size,
        // so the offset of the container needs to be
        // recomputed.
        $(window).bind('resize.app', _.debounce(_.bind(this.updateContainerPos, this)));
    },

    onDestroy: function() {
        $(window).unbind('resize.app');
    },

    getColumnWidth: function() {
        // Width is a function of screen size.
        return parseInt($('#compare-row td').css('width'));
    },

    getContainerWidth: function() {
        // Width is a function of screen size.
        return parseInt($('body').get(0).offsetWidth);
    },

    updateContainerPos: function() {
        var left = -1 * this.slideInd * this.getColumnWidth();
        $('.compare-scenarios-container').css('left', left + 'px');
    },

    slideLeft: function() {
        if (this.slideInd > 0) {
            this.slideInd--;
            this.updateContainerPos();
        }
    },

    slideRight: function() {
        var numScenarios = this.model.get('scenarios').length,
            maxVisColumns = Math.floor(this.getContainerWidth() / this.getColumnWidth());

        if (this.slideInd < numScenarios - maxVisColumns) {
            this.slideInd++;
            this.updateContainerPos();
        }
    },

    onShow: function() {
         this.containerRegion.show(new CompareScenariosView({
            model: this.model,
            collection: this.model.get('scenarios')
         }));
    }
});

var CompareScenarioView = Marionette.LayoutView.extend({
    //model: modelingModels.ScenarioModel,

    tagName: 'td',

    template: compareScenarioTmpl,

    templateHelpers: function() {
        return {
            scenarioName: this.model.get('name')
        };
    },

    regions: {
        mapRegion: '.map-region',
        modelingRegion: '.modeling-region',
        modificationsRegion: '.modifications-region'
    },

    initialize: function(options) {
        this.projectModel = options.projectModel;
        this.scenariosView = options.scenariosView;
    },

    onShow: function() {
        this.mapModel = new coreModels.MapModel({});
        this.mapModel.set({
            'areaOfInterest': this.projectModel.get('area_of_interest'),
            'areaOfInterestName': this.projectModel.get('area_of_interest_name')
        });
        this.mapView = new coreViews.MapView({
            model: this.mapModel,
            el: $(this.el).find('.map-container').get(),
            addZoomControl: false,
            addLocateMeButton: false,
            addLayerSelector: false,
            addSidebarToggle: false,
            showLayerAttribution: false,
            initialLayerName: App.getMapView().getActiveBaseLayerName(),
            interactiveMode: false
        });

        this.mapView.fitToAoi();
        this.mapView.updateAreaOfInterest();
        this.mapView.updateModifications(this.model);
        this.mapRegion.show(this.mapView);
        this.modelingRegion.show(new CompareModelingView({
            projectModel: this.projectModel,
            scenariosView: this.scenariosView,
            model: this.model
        }));

        var allModifications = this.model.get('modifications').models.concat(
            this.model.get('shared_modifications').models
        ).concat(
            this.model.get('inputs').models
        );

        this.modificationsRegion.show(new CompareModificationsView({
            model: new Backbone.Collection(allModifications)
        }));
    }
});

var CompareScenariosView = Marionette.CompositeView.extend({
    //model: modelingModels.ProjectModel,
    //collection: modelingModels.ScenariosCollection,

    className: 'compare-scenarios-container',

    template: compareScenariosTmpl,

    childViewContainer: '#compare-row',
    childView: CompareScenarioView,
    childViewOptions: function() {
        return {
            scenariosView: this,
            projectModel: this.model
        };
    },

    initialize: function() {
        this.modelingViews = [];
    }
});

var CompareModelingView = Marionette.LayoutView.extend({
    //model: modelingModels.ScenarioModel

    template: compareModelingTmpl,

    className: 'modeling-container',

    regions: {
        resultRegion: '.result-region',
    },

    ui: {
        resultSelector: 'select'
    },

    events: {
        'change @ui.resultSelector': 'updateResult'
    },

    initialize: function(options) {
        this.projectModel = options.projectModel;
        this.model.get('results').makeFirstActive();
        this.listenTo(this.model.get('results').at(0), 'change:polling', function() {
            this.render();
            this.onShow();
        });
        this.scenariosView = options.scenariosView;
        this.scenariosView.modelingViews.push(this);
    },

    templateHelpers: function() {
        return {
            polling: this.model.get('results').at(0).get('polling'),
            results: this.model.get('results').toJSON()
        };
    },

    updateResult: function() {
        var selection = this.ui.resultSelector.val();

        this.model.get('results').setActiveByAttribute("displayName", selection);
        this.showResult();

        _.forEach(this.scenariosView.modelingViews, function(sibling) {
            if (sibling.ui.resultSelector.val() === selection) {
                return;
            } else {
                sibling.ui.resultSelector.val(selection);
                sibling.model.get('results').setActiveByAttribute("displayName", selection);
                sibling.showResult();
            }
        });

    },

    showResult: function() {
        var modelPackage = App.currentProject.get('model_package'),
            resultModel = this.model.get('results').getActive(),
            ResultView = modelingViews.getResultView(modelPackage, resultModel.get('name'));

        this.resultRegion.show(new ResultView({
            areaOfInterest: this.projectModel.get('area_of_interest'),
            model: resultModel,
            currentConditions: _.head(this.projectModel.get('scenarios').models),
            scenario: this.model,
            compareMode: true,
        }));
    },

    onShow: function() {
        this.showResult();
    }
});

var CompareModificationsView = Marionette.ItemView.extend({
    //model: modelingModels.ModificationsCollection,
    template: compareModificationsTmpl,

    className: 'modifications-container',

    templateHelpers: function() {
        return {
            enhancements: this.model.where({name: 'conservation_practice'}),
            landCovers: this.model.where({name: 'landcover'}),
            numberOfHives: this.model.findWhere({name: 'numberofhives'}).get('value'),
            modConfigUtils: modConfigUtils
        };
    }
});

module.exports = {
    CompareWindow: CompareWindow
};
