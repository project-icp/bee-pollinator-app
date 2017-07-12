"use strict";

var hopscotch = require('hopscotch'),
    App = require('../app'),
    router = require('../router').router,
    views = require('./views'),
    tours = require('./tours'),
    modelingModels = require('../modeling/models.js');

var CompareController = {
    compare: function(projectId) {
        if (App.currentProject) {
            setupProject();
            showCompareWindow();
        } else if (projectId) {
            App.currentProject = new modelingModels.ProjectModel({
                id: projectId
            });

            App.currentProject
                .fetch()
                .done(function() {
                    setupProject();
                    showCompareWindow();
                });
        }
        // else -- this case is caught by the backend and raises a 404

    },

    compareCleanUp: function() {
        App.user.off('change:guest', saveAfterLogin);
        App.currentProject.off('change:id', updateUrl);

        if (!App.map.get('areaOfInterest')) {
            App.map.set('areaOfInterest', App.currentProject.get('area_of_interest'));
        }

        App.rootView.footerRegion.empty();

        hopscotch.endTour();
    }
};

function setupProject() {
    App.user.on('change:guest', saveAfterLogin);
    App.currentProject.on('change:id', updateUrl);
}

function saveAfterLogin(user, guest) {
    if (!guest && App.currentProject.isNew()) {
        var user_id = user.get('id');
        App.currentProject.set('user_id', user_id);
        App.currentProject.get('scenarios').each(function(scenario) {
            scenario.set('user_id', user_id);
        });

        App.currentProject.saveProjectAndScenarios();
    }
}

function updateUrl() {
    // Use replace: true, so that the back button will work as expected.
    router.navigate(App.currentProject.getCompareUrl(), { replace: true });
}

function showCompareWindow() {
    var compareWindow = new views.CompareWindow({
            model: App.currentProject
        });
    App.rootView.footerRegion.show(compareWindow);
    tours.compareTour.showTourIfNecessary();
}

module.exports = {
    CompareController: CompareController
};
