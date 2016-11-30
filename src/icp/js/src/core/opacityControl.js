'use strict';

var L = require('leaflet'),
    $ = require('jquery'),
    _ = require('underscore'),
    Marionette = require('../../shim/backbone.marionette'),
    opacityControlTmpl = require('./templates/opacityControl.html');

module.exports = L.Control.extend({
    options: {
        position: 'bottomleft'
    },

    onAdd: function (map) {
        var control_div = L.DomUtil.create('div', 'opacity_control'),
            view = new OpacityControlView().render().el;

        $(control_div).append(view);
        return control_div;
    }
});

var OpacityControlView = Marionette.ItemView.extend({
    template: opacityControlTmpl,
    className: 'leaflet-control leaflet-control-opacity',

    initialize: function() {
        this.hasBeenToggled = false;
    },

    ui: {
        controlToggle: '.leaflet-bar-part',
    },

    events: {
        'click @ui.controlToggle': 'toggle'
    },

    toggle: function() {
        if (this.hasBeenToggled) {
        } else {
        }
        this.hasBeenToggled = !this.hasBeenToggled;
        this.render();
    },

    templateHelpers: function() {
        return {
            layerName: "CDL Layer",
            iconClass: this.hasBeenToggled ? "fa fa-eye-slash" : "fa fa-eye",
        };
    }
});
