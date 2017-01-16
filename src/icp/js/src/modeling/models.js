"use strict";

var $ = require('jquery'),
    Backbone = require('../../shim/backbone'),
    _ = require('lodash'),
    utils = require('../core/utils'),
    settings = require('../core/settings'),
    App = require('../app'),
    coreModels = require('../core/models'),
    turfArea = require('turf-area'),
    turfErase = require('turf-erase'),
    turfIntersect = require('turf-intersect');

var YIELD_TASK = 'yield';
var YIELD_PACKAGE = 'yield';

var ModelPackageControlModel = Backbone.Model.extend({
    defaults: {
        name: '',
        controlName: '',
        controlDisplayName: '',
        activeMod: '',
        modRows: null,
        dropdownOpen: false,
        dataModel: null,
        output: null
    },

    // Return true if this is an input control and false if it is a
    // modification control.
    isInputControl: function() {
        return _.contains([
            'numberofhives'
        ], this.get('name'));
    }
});

var ModelPackageControlsCollection = Backbone.Collection.extend({
    model: ModelPackageControlModel
});

var ModelPackageModel = Backbone.Model.extend();

var YieldTaskModel = coreModels.TaskModel.extend({
    defaults: _.extend(
        {
            taskName: YIELD_TASK,
            taskType: 'modeling'
        },
        coreModels.TaskModel.prototype.defaults
    )
});

var ResultModel = Backbone.Model.extend({
    defaults: {
        name: '', // Code name for type of result, eg. runoff
        displayName: '', // Human-readable name for type of result, eg. Runoff
        inputmod_hash: null, // MD5 string generated from result
        result: null, // The actual result object
        polling: false, // True if currently polling
        active: false, // True if currently selected in Compare UI
    },

    isEmpty: function() {
        return !this.get('result');
    },

    /* Does this ResultModel instance have a differing value for
     * the provided inputmod_has?  This is an indication that the
     * results are old and need to be fetched again.
     */
    isStale: function(hash) {
        if (this.isEmpty()) {
            return true;
        }

        return this.get('inputmod_hash') !== hash;
    }
});

var ResultCollection = Backbone.Collection.extend({
    model: ResultModel,

    setPolling: function(polling) {
        this.forEach(function(resultModel) {
            resultModel.set('polling', polling);
        });
    },

    setNullResults: function() {
        this.forEach(function(resultModel) {
            resultModel.set('result', null);
        });
    },

    getResult: function(name) {
        return this.findWhere({name: name});
    },

    getResultByAttribute: function(attribute, value) {
        var d = {};
        d[attribute] = value;
        return this.findWhere(d);
    },

    setActive: function(name) {
        this.invoke('set', 'active', false);
        this.getResult(name).set('active', true);
        this.trigger('change:active');
    },

    setActiveByAttribute: function(attribute, value) {
        this.invoke('set', 'active', false);
        this.getResultByAttribute(attribute, value).set('active', true);
        this.trigger('change:active');
    },

    getActive: function() {
        return this.findWhere({active: true});
    },

    makeFirstActive: function() {
        this.setActive(this.at(0).get('name'));
    },
});

