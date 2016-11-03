"use strict";

var Backbone = require('../../shim/backbone');

var ToolbarModel = Backbone.Model.extend({
    defaults: {
        toolsEnabled: true,
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
