"use strict";

require('../core/setup');

var $ = require('jquery'),
    L = require('leaflet'),
    assert = require('chai').assert,
    sinon = require('sinon'),
    Marionette = require('../../shim/backbone.marionette'),
    App = require('../app'),
    models = require('./models'),
    utils = require('./utils'),
    views = require('./views'),
    settings = require('../core/settings'),
    testUtils = require('../core/testUtils');

var sandboxId = 'sandbox',
    sandboxSelector = '#' + sandboxId,
    TEST_SHAPE = {
        'type': 'MultiPolygon',
        'coordinates': [[[-5e6, -1e6], [-4e6, 1e6], [-3e6, -1e6]]]
    };

var SandboxRegion = Marionette.Region.extend({
    el: sandboxSelector
});

describe('Draw', function() {
    before(function() {
        // Ensure that draw tools are enabled before testing

        settings.set('draw_tools', [
            'Draw',         // Custom Area or 1 Sq Km stamp
            'ResetDraw',
        ]);
    });

    beforeEach(function() {
        $('body').append('<div id="sandbox">');
    });

    afterEach(function() {
        $(sandboxSelector).remove();
        window.location.hash = '';
        testUtils.resetApp(App);
    });

    describe('ToolbarView', function() {
        // Setup the toolbar controls, enable/disable them, and verify
        // the correct CSS classes are applied.
        it('enables/disables toolbar controls when the model enableTools/disableTools methods are called', function() {
            var sandbox = new SandboxRegion(),
                $el = sandbox.$el,
                model = new models.ToolbarModel(),
                view = new views.ToolbarView({
                    model: model
                });

            sandbox.show(view);

            // Nothing should be disabled at this point.
            // Test that toggling the `toolsEnabled` property on the model
            // will disable all drawing tools.
            assert.equal($el.find('.disabled').size(), 0);
            model.disableTools();
            assert.equal($el.find('.disabled').size(), 1);
            model.enableTools();
            assert.equal($el.find('.disabled').size(), 0);
        });

        it('resets the current area of interest on Reset', function() {
            var setup = setupResetTestObject();

            App.map.set('areaOfInterest', TEST_SHAPE);
            setup.resetRegion.currentView.resetDrawingState();

            assert.isNull(App.map.get('areaOfInterest',
                                      'Area of Interest was not removed on reset from the map'));

        });

        it('resets the boundary layer on Reset', function() {
            var setup = setupResetTestObject(),
                ofg = L.featureGroup(),
                testFeature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-104.99404, 39.75621]
                    }
                };

            ofg.addLayer(L.geoJson(testFeature));
            assert.equal(ofg.getLayers().length, 1);

            setup.model.set('outlineFeatureGroup', ofg);
            setup.resetRegion.currentView.resetDrawingState();
            assert.equal(ofg.getLayers().length, 0,
                         'Boundary Layer should have been removed from layer group');
        });

        it('removes in progress drawing on Reset', function() {
            var setup = setupResetTestObject(),
                spy = sinon.spy(utils, 'cancelDrawing');

            utils.drawPolygon(setup.map);
            setup.resetRegion.currentView.resetDrawingState();

            assert.equal(spy.callCount, 1);
        });
    });
});

function setupResetTestObject() {

    var sandbox = new SandboxRegion(),
        model = new models.ToolbarModel(),
        view = new views.ToolbarView({
            model: model
        }),
        resetRegion = view.getRegion('resetRegion'),
        map = App.getLeafletMap();

        sandbox.show(view);

    return {
        sandbox: sandbox,
        model: model,
        view: view,
        resetRegion: resetRegion,
        map: map
    };
}

function assertTextEqual($el, sel, text) {
    assert.equal($el.find(sel).text().trim(), text);
}