var ProjectModel = Backbone.Model.extend({
    urlRoot: '/api/modeling/projects/',

    defaults: {
        name: '',
        created_at: null,               // Date
        area_of_interest: null,         // GeoJSON
        area_of_interest_name: null,    // Human readable string for AOI.
        model_package: YIELD_PACKAGE,   // Package name
        scenarios: null,                // ScenariosCollection
        user_id: 0,                     // User that created the project
        is_activity: false,             // Project that persists across routes
        gis_data: null,                 // Additionally gathered data
        needs_reset: false,             // Should we overwrite project data on next save?
        allow_save: true,               // Is allowed to save to the server - false in compare mode
        aoi_census: null                // JSON blob
    },

    initialize: function() {
        var scenarios = this.get('scenarios');
        if (scenarios === null || typeof scenarios === 'string') {
            this.set('scenarios', new ScenariosCollection());
        }

        this.set('user_id', App.user.get('id'));

        // If activity mode is enabled make sure to initialize the project as
        // an activity.
        this.set('is_activity', settings.get('activityMode'));

        this.listenTo(this.get('scenarios'), 'add', this.addIdsToScenarios, this);
        this.get('scenarios').on('change:modification_hash', this.shareGlobalModifications, this);
    },

    shareGlobalModifications: function(changedScenario) {
        // When modifications are made to current conditions, add them
        // to all other scenarios as well
        var scenarios = this.get('scenarios');
        if (changedScenario.get('is_current_conditions')) {
            var sharedMods = changedScenario.get('modifications').toJSON();
            scenarios.each(function(scenario) {
                if (changedScenario.cid !== scenario.cid) {
                    scenario.get('shared_modifications').reset(sharedMods);
                }
            });
        }
    },

    setProjectModel: function(modelPackage) {
        this.set('model_package', modelPackage);
    },

    createTaskModel: function() {
        return createTaskModel(this.get('model_package'));
    },

    createTaskResultCollection: function() {
        return createTaskResultCollection(this.get('model_package'));
    },

    fetchResultsIfNeeded: function() {
        var promises = [];

        this.get('scenarios').forEach(function(scenario) {
            promises.push(scenario.fetchResultsIfNeeded());
        });

        this.get('scenarios').on('change:active', function(scenario) {
            if (scenario.get('active')) {
                scenario.fetchResultsIfNeeded();
            }
        });

        this.get('scenarios').on('add', function(scenario) {
            scenario.fetchResultsIfNeeded();
        });

        return $.when.apply($, promises);
    },

    updateName: function(newName) {
        // TODO: Having fetched a users list of projects,
        // ensure that this new name is unique prior to saving
        this.set('name', newName);
    },

    // Flag to prevent double POSTing of a project.
    saveCalled: false,

    saveProjectListing: function() {
        var listingAttrs = [
                'id', 'name', 'area_of_interest_name', 'is_private',
                'model_package', 'created_at', 'modified_at', 'user'
            ],
            attrs = _.pick(this.toJSON(), listingAttrs);

        // Server expects user to be id, not object
        if (attrs.user.id) {
            attrs.user = attrs.user.id;
        }

        this.save(attrs, { patch: true });
    },

    saveProjectAndScenarios: function() {
        if (!this.get('allow_save') || !App.user.loggedInUserMatch(this.get('user_id'))) {
            // Fail fast if the user can't save the project.
            return;
        }

        if (this.isNew() && this.saveCalled) {
            // Fail fast if we are in the middle of our first save.
            return;
        } else if (this.isNew() && !this.saveCalled) {
            // We haven't saved the project before, save the project and then
            // set the project ID on each scenario.
            var self = this;
            this.saveCalled = true;

            this.save()
                .done(function() {
                    self.updateProjectScenarios(self.get('id'), self.get('scenarios'));
                })
                .fail(function() {
                    console.log('Failed to save project');
                });
        } else {
            this.save()
                .fail(function() {
                    console.log('Failed to save project');
                });
        }
    },

    addIdsToScenarios: function() {
        var projectId = this.get('id');

        if (!projectId) {
            this.saveProjectAndScenarios();
        } else {
            this.updateProjectScenarios(projectId, this.get('scenarios'));
        }
    },

    updateProjectScenarios: function(projectId, scenarios) {
        scenarios.each(function(scenario) {
            if (!scenario.get('project')) {
                scenario.set('project', projectId);
            }
        });
    },

    parse: function(response) {
        if (response.scenarios) {
            // If we returned scenarios (probably from a GET) then set them.
            var user_id = response.user.id,
                scenariosCollection = this.get('scenarios'),
                scenarios = _.map(response.scenarios, function(scenario) {
                    var scenarioModel = new ScenarioModel(scenario);
                    scenarioModel.set('user_id', user_id);
                    scenarioModel.set('taskModel', createTaskModel(response.model_package));
                    scenarioModel.set('results', createTaskResultCollection(response.model_package));
                    scenarioModel.get('modifications').reset(scenario.modifications);
                    if (!_.isEmpty(scenario.results)) {
                        scenarioModel.get('results').reset(scenario.results);
                    }

                    return scenarioModel;
                });

            scenariosCollection.reset(scenarios);

            // Apply current condition's modifications to all other scenarios
            var currentConditions = scenariosCollection.findWhere({is_current_conditions: true});
            this.shareGlobalModifications(currentConditions);

            // Set the user_id to ensure controls are properly set.
            response.user_id = user_id;

            delete response.scenarios;
        }

        return response;
    },

    getReferenceUrl: function() {
        // Return a url fragment that can access this project at its
        // current state /project/<id>/scenario/<id>
        var root = '/project/';

        if (this.get('id')) {
            var modelPart = this.id,
                scenarioPart = '',
                activeScenario = this.get('scenarios').getActiveScenario();

            if (activeScenario && activeScenario.id) {
                scenarioPart = '/scenario/' + activeScenario.id;
            }

            return root + modelPart + scenarioPart;
        }
        return root;
    },

    getCompareUrl: function() {
        // Return a url fragment that can access the compare view.
        var root = '/project/',
            id = this.get('id'),
            url = root + 'compare';

        if (id) {
            url = root + id + '/compare';
        }

        return url;
    }
});

