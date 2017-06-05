"use strict";

var App = require('../app'),
    models = require('./models'),
    views = require('./views');

var SignUpController = {
    signUp: function() {
        new views.SignUpModalView({
            app: App,
            model: new models.SignUpFormModel({})
        }).render();
    },
};

module.exports = {
    SignUpController: SignUpController
};
