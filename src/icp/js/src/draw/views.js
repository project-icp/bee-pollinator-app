"use strict";

var $ = require('jquery'),
    _ = require('lodash'),
    L = require('leaflet'),
    Marionette = require('../../shim/backbone.marionette'),
    turfArea = require('turf-area'),
    turfBboxPolygon = require('turf-bbox-polygon'),
    turfDestination = require('turf-destination'),
    turfIntersect = require('turf-intersect'),
    turfKinks = require('turf-kinks'),
    router = require('../router').router,
    App = require('../app'),
    utils = require('./utils'),
    coreUtils = require('../core/utils'),
    toolbarTmpl = require('./templates/toolbar.html'),
    drawTmpl = require('./templates/draw.html'),
    resetDrawTmpl = require('./templates/reset.html'),
    windowTmpl = require('./templates/window.html'),
    settings = require('../core/settings');

var MAX_AREA = 112700; // About the size of a large state (in km^2)
var codeToLayer = {}; // code to layer mapping

function actOnUI(datum, bool) {
    var code = datum.code,
        $el = $('[data-layer-code="' + code + '"]');

    if (bool) {
        $el.addClass('disabled');
    } else {
        $el.removeClass('disabled');
    }
}

function actOnLayer(datum) {
    $('#boundary-label').hide();
    if (datum.code && codeToLayer[datum.code]) {
        codeToLayer[datum.code]._clearBgBuffer();
    }
}

function validateShape(polygon) {
    var area = coreUtils.changeOfAreaUnits(turfArea(polygon), 'm<sup>2</sup>', 'km<sup>2</sup>'),
        d = new $.Deferred();
    var selfIntersectingShape = turfKinks(polygon).features.length > 0;

    if (selfIntersectingShape) {
        var errorMsg = 'This watershed shape is invalid because it intersects ' +
                       'itself. Try drawing the shape again without crossing ' +
                       'over its own border.';
        window.alert(errorMsg);
        d.reject(errorMsg);
    } else if (area > MAX_AREA) {
        var message = 'Sorry, your Area of Interest is too large.\n\n' +
                      Math.floor(area).toLocaleString() + ' km² were selected, ' +
                      'but the maximum supported size is currently ' +
                      MAX_AREA.toLocaleString() + ' km².';
        window.alert(message);
        d.reject(message);
    } else {
        d.resolve(polygon);
    }
    return d.promise();
}

function validateClickedPointWithinDRB(latlng) {
    var point = L.marker(latlng).toGeoJSON(),
        d = $.Deferred(),
        streamLayers = settings.get('stream_layers'),
        drbPerimeter = _.findWhere(streamLayers, {code:'drb_streams_v2'}).perimeter;
    if (turfIntersect(point, drbPerimeter)) {
        d.resolve(latlng);
    } else {
        var message = 'Selected point is outside the Delaware River Basin';
        d.reject(message);
    }
    return d.promise();
}

// Responsible for loading and displaying tools for selecting and drawing
// shapes on the map.
var ToolbarView = Marionette.LayoutView.extend({
    template: toolbarTmpl,

    className: 'draw-tools-container',

    regions: {
        drawRegion: '#draw-region',
        resetRegion: '#reset-draw-region'
    },

    initialize: function() {
        var map = App.getLeafletMap(),
            ofg = L.featureGroup();
        this.model.set('outlineFeatureGroup', ofg);
        map.addLayer(ofg);
    },

    onDestroy: function() {
        var map = App.getLeafletMap(),
            ofg = this.model.get('outlineFeatureGroup');
        map.removeLayer(ofg);
        this.model.set('outlineFeatureGroup', null);
    },

    onShow: function() {
        var draw_tools = settings.get('draw_tools');
        if (_.contains(draw_tools, 'Draw')) {
            this.drawRegion.show(new DrawView({
                model: this.model
            }));
        }

        if (_.contains(draw_tools, 'ResetDraw')) {
            this.resetRegion.show(new ResetDrawView({
                model: this.model,
            }));
        }
    }
});