var ProjectCollection = Backbone.Collection.extend({
    url: '/api/modeling/projects/',

    model: ProjectModel
});

var ModificationModel = coreModels.GeoModel.extend({
    defaults: _.extend({
            name: '',
            type: '',
            summary: '',
            effectiveArea: null, // Area after being clip by AoI
            effectiveUnits: null, // Units of effective area
            effectiveShape: null, // GeoJSON after being clip by AoI,
        }, coreModels.GeoModel.prototype.defaults
    ),

    initialize: function() {
        coreModels.GeoModel.prototype.initialize.apply(this, arguments);

        if (this.get('effectiveArea') === null) {
            this.setEffectiveArea();
        }
    },

    setEffectiveArea: function() {
        var aoi = App.map.get('areaOfInterest'),
            shape = this.get('shape');

        this.set('effectiveShape', shape);
        this.setDisplayArea('effectiveShape', 'effectiveArea', 'effectiveUnits');
    }
});

var ModificationsCollection = Backbone.Collection.extend({
    model: ModificationModel
});

var ScenarioModel = Backbone.Model.extend({
    urlRoot: '/api/modeling/scenarios/',

    defaults: {
        name: '',
        is_current_conditions: false,
        user_id: 0, // User that created the project
        inputs: null, // ModificationsCollection
        inputmod_hash: null, // MD5 string
        shared_modifications: null, //ModificationsCollection
        modifications: null, // ModificationsCollection
        modification_hash: null, // MD5 string
        active: false,
        job_id: null,
        results: null, // ResultCollection
        aoi_census: null, // JSON blob
        modification_censuses: null, // JSON blob
        allow_save: true // Is allowed to save to the server - false in compare mode
    },

    initialize: function(attrs) {
        Backbone.Model.prototype.initialize.apply(this, arguments);
        this.set('user_id', App.user.get('id'));

        var defaultMods = {};
        if (App.currentProject.get('model_package') === YIELD_PACKAGE)  {
            defaultMods = {
               inputs: [
                   {
                       name: 'numberofhives',
                       value: 0
                   }
               ]
           };
        }
        _.defaults(attrs, defaultMods);

        this.set('inputs', new ModificationsCollection(attrs.inputs));
        this.set('modifications', new ModificationsCollection(attrs.modifications));
        this.set('shared_modifications', new ModificationsCollection(attrs.shared_modifications));

        this.updateModificationHash();
        this.updateInputModHash();

        this.on('change:project change:name', this.attemptSave, this);
        this.get('modifications').on('add remove change', this.updateModificationHash, this);
        this.get('shared_modifications').on('reset', this.updateModificationHash, this);
        this.on('change:modification_hash', this.updateInputModHash, this);

        var debouncedFetchResults = _.debounce(_.bind(this.fetchResults, this), 500);
        this.get('inputs').on('add', debouncedFetchResults);
        this.get('modifications').on('add remove', debouncedFetchResults);

        this.set('taskModel', App.currentProject.createTaskModel());
        this.set('results', App.currentProject.createTaskResultCollection());
        this.get('results').on('change', this.attemptSave, this);
    },

    attemptSave: function() {
        if (!this.get('allow_save') || !App.user.loggedInUserMatch(this.get('user_id'))) {
            // Fail fast if the user can't save the project.
            return;
        }

        if (!this.get('project')) {
            // TODO replace this with radio/wreqr or something less problematic than the global.
            App.currentProject.saveProjectAndScenarios();
            return;
        }

        if (this.isNew() && this.saveCalled) {
            return;
        } else if (this.isNew() && !this.saveCalled) {
            // Makeshift locking mechanism to prevent double saves.
            this.saveCalled = true;
        }

        // Save silently so server values don't trigger reload
        this.save(null, { silent: true })
            .fail(function() {
                console.log('Failed to save scenario');
            });
    },

    addModification: function(modification) {
        var modifications = this.get('modifications');
        modifications.add(modification);
    },

    addOrReplaceInput: function(input) {
        var inputsColl = this.get('inputs'),
            existing = inputsColl.findWhere({ name: input.get('name') });

        if (existing) {
            inputsColl.remove(existing);
        }

        inputsColl.add(input);
    },

    parse: function(response, options) {
        // In case of new scenarios, update with new server fields,
        // but keep the values of existing fields as they are.
        if (this.isNew()) {
            var newServerFields = _.omit(response, _.keys(this.attributes));
            this.set(newServerFields);
        }

        if (options.silent) {
            // Don't reload server values
            return this.attributes;
        }

        this.get('modifications').reset(response.modifications);
        delete response.modifications;

        this.get('inputs').reset(response.inputs);
        delete response.inputs;

        if (!_.isEmpty(response.results)) {
            this.get('results').reset(response.results);
        }

        delete response.results;

        return response;
    },

    fetchResultsIfNeeded: function() {
        var self = this,
            inputmodHash = this.get('inputmod_hash'),
            resultModel = this.get('results').first(),
            needsResults = resultModel.isEmpty() || resultModel.isStale(inputmodHash),
            isCurrentConditions = this.get('is_current_conditions'),
            fetchResultsPromise;

        if (!isCurrentConditions) {
            if (!this.get('active')) {
                return $.when();
            }

            if (needsResults) {
                var setResultsFromCurrentConditionsOrFetch = _.bind(
                    self.setResultsFromCurrentConditionsOrFetch, self);

                fetchResultsPromise = $.when().then(function() {
                    setResultsFromCurrentConditionsOrFetch();
                });
            }
        } else if (needsResults && self.fetchResultsPromise === undefined) {
            var fetchResults = _.bind(self.fetchResults, self);

            fetchResultsPromise = $.when().then(function() {
                var promises = fetchResults();
                return $.when(promises.startPromise, promises.pollingPromise);
            });
        }

        if (fetchResultsPromise) {
            self.fetchResultsPromise = fetchResultsPromise;
            self.fetchResultsPromise
                .always(function() {
                    // Clear promise so we start a new one next time
                    delete self.fetchResultsPromise;
                });
        }
        // Return fetchResultsPromise if it exists, else an immediately resolved one.
        return self.fetchResultsPromise || $.when();
    },

    setResultsFromCurrentConditionsOrFetch: function() {
        var currentConditions = this.collection.findWhere({
                'is_current_conditions': true
            }),
            ccInputModHash = currentConditions.get('inputmod_hash'),
            ccIsEmpty = currentConditions.get('results').first().isEmpty();

        // Without results in current conditions or if current conditions
        // has diverged from this scenario with respect to modifications,
        // fetch them anew
        if (ccIsEmpty || ccInputModHash !== this.get('inputmod_hash')) {
            var fetchResults = _.bind(this.fetchResults, this),
                promises = fetchResults();

            return $.when(promises.startPromise, promises.pollingPromise);
        } else {
            // If current conditions has results which should be the same,
            // use them here too
            var currentConditionResults = currentConditions.get('results').first();
            this.set('taskModel', currentConditions.get('taskModel').clone());
            this.get('results').first().set({
                'result': currentConditionResults.get('result'),
                'inputmod_hash': currentConditionResults.get('inputmod_hash')
            });
        }
    },

    setResults: function() {
        var rawServerResults = this.get('taskModel').get('result');

        if (!rawServerResults) {
            this.get('results').setNullResults();
        } else {
            var serverResults = JSON.parse(rawServerResults);
            this.get('results').forEach(function(resultModel) {
                var resultName = resultModel.get('name');

                if (serverResults) {
                    resultModel.set({
                        'result': serverResults.yield,
                        'inputmod_hash': serverResults.inputmod_hash
                    });
                } else {
                    console.log('Response is missing ' + resultName + '.');
                }
            });
        }
    },

    // Poll the taskModel for results and reset the results collection when done.
    // If not successful, the results collection is reset to be empty.
    fetchResults: function() {
        this.updateInputModHash();
        this.attemptSave();

        var self = this,
            results = this.get('results'),
            taskModel = this.get('taskModel'),
            gisData = this.getGisData(),
            taskHelper = {
                inputmod_hash: self.get('inputmod_hash'),

                postData: gisData,

                onStart: function() {
                    results.setPolling(true);
                },

                pollSuccess: function() {
                    self.setResults();
                },

                pollFailure: function() {
                    console.log('Failed to get modeling results.');
                    results.setNullResults();
                },

                pollEnd: function(endType) {
                    // Jobs are cancelled by starting a new job with
                    // updated input, continue to poll in that case.
                    if (!endType.cancelledJob) {
                        results.setPolling(false);
                    }
                    self.attemptSave();
                },

                startFailure: function(response) {
                    console.log('Failed to start modeling job.');

                    if (response.responseJSON && response.responseJSON.error) {
                        console.log(response.responseJSON.error);
                    }

                    results.setNullResults();
                    results.setPolling(false);
                }
            };

        // Don't re-request the model results if this is the same input as the
        // current request
        if (this.get('inputmod_hash') ===  taskModel.get('inputmod_hash')) {
            return $.when();
        }

        return taskModel.start(taskHelper);
    },

    updateInputModHash: function() {
        var hash = utils.getCollectionHash(this.get('inputs'));

        if (this.get('modification_hash')) {
            hash += this.get('modification_hash');
        }

        this.set('inputmod_hash', hash);
    },

    updateModificationHash: function() {
        var hash = utils.getCollectionHash(
            this.get('modifications'),
            this.get('shared_modifications')
        );

        this.set('modification_hash', hash);
    },

    getGisData: function() {
        var self = this,
            project = App.currentProject;

        switch(App.currentProject.get('model_package')) {
            case YIELD_PACKAGE:
                var scenarioMods = self.get('modifications').models,
                    sharedMods = self.get('shared_modifications').models,
                    activeModifications = sharedMods.concat(scenarioMods)
                        .map(function(mod) {
                            var attr = mod.attributes;
                            return {
                                shape: attr.shape,
                                area: attr.effectiveArea,
                                category: attr.name,
                                value: attr.cdlId
                            };
                        });

                return {
                    model_input: JSON.stringify({
                        inputs: self.get('inputs').toJSON(),
                        modification_pieces: activeModifications,
                        area_of_interest: project.get('area_of_interest'),
                        aoi_census: self.get('aoi_census'),
                        modification_censuses: self.get('modification_censuses'),
                        inputmod_hash: self.get('inputmod_hash'),
                        modification_hash: self.get('modification_hash')
                    })
                };
        }
    }
});

