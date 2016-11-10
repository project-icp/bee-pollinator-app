"use strict";

var App = require('../app'),
    views = require('./views');

var ProjectsController = {
    projects: function() {
        App.rootView.footerRegion.show(
            new views.ProjectsView()
        );
    },

    projectsCleanUp: function() {
        App.rootView.footerRegion.empty();
    }
};

module.exports = {
    ProjectsController: ProjectsController
};
