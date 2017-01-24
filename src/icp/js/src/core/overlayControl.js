'use strict';

var L = require('leaflet'),
    $ = require('jquery'),
    _ = require('underscore'),
    Marionette = require('../../shim/backbone.marionette'),
    overlayControlTmpl = require('./templates/overlayControl.html'),
    cropTypes = require('./cropTypes.json');

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
        this.isLegendOpen = false;
        this.initialOpacity = 0.50;
        this.layer.setOpacity(this.initialOpacity);
    },

    ui: {
        controlToggle: '.eye-button',
        legendToggle: '.legend-button',
        legendDropdown: '.crop-legend-dropdown > .dropdown-menu',
    },

    events: {
        'click @ui.controlToggle': 'toggle',
        'click @ui.legendToggle': 'toggleLegend',
        'mouseover @ui.legendDropdown': 'disableMapScrollZoom',
        'mouseout @ui.legendDropdown': 'enableMapScrollZoom',
        'mousedown @ui.legendDropdown': 'disableMapDragging',
        'mouseup @ui.legendDropdown': 'enableMapDragging',
        'mousedown input': 'disableMapDragging',
        'mouseup input': 'handleMouseUpEvent',
    },

    toggle: function() {
        if (this.isDisplayed) {
            this.map.removeLayer(this.layer);
            this.isLegendOpen = false;
        } else {
            this.map.addLayer(this.layer);
            this.isLegendOpen = true;
        }
        this.isDisplayed = !this.isDisplayed;
        this.render();
    },

    toggleLegend: function() {
        this.isLegendOpen = !this.isLegendOpen;
        this.render();
    },

    disableMapScrollZoom: function() {
        this.map.scrollWheelZoom.disable();
    },

    enableMapScrollZoom: function() {
        this.map.scrollWheelZoom.enable();
    },

    disableMapDragging: function(e) {
        this.map.dragging.disable();
    },

    enableMapDragging: function() {
        this.map.dragging.enable();
    },

    handleMouseUpEvent: function(e) {
        this.enableMapDragging();
        var el = $(e.target),
        sliderValue = el.val();
        this.layer.setOpacity(sliderValue / 100);
        el.attr('value', sliderValue);
    },

    templateHelpers: function() {
        return {
            isDisplayed: this.isDisplayed,
            legend: this.isLegendOpen ? "open" : "",
            cropTypes: cropTypes,
            iconClass: this.isDisplayed ? "fa fa-eye-slash" : "fa fa-eye",
            inputType: this.isDisplayed ? "range" : "hidden",
            layerName: 'Crop Layer',
            initialOpacity: this.layer.options.opacity * 100,
        };
    }
});