var ScenariosCollection = Backbone.Collection.extend({
    model: ScenarioModel,
    comparator: 'created_at',

    initialize: function() {
        this.on('reset', this.makeFirstScenarioActive);
    },

    makeFirstScenarioActive: function() {
        var first = this.first();

        if (!first) {
            // Empty collection, fail fast
            return;
        }

        if (!first.get('is_current_conditions')) {
            // First item is not Current Conditions. Find Current Conditions
            // scenario and make it the first.
            var currentConditions = this.findWhere({ 'is_current_conditions': true });

            this.remove(currentConditions);
            this.add(currentConditions, { at: 0 });

            first = currentConditions;
        }

        this.setActiveScenarioByCid(first.cid);
    },

    setActiveScenario: function(scenario) {
        if (scenario) {
            this.invoke('set', 'active', false);
            scenario.set('active', true);
            this.trigger('change:activeScenario', scenario);
            return true;
        }

        return false;
    },

    setActiveScenarioById: function(scenarioId) {
        return this.setActiveScenario(this.get(scenarioId));
    },

    setActiveScenarioByCid: function(cid) {
        return this.setActiveScenario(this.get({ cid: cid }));
    },

    createNewScenario: function(aoi_census) {
        var sharedMods = this.findWhere({is_current_conditions: true}).get('modifications'),
            scenario = new ScenarioModel({
                name: this.makeNewScenarioName('New Scenario'),
                aoi_census: aoi_census,
                shared_modifications: sharedMods.toJSON()
            });

        this.add(scenario);
        this.setActiveScenarioByCid(scenario.cid);
    },

    updateScenarioName: function(model, newName) {
        newName = newName.trim();

        // Bail early if the name actually didn't change.
        if (model.get('name') === newName) {
            return false;
        }

        var match = this.find(function(model) {
            return model.get('name').toLowerCase() === newName.toLowerCase();
        });

        if (match) {
            window.alert("There is another scenario with the same name. " +
                    "Please choose a unique name for this scenario.");

            console.log('This name is already in use.');

            return false;
        } else if (model.get('name') !== newName) {
            return model.set('name', newName);
        }
    },

    duplicateScenario: function(cid) {
        var source = this.get(cid),
            newModel = new ScenarioModel({
                is_current_conditions: false,
                name: this.makeNewScenarioName('Copy of ' + source.get('name')),
                inputs: source.get('inputs').toJSON(),
                modifications: source.get('modifications').toJSON(),
                shared_modifications: source.get('shared_modifications').toJSON()
            });

        this.add(newModel);
        this.setActiveScenarioByCid(newModel.cid);
    },

    // Generate a unique scenario name based off baseName.
    // Assumes a basic structure of "baseName X", where X is
    // iterated as new scenarios with the same baseName are created.
    // The first duplicate will not have an iterated X in the name.
    // The second duplicate will be "baseName 1".
    makeNewScenarioName: function(baseName) {
        var existingNames = this.pluck('name');

        if (!_.contains(existingNames, baseName)) {
            return baseName;
        }

        for (var i = 1; _.contains(existingNames, baseName + ' ' + i); i++) {
            continue;
        }

        return baseName + ' ' + i;
    },

    getActiveScenario: function() {
        return this.findWhere({active: true});
    },

    getCurrentConditions: function() {
        return this.findWhere({is_current_conditions: true});
    }
});

