"use strict";

var $ = require('jquery'),
    _ = require('lodash'),
    Marionette = require('../../shim/backbone.marionette'),
    App = require('../app'),
    drawUtils = require('../draw/utils'),
    models = require('./models'),
    modificationConfigUtils = require('./modificationConfigUtils'),
    userInputTmpl = require('./templates/controls/userInput.html'),
    thumbSelectTmpl = require('./templates/controls/thumbSelect.html'),
    thumbSelectSummaryTmpl = require('./templates/controls/thumbSelectSummary.html'),
    modDropdownTmpl = require('./templates/controls/modDropdown.html');

// Simulation input controls base class.
var ControlView = Marionette.LayoutView.extend({
    model: models.ModelPackageControlModel,

    className: function() {
        return 'inline ' + this.getControlName();
    },

    initialize: function(options) {
        this.mergeOptions(options, [
            'controlModel',
            'addModification',
            'addOrReplaceInput',
        ]);
    },

    getControlName: function() {
        throw 'Not implemented';
    }
});

var ThumbSelectSummaryView = Marionette.ItemView.extend({
    template: thumbSelectSummaryTmpl,
    modelEvents: {
        'change:activeMod': 'render',
    }
});

var ThumbSelectView = Marionette.LayoutView.extend({
    template: thumbSelectTmpl,

    initialize: function(options) {
        var modKeys = _.flatten(_.pluck(this.model.get('modRowGroups'), 'rows'), true),
            modIds = _.object(_.map(modKeys, function(key) {
                return [key, modificationConfigUtils.getCdlId(key)];
            }));

        this.model.set({
            activeMod: null,
            modIds: modIds
        });
        this.addModification = options.addModification;
    },

    ui: {
        thumb: '.thumb',
        drawControl: '[data-value]'
    },

    regions: {
        summaryRegion: '.thumb-summary-region',
    },

    events: {
        'click @ui.drawControl': 'onThumbClick',
        'mouseenter @ui.thumb': 'onThumbHover'
    },

    onShow: function() {
        this.summaryRegion.show(new ThumbSelectSummaryView({
            model: this.model,
        }));
    },

    onThumbHover: function(e) {
        var modKey = $(e.currentTarget).data('value');
        this.model.set('activeMod', modKey);
    },

    onThumbClick: function(e) {
        var $el = $(e.currentTarget),
            controlName = this.model.get('controlName'),
            controlValue = $el.data('value');

        this.startDrawing(controlName, controlValue);
    },

    startDrawing: function(controlName, controlValue) {
        var self = this,
            map = App.getLeafletMap(),
            drawOpts = modificationConfigUtils.getDrawOpts(controlValue);

        this.model.set('dropdownOpen', false);
        drawUtils.drawPolygon(map, drawOpts).then(function(geojson) {
            self.addModification(new models.ModificationModel({
                name: controlName,
                value: controlValue,
                cdlId: modificationConfigUtils.getCdlId(controlValue),
                summary: modificationConfigUtils.getHumanReadableSummary(controlValue),
                shape: geojson
            }));
        });
    }
});

var ModificationsView = ControlView.extend({
    template: modDropdownTmpl,

    initialize: function(options) {
        ControlView.prototype.initialize.apply(this, [options]);
        var self = this;

        function closeDropdownOnOutsideClick(e) {
            var isTargetOutsideDropdown = $(e.target).parents('.dropdown-menu').length === 0;
            if (isTargetOutsideDropdown && self.model.get('dropdownOpen')) {
                self.closeDropdown();
            }
        }

        /*
            If not in manualMode, and there was a click outside this view, and dropdown is
            open, then close the dropdown. We don't do this in  manualMode because
            highlighting the value in the input by clicking and then dragging outside the
            dropdown closes the dropdown, and this is not correct. A more sophisticated
            solution is possible, but this is a quickfix for the moment.
        */
        $(document).on('mouseup', function(e) {
            if (!self.model.get('manualMode')) {
                closeDropdownOnOutsideClick(e);
            }
        });
    },

    ui: {
        dropdownButton: '.dropdown-button'
    },

    events: {
        'click @ui.dropdownButton': 'onClickDropdownButton'
    },

    modelEvents: {
        'change:dropdownOpen': 'render',
        'change:manualMod': 'updateContent'
    },

    regions: {
        modContentRegion: '.mod-content-region'
    },

    closeDropdown: function() {
        this.model.set({
            dropdownOpen: false,
            manualMod: null,
            output: null
        });
    },

    openDropdown: function() {
        this.model.set('dropdownOpen', true);
    },

    onClickDropdownButton: function() {
        var dropdownOpen = this.model.get('dropdownOpen');
        if (this.model.get('manualMode')) {
            if (dropdownOpen) {
                this.closeDropdown();
            } else {
                this.openDropdown();
            }
        } else if (!this.model.get('dropdownOpen')) {
            this.openDropdown();
        }
    },

    onRender: function() {
        this.updateContent();
    },

    updateContent: function() {
        this.modContentRegion.show(new ThumbSelectView({
            addModification: this.addModification,
            model: this.model
        }));
    }
});

var LandCoverView = ModificationsView.extend({
    initialize: function(options) {
        ModificationsView.prototype.initialize.apply(this, [options]);
        this.model.set({
            controlName: this.getControlName(),
            controlDisplayName: 'Land Cover',
            modRowGroups: [{
                name: 'Crops',
                rows: [
                    ['almonds', 'apples', 'blueberries', 'cherries'],
                    ['pumpkins', 'raspberries', 'watermelons', 'grassland'],
                ]
            },
            {
                name: 'Crops with Cover Crops',
                rows: [
                    ['almonds_with_cover_crop', 'apples_with_cover_crop', 'blueberries_with_cover_crop', 'cherries_with_cover_crop'],
                    ['pumpkins_with_cover_crop', 'raspberries_with_cover_crop', 'watermelons_with_cover_crop']
                ]
            }]
        });
    },

    getControlName: function() {
        return 'landcover';
    }
});

var ConservationPracticeView = ModificationsView.extend({
    initialize: function(options) {
        ModificationsView.prototype.initialize.apply(this, [options]);
        this.model.set({
            controlName: this.getControlName(),
            controlDisplayName: 'Pollinator Plantings',
            modRowGroups: [{
                name: '',
                rows: [
                    ['wildflower', 'woody', 'wildflower_woody_mix'],
                ]
            }]
        });
    },

    getControlName: function() {
        return 'conservation_practice';
    }
});

var NumberOfHivesView = ControlView.extend({
    template: userInputTmpl,

    ui: { input: 'input' },

    events: {
        'change @ui.input': 'onInputChange',
    },

    onInputChange: function() {
        var value = parseFloat(this.ui.input.val()) || 0;

        this.addOrReplaceInput(new models.ModificationModel({
            name: this.getControlName(),
            value: value
        }));

        this.ui.input.val(value);
    },

    templateHelpers: function() {
        return {
            displayName: 'Managed hives per acre',
            value: this.controlModel.get('value') || 0,
        };
    },

    getControlName: function() {
        return 'numberofhives';
    }
});

function getControlView(controlName) {
    switch (controlName) {
        case 'landcover':
            return LandCoverView;
        case 'conservation_practice':
            return ConservationPracticeView;
        case 'numberofhives':
            return NumberOfHivesView;
    }
    throw 'Control not implemented: ' +  controlName;
}

module.exports = {
    LandCoverView: LandCoverView,
    ConservationPracticeView: ConservationPracticeView,
    NumberOfHivesView: NumberOfHivesView,
    getControlView: getControlView,
};
