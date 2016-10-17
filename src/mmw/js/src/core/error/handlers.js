"use strict";

var router = require('../../router').router;

var ErrorHandlers = {
    generic: function(type) {
        router.navigate('');
        window.alert("We're sorry, but an error occurred in the application.");
        console.log("[MMW] An unknown error occurred: " + type);
    }
};

module.exports = {
    ErrorHandlers: ErrorHandlers
};
