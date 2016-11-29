'use strict';

var L = require('leaflet'),
    $ = require('jquery'),
    _ = require('underscore'),
    Marionette = require('../../shim/backbone.marionette'),
    App = require('../app'),
    layerControlButtonTmpl = require('./templates/layerToggleControl.html'),
    layerControlListTmpl = require('./templates/layerControlListTmpl.html');


module.exports = L.Control.extend({
    options: {
        layers: {},
        position: 'bottomleft'
    },

    onAdd: function(map) {
        var layerControl = new LayerControlButtonView({
            layers: this.options.layers,
            map: map,
            initialLayer: this.options.initialLayer
        });

        return layerControl.render().el;
    }
});

var LayerControlButtonView = Marionette.ItemView.extend({
    template: layerControlButtonTmpl,
    className: 'leaflet-control leaflet-control-layers',

    initialize: function(options) {
        var initialLayer = options.initialLayer;
        this.layers = options.layers;
        this.map = options.map;
        this.map.addLayer(initialLayer);

        this.satelliteVisible = initialLayer.options.display === 'satellite';
    },

    ui: {
        controlToggle: '.leaflet-bar-part',
    },

    events: {
        'click @ui.controlToggle': 'toggle'
    },

    removeLayer: function(name) {
        var map = this.map;
        _.each(this.map._layers, function (layer) {
            if (layer.options) {
                if (layer.options.display === name) {
                    map.removeLayer(layer);
                }
            }
        });
    },

    toggle: function() {
        if (this.satelliteVisible) {
            this.map.addLayer(this.layers.street);
            this.removeLayer('satellite');
        } else {
            this.map.addLayer(this.layers.satellite);
            this.removeLayer('street');
        }

        this.satelliteVisible = !this.satelliteVisible;
        this.render();
    },

    templateHelpers: function() {
        return {
            currentBasemap: this.satelliteVisible ? "Streets" : "Satellite",
            lyr_img: this.satelliteVisible ?  "/static/images/street_thumb.png" : "/static/images/satellite_thumb.png",
        };
    }
});
