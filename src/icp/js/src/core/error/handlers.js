"use strict";

var router = require('../../router').router,
    modalViews = require('../modals/views');

var ErrorHandlers = {
    generic: function(type) {
        router.navigate('');
        modalViews.showError("We're sorry, but an error occurred in the application.");
        console.log("[ICP] An unknown error occurred: " + type);
    }
};

module.exports = {
    ErrorHandlers: ErrorHandlers
};