function getControlsForModelPackage(modelPackageName, options) {
    if (modelPackageName === YIELD_PACKAGE) {
        if (options && (options.compareMode ||
                        options.is_current_conditions)) {
            return new ModelPackageControlsCollection([
                new ModelPackageControlModel({ name: 'landcover' })
            ]);
        } else {
            return new ModelPackageControlsCollection([
                new ModelPackageControlModel({ name: 'landcover' }),
                new ModelPackageControlModel({ name: 'conservation_practice' }),
                new ModelPackageControlModel({ name: 'numberofhives' })
            ]);
        }
    }
    throw 'Model package not supported ' + modelPackageName;
}

function createTaskModel(modelPackage) {
    switch (modelPackage) {
        case YIELD_PACKAGE:
            return new YieldTaskModel();
    }
    throw 'Model package not supported: ' + modelPackage;
}

function createTaskResultCollection(modelPackage) {
    switch (modelPackage) {
        case YIELD_PACKAGE:
            return new ResultCollection([
                {
                    name: 'yield',
                    displayName: 'Crop Yield',
                    result: null
                }
            ]);
    }
    throw 'Model package not supported: ' + modelPackage;
}

module.exports = {
    getControlsForModelPackage: getControlsForModelPackage,
    ResultModel: ResultModel,
    ResultCollection: ResultCollection,
    ModelPackageModel: ModelPackageModel,
    ModelPackageControlsCollection: ModelPackageControlsCollection,
    ModelPackageControlModel: ModelPackageControlModel,
    YieldTaskModel: YieldTaskModel,
    YIELD_TASK: YIELD_TASK,
    YIELD_PACKAGE: YIELD_PACKAGE,
    ProjectModel: ProjectModel,
    ProjectCollection: ProjectCollection,
    ModificationModel: ModificationModel,
    ModificationsCollection: ModificationsCollection,
    ScenarioModel: ScenarioModel,
    ScenariosCollection: ScenariosCollection
};