var DrawView = Marionette.ItemView.extend({
    template: drawTmpl,

    ui: {
        drawArea: '#custom-shape',
        drawStamp: '#one-km-stamp',
        helptextIcon: 'i.split'
    },

    events: {
        'click @ui.drawArea': 'enableDrawArea',
        'click @ui.drawStamp': 'enableStampTool'
    },

    modelEvents: {
        'change:toolsEnabled': 'render'
    },

    enableDrawArea: function() {
        var self = this,
            map = App.getLeafletMap(),
            revertLayer = clearAoiLayer();

        this.model.disableTools();
        utils.drawPolygon(map)
            .then(validateShape)
            .then(function(shape) {
                addLayer(shape);
                navigateToAnalyze();
            }).fail(function() {
                revertLayer();
            }).always(function() {
                self.model.enableTools();
            });
    },

    onShow: function() {
        this.ui.helptextIcon.popover({
            trigger: 'hover',
            viewport: '.map-container'
        });
    },

    enableStampTool: function() {
        var self = this,
            map = App.getLeafletMap(),
            revertLayer = clearAoiLayer();

        this.model.disableTools();
        utils.placeMarker(map).then(function(latlng) {
            var point = L.marker(latlng).toGeoJSON(),
                halfKmbufferPoints = _.map([-180, -90, 0, 90], function(bearing) {
                    var p = turfDestination(point, 0.5, bearing, 'kilometers');
                    return L.latLng(p.geometry.coordinates[1], p.geometry.coordinates[0]);
                }),
                // Convert the four points into two SW and NE for the bounding
                // box. Do this by splitting the array into two arrays of two
                // points. Then map each array of two to a single point by
                // taking the lat from one and lng from the other.
                swNe = _.map(_.toArray(_.groupBy(halfKmbufferPoints, function(p, i) {
                    // split the array of four in half.
                    return i < 2;
                })), function(pointGroup) {
                    return L.latLng(pointGroup[0].lat, pointGroup[1].lng);
                }),
                bounds = L.latLngBounds(swNe),
                box = turfBboxPolygon(bounds.toBBoxString().split(','));

            // Convert coordinates from using strings to floats so that backend can parse them.
            box.geometry.coordinates[0] = _.map(box.geometry.coordinates[0], function(coord) {
                return [parseFloat(coord[0]), parseFloat(coord[1])];
            });

            addLayer(box, '1 Square Km');
            navigateToAnalyze();
        }).fail(function() {
            revertLayer();
        }).always(function() {
            self.model.enableTools();
        });
    }
});

var ResetDrawView = Marionette.ItemView.extend({
    template: resetDrawTmpl,

    ui: { 'reset': 'button' },

    events: { 'click @ui.reset': 'resetDrawingState' },

    resetDrawingState: function() {
        this.model.set({
            polling: false,
            pollError: false
        });
        this.model.enableTools();

        utils.cancelDrawing(App.getLeafletMap());
        clearAoiLayer();
        clearBoundaryLayer(this.model);
    }
});

function makePointGeoJson(coords, props) {
    return {
        geometry: {
            coordinates: coords,
            type: 'Point'
        },
        properties: props,
        type: 'Feature'
    };
}

function clearAoiLayer() {
    var projectNumber = App.projectNumber,
        previousShape = App.map.get('areaOfInterest');

    App.map.set('areaOfInterest', null);
    App.projectNumber = undefined;
    App.map.setDrawSize(false);
    App.clearAnalyzeCollection();

    return function revertLayer() {
        App.map.set('areaOfInterest', previousShape);
        App.projectNumber = projectNumber;
    };
}

function clearBoundaryLayer(model) {
    var ofg = model.get('outlineFeatureGroup');
    if (ofg) {
        ofg.clearLayers();
    }
}

function addLayer(shape, name, label) {
    if (!name) {
        name = 'Selected Area';
    }

    var displayName = (label ? label+=': ' : '') + name;

    App.map.set({
        'areaOfInterest': shape,
        'areaOfInterestName': displayName
    });
}

function navigateToAnalyze() {
    router.navigate('analyze', { trigger: true });
}

var DrawWindow = Marionette.LayoutView.extend({
    template: windowTmpl,

    id: 'draw-window'
});

module.exports = {
    DrawWindow: DrawWindow,
    ToolbarView: ToolbarView
};
