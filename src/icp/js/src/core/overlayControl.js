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
        this.initialOpacity = 0.50;
        this.layer.setOpacity(this.initialOpacity);
    },

    ui: {
        controlToggle: '.eye-button',
    },

    events: {
        'click @ui.controlToggle': 'toggle',
        'mousedown input': 'handleMouseDownEvent',
        'mouseup input': 'handleMouseUpEvent',
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

    handleMouseDownEvent: function(e) {
        this.map.dragging.disable();
    },

    handleMouseUpEvent: function(e) {
        this.map.dragging.enable();
        var el = $(e.target),
        sliderValue = el.val();
        this.layer.setOpacity(sliderValue / 100);
        el.attr('value', sliderValue);
    },

    templateHelpers: function() {
        return {
            iconClass: this.isDisplayed ? "fa fa-eye-slash" : "fa fa-eye",
            inputType: this.isDisplayed ? "range" : "hidden",
            layerName: 'Crop Layer',
            initialOpacity: this.initialOpacity * 100,
        };
    }
});
