"use strict";

var $ = require('jquery'),
    Marionette = require('../shim/backbone.marionette'),
    views = require('./core/views'),
    models = require('./core/models'),
    settings = require('./core/settings'),
    userModels = require('./user/models'),
    userViews = require('./user/views');

var App = new Marionette.Application({
    initialize: function() {
        this.map = new models.MapModel();
        this.state = new models.AppStateModel();

        // This view is intentionally not attached to any region.
        this._mapView = new views.MapView({
            model: this.map,
            el: '#map'
        });

        this._mapView.on('change:needs_reset', function(needs) {
            App.currentProject.set('needs_reset', needs);
        });

        this.rootView = new views.RootView({app: this});
        this.user = new userModels.UserModel({});

        this.header = new views.HeaderView({
            el: 'header',
            model: this.user,
            appState: this.state
        });

        this.header.render();

        // Not set until modeling/controllers.js creates a
        // new project.
        this.currentProject = null;
    },

    load: function(data) {
        var mapState = data.map;
        if (mapState) {
            this.map.set({
                lat: mapState.lat,
                lng: mapState.lng,
                zoom: mapState.zoom
            });
        }
    },

    getMapView: function() {
        return this._mapView;
    },

    getLeafletMap: function() {
        return this._mapView._leafletMap;
    },

    getUserOrShowLogin: function() {
        this.user.fetch().always(function() {
            if (App.user.get('guest')) {
                App.showLoginModal();
            }
        });
    },

    showLoginModal: function() {
        new userViews.LoginModalView({
            model: new userModels.LoginFormModel({}),
            app: this
        }).render();
    }
});

module.exports = App;
