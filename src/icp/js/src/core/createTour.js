"use strict";

var _ = require('lodash'),
    hopscotch = require('hopscotch'),
    App = require('../app'),
    modelingModels = require('../modeling/models');

var Tour = {
    getStatus: function() {
        var step = localStorage.getItem(this.id);
        return step !== null ? parseInt(step) : null;
    },

    shouldResume: function() {
        return localStorage.getItem(this.id) < this.steps.length;
    },

    showTour: function() {
        if (hopscotch.getState()) {
            hopscotch.endTour();
        }

        var step = this.getStatus();
        if (step === null) {
            hopscotch.startTour(this);
        } else if (this.shouldResume()) {
            hopscotch.startTour(this, step);
        }
    },

    showTourIfNecessary: function() {
        if (App.user.get('guest')) {
            this.showTour();
        } else {
            var projects = new modelingModels.ProjectCollection();
            projects
                .fetch()
                .done(_.bind(function() {
                    if (projects.length > 1) {
                        // Assume if the user has more than one project,
                        // they don't need to see the tour
                        return;
                    }

                    this.showTour();
                }, this));
        }
    },

    initTour: function() {
        localStorage.setItem(this.id, 0);
    },

    incrementStep: function() {
        localStorage.setItem(this.id, hopscotch.getCurrStepNum());
    },

    finishTour: function() {
        localStorage.setItem(this.id, this.steps.length);
    },
};

module.exports =  function createTour(tour) {
    var tourObject = _.assign(Object.create(Tour), tour);

    // Make sure the hopscotch callbacks bind to the tour object
    tourObject.onStart = _.bind(tourObject.initTour, tourObject);
    tourObject.onNext = _.bind(tourObject.incrementStep, tourObject);
    tourObject.onEnd = _.bind(tourObject.finishTour, tourObject);
    tourObject.onClose = _.bind(tourObject.finishTour, tourObject);
    return tourObject;
};
