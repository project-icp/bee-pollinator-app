"use strict";

var _ = require('underscore'),
    coreUtils = require('../utils.js'),
    Marionette = require('../../../shim/backbone.marionette'),
    Clipboard = require('clipboard'),
    models = require('./models'),
    modalConfirmTmpl = require('./templates/confirmModal.html'),
    modalInputTmpl = require('./templates/inputModal.html'),
    modalShareTmpl = require('./templates/shareModal.html'),
    modalAlertTmpl = require('./templates/alertModal.html'),

    ENTER_KEYCODE = 13,
    BASIC_MODAL_CLASS = 'modal modal-basic fade';

var ModalBaseView = Marionette.ItemView.extend({
    className: BASIC_MODAL_CLASS,

    attributes: function() {
        var defaults = { 'tabindex': '-1' },
            feedbackRequired = {
                'data-backdrop': 'static',
                'data-keyboard': 'false'
            };

        // If feedback is required, we don't allow the user to get away from
        // the modal without clicking confirm or deny. This way we ensure we
        // get an event one way or another.
        // http://getbootstrap.com/javascript/#modals-options
        return this.model.get('feedbackRequired') ? _.extend(defaults, feedbackRequired) : defaults;
    },

    events: {
        'shown.bs.modal': 'onModalShown',
        'keyup': 'onKeyUp',
        'hidden.bs.modal': 'onModalHidden'
    },

    onRender: function() {
        this.$el.modal('show');
    },

    onModalShown: function() {
        // Not implemented.
    },

    onKeyUp: function(e) {
        if (e.keyCode === ENTER_KEYCODE) {
            this.primaryAction();
        }
    },

    getDisabledState: function($el) {
        var model = this.model;

        if (coreUtils.modalButtonDisabled(model, $el)) {
            return true;
        } else {
            coreUtils.modalButtonToggle(model, $el, false);
            return false;
        }
    },

    primaryAction: function() {
        // Not implemented.
    },

    onModalHidden: function() {
        this.destroy();
    },

    hide: function() {
        this.$el.modal('hide');
    }
});

var AlertView = ModalBaseView.extend({
    template: modalAlertTmpl,

    ui: {
        dismiss: '.btn-default'
    },

    events: _.defaults({
        'click @ui.dismiss': 'dismissAction'
    }, ModalBaseView.prototype.events),

    dismissAction: function() {
        this.triggerMethod('dismiss');
    },

    templateHelpers: function() {
        return _.extend(this.model.get('alertType'), { alertMessage: this.model.get('alertMessage') });
    }
});

var ConfirmView = ModalBaseView.extend({
    template: modalConfirmTmpl,

    ui: {
        confirmation: '.confirm',
        deny: '.btn-default'
    },

    events: _.defaults({
        'click @ui.confirmation': 'primaryAction',
        'click @ui.deny': 'dismissAction'
    }, ModalBaseView.prototype.events),

    primaryAction: function() {
        if (this.getDisabledState(this.ui.confirmation)) {
            return;
        }

        this.triggerMethod('confirmation');
        this.hide();
    },

    dismissAction: function() {
        this.triggerMethod('deny');
    }
});

var InputView = ModalBaseView.extend({
    template: modalInputTmpl,

    ui: {
        save: '.save',
        input: 'input',
        error: '.error'
    },

    events: _.defaults({
        'click @ui.save': 'primaryAction'
    }, ModalBaseView.prototype.events),

    onModalShown: function() {
        this.ui.input.focus().select();
    },

    primaryAction: function() {
        if (this.getDisabledState(this.ui.save) === true) {
            return;
        }

        var val = this.ui.input.val().trim();

        if (val) {
            this.triggerMethod('update', val);
            this.hide();
        } else {
            this.ui.error.text('Please enter a valid project name');
        }
    }
});

var ShareView = ModalBaseView.extend({
    template: modalShareTmpl,

    ui: {
        'signin': '.signin',
        'copy': '.copy',
        'input': 'input'
    },

    events: _.defaults({
        'click @ui.signin': 'signIn'
    }, ModalBaseView.prototype.events),

    // Override to attach Clipboard to ui.copy button
    onRender: function() {
        var self = this;

        this.$el.on('shown.bs.modal', function() {
            new Clipboard(self.ui.copy[0]);
        });

        if (this.model.get('is_private')) {
            var question = 'This project is currently private. ' +
                    'You must make it public before it can be shared with others. ' +
                    'Once public, anyone with the URL can access it.',
                confirm = new ConfirmView({
                    model: new models.ConfirmModel({
                        question: question,
                        confirmLabel: 'Make Public',
                        cancelLabel: 'Cancel'
                    })
                });

            confirm.render();
            confirm.on('confirmation', function() {
                var project = self.options.project || self.options.app.currentProject;

                project.set('is_private', false);
                project.saveProjectListing();

                self.$el.modal('show');
            });
        } else {
            this.$el.modal('show');
        }
    },

    onModalShown: function() {
        this.ui.input.focus().select();
    },

    signIn: function() {
        this.options.app.getUserOrShowLogin();
    }
});

function showAlert(message, alertType) {
    var alertView = new AlertView({
        model: new models.AlertModel({
            alertMessage: message,
            alertType: alertType,
        })
    });
    alertView.render();
}

function showError(message) {
    showAlert(message, models.AlertTypes.error);
}

function showInfo(message) {
    showAlert(message, models.AlertTypes.info);
}

function showWarning(message) {
    showAlert(message, models.AlertTypes.warn);
}


module.exports = {
    ShareView: ShareView,
    InputView: InputView,
    ConfirmView: ConfirmView,
    showError: showError,
    showInfo: showInfo,
    showWarning: showWarning,
};
