"use strict";

var Backbone = require('../../../shim/backbone');

var ConfirmModel = Backbone.Model.extend({
    defaults: {
        question: 'Are you sure?',
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel'
    }
});

var InputModel = Backbone.Model.extend({
    defaults: {
        initial: '',
        title: 'Input Value',
        fieldLabel: ''
    }
});

var ShareModel = Backbone.Model.extend({
    defaults: {
        text: '',
        url: window.location.href,
        // The following flags cause prompts before showing the actual share
        // modal, so we set them to false by default so when not explicitly
        // specified, they will not change behavior and just show the modal.
        guest: false,     // If true, prompt the user to login first
        is_private: false // If true, prompt the user to make project public
    }
});

module.exports = {
    ConfirmModel: ConfirmModel,
    InputModel: InputModel,
    ShareModel: ShareModel
};
