"use strict";

var defaultSettings = {
    draw_tools: [],
    map_controls: [],
    model_packages: []
};

var settings = (function() {
    return window.clientSettings ? window.clientSettings : defaultSettings;
})();

function set(key, value) {
    settings[key] = value;
    return value;
}

function get(key) {
    try {
        return settings[key];
    } catch (exc) {
        return undefined;
    }
}

module.exports = {
    get: get,
    set: set
};
