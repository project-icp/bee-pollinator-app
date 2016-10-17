"use strict";

var ErrorHandlers = require('./handlers').ErrorHandlers;

var ErrorController = {
    error: function(type) {
        ErrorHandlers.generic(type);
    }
};

module.exports = {
    ErrorController: ErrorController
};
