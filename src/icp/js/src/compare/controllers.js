"use strict";

var _ = require('lodash'),
    App = require('../app'),
    router = require('../router').router,
    views = require('./views'),
    modelingModels = require('../modeling/models.js'),
    cropTypes = require('../core/cropTypes.json');

var CompareController = {
    compare: function(projectId) {
        var first = null,
            aoi_census = null;

        if (App.currentProject) {
            first = App.currentProject.get('scenarios').first();
            if (first) {
                aoi_census = first.get('aoi_census');
            }

            setupProjectCopy(aoi_census);
            showCompareWindow();
        } else if (projectId) {
            App.currentProject = new modelingModels.ProjectModel({
                id: projectId
            });

            first = App.currentProject.get('scenarios').first();
            if (first) {
                aoi_census = first.get('aoi_census');
            }

            App.currentProject
                .fetch()
                .done(function() {
                    setupProjectCopy(aoi_census);
                    showCompareWindow();
                });
        }
        // else -- this case is caught by the backend and raises a 404

    },

    compareCleanUp: function() {
        App.user.off('change:guest', saveAfterLogin);
        App.origProject.off('change:id', updateUrl);

        // Switch back to the origProject so any changes are discarded.
        App.currentProject.off();
        App.currentProject = App.origProject;
        if (!App.map.get('areaOfInterest')) {
            App.map.set('areaOfInterest', App.currentProject.get('area_of_interest'));
        }

        App.rootView.footerRegion.empty();
    }
};

function setupProjectCopy(aoi_census) {
    /*
    Create a copy of the project so that:
      -Changes to the results and inputs are not saved to the server
      -Changes to the results and inputs are not present after hitting the back button (and project is unsaved).
       When the user is logged in as a guest, the only copy of the original inputs and results
       are in App.currentProject, and modifying these values in the compare views will result in those new
       values being back in the modeling views, which is not what we want.
      -The original project (without changes) is saved when logging in. If the user is a guest,
       goes into the compare views, and then logs in, the project should be saved with the inputs
       and results that were present before going to the compare views. This is to enforce the
       constraint that inputs and results entered in the compare views should never be saved.
       Without holding onto the original copies of these values, it's not possible to do this.
     */
    App.origProject = App.currentProject;
    App.currentProject = copyProject(App.origProject, aoi_census);

    App.user.on('change:guest', saveAfterLogin);
    App.origProject.on('change:id', updateUrl);

    /* transform the result models for display: each result object with n
        actual "result data" objects is mapped to n result objects, which are
        clones with only a single data item; doing so permits the
        comparison view to invert the aggregation scheme, such that it
        displays multiple selectable items of the same "type" rather than
        a group of items of the same (selectable) "type"
    */
    var currentScenarios = App.currentProject.get('scenarios').models;

    var displayModels = _.map(currentScenarios, function(scenarioModel) {
        var resultModels = scenarioModel.get('results').models;
        var transformedModels = _.map(resultModels, function (r) {
            var results = r.get('result');
            var clones = _.map(results, function (value, key) {
                var clone = r.clone();
                clone.set('result', { key: key, value: value });
                clone.set('displayName', cropTypes[key]);
                return clone;
            });
            return clones;
        });

        // transformedModels is an array type but will always have a single element,
        // taking the head of the list is a vestigial necessity from the original
        // MMW implementation
        return _.head(transformedModels);
    });

    // filter models for those with nonzero data in any scenario
    var nonzeroCrops = _.chain(displayModels)
        .flatten()
        .map(function(d) { return d.get('result'); })
        .filter(function(d) { return d.value !== 0; })
        .pluck('key')
        .uniq()
        .value();

    var filteredModels = _.map(displayModels, function(displayModel) {
        var filteredResults = _.filter(displayModel, function(resultModel) {
            return _.contains(nonzeroCrops, resultModel.get('result').key);
        });
        return filteredResults;
    });
    
    // defaultResults is used for scenario(s) with no modifications
    var defaultResults = _.head(filteredModels);

    // pair scenarios with their filtered result models and update
    _.each(_.zip(currentScenarios, filteredModels), function(pair) {
        var scenarioModel = pair[0];
        var newResultsModel = pair[1];
        if (_.size(newResultsModel) === 0) {
            newResultsModel = defaultResults;
        }
        scenarioModel.get('results').models = newResultsModel;
    });
}

// Creates a special-purpose copy of the project
// for the compare views, since creating a true deep
// clone is more difficult and unnecessary.
function copyProject(project, aoi_census) {
    var scenariosCopy = new modelingModels.ScenariosCollection();
    project.get('scenarios').forEach(function(scenario) {
        var scenarioCopy = new modelingModels.ScenarioModel({});
        scenarioCopy.set({
            name: scenario.get('name'),
            is_current_conditions: scenario.get('is_current_conditions'),
            modifications: scenario.get('modifications'),
            modification_hash: scenario.get('modification_hash'),
            modification_censuses: scenario.get('modification_censuses'),
            results: new modelingModels.ResultCollection(scenario.get('results').toJSON()),
            inputs: new modelingModels.ModificationsCollection(scenario.get('inputs').toJSON()),
            inputmod_hash: scenario.get('inputmod_hash'),
            allow_save: false
        });
        if (aoi_census) {
            scenarioCopy.set('aoi_census', aoi_census);
        }
        scenarioCopy.get('inputs').on('add', _.debounce(_.bind(scenarioCopy.fetchResults, scenarioCopy), 500));
        scenariosCopy.add(scenarioCopy);
    });
    return new modelingModels.ProjectModel({
        name: App.origProject.get('name'),
        area_of_interest: App.origProject.get('area_of_interest'),
        model_package: App.origProject.get('model_package'),
        scenarios: scenariosCopy,
        allow_save: false
    });
}

function saveAfterLogin(user, guest) {
    if (!guest && App.origProject.isNew()) {
        var user_id = user.get('id');
        App.origProject.set('user_id', user_id);
        App.origProject.get('scenarios').each(function(scenario) {
            scenario.set('user_id', user_id);
        });
        // Save the origProject (as opposed to the currentProject)
        // to not include changes to inputs and results.
        App.origProject.saveProjectAndScenarios();
    }
}

function updateUrl() {
    // Use replace: true, so that the back button will work as expected.
    router.navigate(App.origProject.getCompareUrl(), { replace: true });
}

function showCompareWindow() {
    var compareWindow = new views.CompareWindow({
            model: App.currentProject
        });
    App.rootView.footerRegion.show(compareWindow);
}

module.exports = {
    CompareController: CompareController
};
