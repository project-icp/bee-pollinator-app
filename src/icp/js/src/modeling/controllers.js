"use strict";

var $ = require('jquery'),
    _ = require('lodash'),
    App = require('../app'),
    settings = require('../core/settings'),
    router = require('../router').router,
    views = require('./views'),
    models = require('./models');

var ModelingController = {
    projectPrepare: function(projectId) {
        if (!projectId && !App.map.get('areaOfInterest')) {
            router.navigate('', { trigger: true });
            return false;
        }
    },

    project: function(projectId, scenarioParam) {
        var project;

        if (projectId) {
            project = new models.ProjectModel({
                id: projectId
            });

            App.currentProject = project;

            project
                .fetch()
                .done(function() {
                    var lock = $.Deferred();

                    App.map.set({
                        'areaOfInterest': project.get('area_of_interest'),
                        'areaOfInterestName': project.get('area_of_interest_name')
                    });
                    initScenarioEvents(project);
                    initViews(project, lock);

                    lock.done(function() {
                        if (scenarioParam) {
                            var scenarioId = parseInt(scenarioParam, 10),
                                scenarios = project.get('scenarios');

                            if (!scenarios.setActiveScenarioById(scenarioId)) {
                                scenarios.makeFirstScenarioActive();
                            }
                        } else {
                            project.get('scenarios').makeFirstScenarioActive();
                        }

                        setPageTitle();
                    });
                })
                .fail(function() {
                    // TODO Make handling project load errors more robust

                    console.log("[ERROR] Could not load project.");
                    App.currentProject = null;
                });
        } else {
            var lock = $.Deferred();

            if (!App.currentProject) {

                project = reinstateProject(App.projectNumber, lock);

                App.currentProject = project;
                if (!App.projectNumber) {
                    setupNewProjectScenarios(project);
                }
            } else {
                project = App.currentProject;
                updateUrl();
                lock.resolve();
            }

            finishProjectSetup(project, lock);
            setPageTitle();
        }
    },

    makeNewProject: function(modelPackage) {
        var project;
        var lock = $.Deferred();
        project = new models.ProjectModel({
            name: 'Untitled Project',
            created_at: Date.now(),
            area_of_interest: App.map.get('areaOfInterest'),
            area_of_interest_name: App.map.get('areaOfInterestName'),
            model_package: modelPackage,
            scenarios: new models.ScenariosCollection()
        });

        App.currentProject = project;
        lock.resolve();

        setupNewProjectScenarios(project);
        finishProjectSetup(project, lock);
        updateUrl();
        setPageTitle();
    },

    projectCleanUp: function() {
        projectCleanUp(true);
    },

    makeNewProjectCleanUp: function() {
        projectCleanUp(true);
    },

    // Redirect the project cloning route back to the server.
    projectClone: function() {
        window.location.replace(window.location.href);
    },

    // Load the project's area of interest, and move to Draw view
    projectDraw: function(projectId) {
        var project = new models.ProjectModel({
            id: projectId
        });

        App.currentProject = project;

        project
            .fetch()
            .done(function() {
                App.map.set({
                    'areaOfInterest': project.get('area_of_interest'),
                    'areaOfInterestName': project.get('area_of_interest_name')
                });
                if (project.get('scenarios').isEmpty()) {
                    // No scenarios available. Set the `needs_reset` flag so
                    // that this project is properly initialized by the
                    // modeling controller.
                    project.set('needs_reset', true);
                }

                if (project.get('is_activity')) {
                    settings.set('activityMode', true);
                }

                setPageTitle();
            })
            .fail(function() {
                App.currentProject = null;
            })
            .always(function() {
                router.navigate('/', { trigger: true });
            });
    }
};

function finishProjectSetup(project, lock) {
    lock.done(function() {
        project.on('change:id', updateUrl);
        initScenarioEvents(project);
        initViews(project);
        if (App.projectNumber) {
            updateUrl();
        }
    });
}

function setPageTitle() {
    var modelPackageName = App.currentProject.get('model_package'),
        modelPackages = settings.get('model_packages'),
        modelPackageDisplayName = _.find(modelPackages, {name: modelPackageName}).display_name;
}

function projectCleanUp(shouldClearMapState) {
    if (App.currentProject) {
        var scenarios = App.currentProject.get('scenarios');

        App.currentProject.off('change:id', updateUrl);
        scenarios.off('change:activeScenario change:id', updateScenario);
        App.currentProject.set('scenarios_events_initialized', false);

        // App.projectNumber holds the number of the project that was
        // in use when the user left the `/project` page.  The intent
        // is to allow the same project to be returned-to via the UI
        // arrow buttons (see issue #690).
        App.projectNumber = scenarios.at(0).get('project');
    }

    App.rootView.subHeaderRegion.empty();
    App.rootView.sidebarRegion.empty();

    if (shouldClearMapState) {
        App.getMapView().clearMapState();
    }
}

function updateUrl() {
    // Use replace: true, so that the back button will work as expected.
    router.navigate(App.currentProject.getReferenceUrl(), { replace: true });
}

function updateScenario(scenario) {
    App.getMapView().updateModifications(scenario.get('modifications'));
    updateUrl();
}

function initScenarioEvents(project) {
    project.get('scenarios').on('change:activeScenario change:id', updateScenario);
}

function setupNewProjectScenarios(project) {
    var aoiCensus = project.get('aoi_census');
    project.get('scenarios').add([
        new models.ScenarioModel({
            name: 'Current Conditions',
            is_current_conditions: true,
            active: true,
            aoi_census: aoiCensus
        }),
        new models.ScenarioModel({
            name: 'New Scenario',
            aoi_census: aoiCensus
        })
        // Silent is set to true because we don't actually want to save the
        // project without some user interaction. This initialization
        // should set the stage but we should wait for something else to
        // happen to save. Ideally we will move this into the project
        // creation when we get rid of the global.
    ], { silent: true });
}

function initViews(project, lock) {
    var resultsView = new views.ResultsView({
            model: project,
            lock: lock
        }),
        modelingHeader = new views.ModelingHeaderView({
            model: project
        });

    App.rootView.subHeaderRegion.show(modelingHeader);
    App.rootView.sidebarRegion.show(resultsView);
}

function reinstateProject(number, lock) {
    var project = new models.ProjectModel({id: App.projectNumber});

    project
        .fetch()
        .done(function() {
            App.map.set({
                'areaOfInterest': project.get('area_of_interest'),
                'areaOfInterestName': project.get('area_of_interest_name')
            });
            setPageTitle();
            lock.resolve();
        });

    return project;
}


module.exports = {
    ModelingController: ModelingController
};
