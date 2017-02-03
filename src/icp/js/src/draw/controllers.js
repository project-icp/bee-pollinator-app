"use strict";

var App = require('../app'),
    geocoder = require('../geocode/views'),
    views = require('./views'),
    settings = require('../core/settings'),
    modelingModels = require('../modeling/models'),
    models = require('./models');


var DrawController = {
    drawPrepare: prepareView,

    draw: function() {
        var geocodeSearch = new geocoder.GeocoderView(),
            drawWindow = new views.DrawWindow({
                model: new models.DrawWindowModel()
            });

        App.rootView.geocodeSearchRegion.show(geocodeSearch);
        App.rootView.sidebarRegion.show(drawWindow);

        enableSingleProjectModeIfActivity();
    },

    drawCleanUp: function() {
        App.rootView.geocodeSearchRegion.empty();
        App.rootView.sidebarRegion.empty();
        App.rootView.footerRegion.empty();
    },

    splashPrepare: prepareView,

    splash: function() {
        App.rootView.geocodeSearchRegion.show(new geocoder.GeocoderView());
        App.rootView.sidebarRegion.show(new views.SplashWindow());
    }
};

function prepareView() {
    App.map.revertMaskLayer();
    if (!App.map.get('areaOfInterest')) {
        App.map.setDrawSize(true);
    }
}

/**
 * If we are in embed mode then the project is an activity and we want to keep
 * the same project reguardless of changes to the AOI. This prepares a project
 * immedialty upon visiting the page and will be the only project the user can
 * save during this session.
 */
function enableSingleProjectModeIfActivity() {
    if (settings.get('activityMode')) {
        if (!App.currentProject) {
            var project = new modelingModels.ProjectModel({
                name: 'New Activity',
                created_at: Date.now(),
                area_of_interest: null,
                scenarios: new modelingModels.ScenariosCollection(),
                is_activity: true,
                needs_reset: true
            });
            App.currentProject = project;
        }
    }
}

module.exports = {
    DrawController: DrawController
};
