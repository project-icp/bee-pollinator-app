"use strict";
var $ = require('jquery');

var modificationConfig = require('../core/modificationConfig.json');

// Useful for testing.
function setConfig(config) {
    modificationConfig = config;
}

function resetConfig() {
    modificationConfig = require('../core/modificationConfig.json');
}

function unknownModKey(modKey) {
    console.warn('Unknown Land Cover or Conservation Practice: ' + modKey);
    return '';
}

// modKey should be a key in modificationsConfig (eg. 'open_water').
function getHumanReadableName(modKey) {
    if (modificationConfig[modKey]) {
        return modificationConfig[modKey].name;
    }
    return unknownModKey(modKey);
}

// If no shortName, just use name.
function getHumanReadableShortName(modKey) {
    if (modificationConfig[modKey]) {
        if (modificationConfig[modKey].shortName) {
            return modificationConfig[modKey].shortName;
        } else {
            return modificationConfig[modKey].name;
        }
    }
    return unknownModKey(modKey);
}

function getHumanReadableSummary(modKey) {
    if (modificationConfig[modKey]) {
        return modificationConfig[modKey].summary || '';
    }
    return unknownModKey(modKey);
}

function getCdlId(modKey) {
    if (modificationConfig[modKey]) {
        return modificationConfig[modKey].value || 0;
    }
    return unknownModKey(modKey);
}

/*
 * Retrieve configuration for vector drawing of modification types,
 * both Land Cover and Enhancements.
 * Args:
 *   modKey (string): The key for the modification entry in modificationConfig
 *   shared (bool): Will augment the returned rendering options to include
 *      changes appropriate for shared vectors drawn across scenarios.
 */
var getDrawOpts = function(modKey, shared) {
    var defaultOpacity = shared ? 0.55 : 0.8,
        defaultStrokeWidth = shared ? 1 : 2,
        defaultStyle = {
            weight: defaultStrokeWidth,
            color: '#212121',
            opacity: defaultOpacity,
            strokeWidth: defaultStrokeWidth,
            fillColor: '#212121',
            fillOpacity: defaultOpacity
        };

    if (modKey && modificationConfig[modKey]) {
        var config = modificationConfig[modKey];

        return $.extend(defaultStyle, {
            className: 'crop-' + config.value,
            fillColor: 'url(#fill-crop-' + config.value + ')',
        });
    } else {
        return defaultStyle;
    }
};

module.exports = {
    getHumanReadableName: getHumanReadableName,
    getHumanReadableShortName: getHumanReadableShortName,
    getHumanReadableSummary: getHumanReadableSummary,
    getCdlId: getCdlId,
    getDrawOpts: getDrawOpts,
    setConfig: setConfig,
    resetConfig: resetConfig
};
