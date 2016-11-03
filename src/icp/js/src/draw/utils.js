"use strict";

var $ = require('jquery'),
    L = require('leaflet'),
    _ = require('lodash');

var polygonDefaults = {
        fillColor: '#E77471',
        color: '#E77471'
    };

function drawPolygon(map, drawOpts) {
    var defer = $.Deferred(),
        tool = new L.Draw.Polygon(map, {
            allowIntersection: false,
            shapeOptions: _.defaults(drawOpts || {}, polygonDefaults)
        }),
        clearEvents = function() {
            map.off('draw:created');
            map.off('draw:drawstop');
        },
        drawCreated = function(e) {
            var layer = e.layer,
                shape = layer.toGeoJSON();
            clearEvents();
            defer.resolve(shape);
        },
        drawStop = function() {
            tool.disable();
            clearEvents();
            defer.reject();
        };

    cancelDrawing(map);

    map.on('draw:created', drawCreated);
    map.on('draw:drawstop', drawStop);
    tool.enable();

    return defer.promise();
}

function placeMarker(map, drawOpts) {
    var defer = $.Deferred(),
        tool = new L.Draw.Marker(map, { shapeOptions: drawOpts || {}}),
        clearEvents = function() {
            map.off('draw:created');
            map.off('draw:drawstop');
        },
        drawCreated = function(e) {
            var latlng = e.layer.getLatLng();
            clearEvents();
            defer.resolve(latlng);
        },
        drawStop = function() {
            tool.disable();
            clearEvents();
            defer.reject();
        };

    cancelDrawing(map);

    map.on('draw:created', drawCreated);
    map.on('draw:drawstop', drawStop);
    tool.enable();

    return defer.promise();
}

// Cancel any previous draw action in progress.
function cancelDrawing(map) {
    map.fire('draw:drawstop');
}

module.exports = {
    drawPolygon: drawPolygon,
    placeMarker: placeMarker,
    cancelDrawing: cancelDrawing,
    polygonDefaults: polygonDefaults
};
