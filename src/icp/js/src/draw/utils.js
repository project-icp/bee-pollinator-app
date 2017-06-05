"use strict";

var $ = require('jquery'),
    L = require('leaflet'),
    _ = require('lodash');

var polygonDefaults = {
        color: '#f9cf2f'
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

// Cancel any previous draw action in progress.
function cancelDrawing(map) {
    map.fire('draw:drawstop');
}

module.exports = {
    drawPolygon: drawPolygon,
    cancelDrawing: cancelDrawing,
    polygonDefaults: polygonDefaults
};
