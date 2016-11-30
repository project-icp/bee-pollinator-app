'use strict';

var L = require('leaflet'),
    $ = require('jquery'),
    _ = require('underscore'),
    Marionette = require('../../shim/backbone.marionette'),
    overlayControlTmpl = require('./templates/overlayControl.html');

module.exports = L.Control.extend({
    options: {
        layer: null,
        position: 'bottomleft'
    },

    onAdd: function (map) {
       return new OverlayControlView({
            map: map,
            layer: this.options.layer
        }).render().el;
    }
});

var OverlayControlView = Marionette.ItemView.extend({
    template: overlayControlTmpl,
    className: 'leaflet-control leaflet-control-overlay',

    initialize: function(options) {
        this.map = options.map;
        this.layer = options.layer;
        this.isDisplayed = false;
    },

    ui: {
        controlToggle: '.leaflet-bar-part',
    },

    events: {
        'click @ui.controlToggle': 'toggle'
    },

    toggle: function() {
        if (this.isDisplayed) {
            this.map.removeLayer(this.layer);
        } else {
            this.map.addLayer(this.layer);
        }
        this.isDisplayed = !this.isDisplayed;
        this.render();
    },

    templateHelpers: function() {
        return {
            iconClass: this.isDisplayed ? "fa fa-eye-slash" : "fa fa-eye",
            action: this.isDisplayed ? 'Hide' : 'Show',
            layerName: "Crop Layer",
        };
    }
});
