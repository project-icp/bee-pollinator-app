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
    splashTmpl = require('./templates/splash.html'),
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

var SplashWindow = Marionette.ItemView.extend({
    template: splashTmpl,

    id: 'splash-window',

    ui: {
        'start': '#get-started',
    },

    events: {
        'click @ui.start': 'moveToDraw',
    },

    moveToDraw: function() {
    },
});

var DrawWindow = Marionette.LayoutView.extend({
    template: windowTmpl,

    id: 'draw-window',

    ui: {
        'start': '#start-drawing',
        'cancel': '#cancel-drawing'
    },

    events: {
        'click @ui.start': 'enableDrawArea',
        'click @ui.cancel': 'resetDrawingState'
    },

    modelEvents: {
        'change': 'render',
    },

    enableDrawArea: function() {
        var self = this,
            map = App.getLeafletMap(),
            revertLayer = clearAoiLayer();

        self.model.set({ isDrawing: true });
        utils.drawPolygon(map)
            .then(validateShape)
            .then(function(shape) {
                addLayer(shape);
                self.model.set({
                    isDrawing: false,
                    isDrawn: true
                });
            }).fail(function() {
                revertLayer();
                self.model.set({
                    isDrawing: false,
                    isDrawn: false
                });
            });
    },

    resetDrawingState: function() {
        this.model.set({
            isDrawing: false,
            isDrawn: false
        });

        utils.cancelDrawing(App.getLeafletMap());
        clearAoiLayer();
        clearBoundaryLayer(this.model);
    }
});

module.exports = {
    DrawWindow: DrawWindow,
    SplashWindow: SplashWindow,
};
