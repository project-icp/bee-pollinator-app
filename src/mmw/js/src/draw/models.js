"use strict";

var Backbone = require('../../shim/backbone'),
    _ = require('jquery'),
    coreModels = require('../core/models');

var ToolbarModel = Backbone.Model.extend({
    defaults: {
        toolsEnabled: true,
        // Array of { endpoint, tableId, display } objects.
        predefinedShapeTypes: null,
        outlineFeatureGroup: null,
        polling: false,
        pollError: false
    },

    enableTools: function() {
        this.set('toolsEnabled', true);
    },

    disableTools: function() {
        this.set('toolsEnabled', false);
    }
});

module.exports = {
    ToolbarModel: ToolbarModel,
};
