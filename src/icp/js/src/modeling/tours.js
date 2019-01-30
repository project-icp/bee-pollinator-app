"use strict";

var createTour = require('../core/createTour');

var cropMapTour = createTour(
    {
        id: "crop-map-tour",
        steps: [
            {
                target: "current-crop-map-tab",
                content: "This tab is the map of your current crops. Changes made to this map will carry over to all new scenarios.",
                placement: "bottom",
            },
            {
                target: "crop-layer-toggle",
                content: "Click here to turn the map of existing crop information for this area on and off. If the wrong crops are displayed, update map under the Current Crop Map tab using the Land Cover drop-down menu.",
                placement: "top",
            },
            {
                target: "add-land-cover-btn",
                content: "To correct the map, select a Land Cover type from the drop-down menu and outline the area that needs to be updated.",
                placement: "bottom",
            },
            {
                target: "yield",
                content: "Are the types of pollinator dependent crops represented in the crop yield sidebar correct? If not, go to the Land Cover drop-down menu and update the Current Crop Map.",
                placement: "left",
                xOffset: -4,
            },
            {
                target: "new-scenario-tab",
                content: "Want to test out different options for hive stocking rates and pollinator plantings? Click here to add new management scenarios.",
                placement: "bottom",
            },
        ],
    }
);

var newScenarioTour = createTour(
    {
        id: "new-scenario-tour",
        steps: [
            {
                target: "add-pollinator-planting-btn",
                content: 'Select a pollinator planting type from this menu, then draw it on the scenario map. Plantings can be drawn outside of the selected farm or field area, but cannot be stacked on top of each other. The minimum planting size is 100 ft &times; 100 ft. See <a target="_blank" rel="noopener noreferrer" href="http://beescape.org")>help guide</a> for more information.',
                placement: "bottom"
            },
            {
                target: "hive-input",
                content: "Add a per-acre stocking rate for honey bee hives here.",
                placement: "bottom",
            },
            {
                target: "modification-btn",
                content: "Review and edit the list of modifications you’ve made to this scenario.",
                placement: "left",
                yOffset: -30,
            },
            {
                target: "compare-btn",
                content: "Once you have one or more new scenarios, click here to compare scenario crop yields to the baseline conditions (e.g., your Current Crop Map).",
                placement: "left",
                yOffset: -25,
            },
            {
                target: "login-btn",
                content: "Login or create an account to save this project.",
                placement: "bottom",
                arrowOffset: 260,
                xOffset: -265,
            },
        ]
    }
);

module.exports = {
    cropMapTour: cropMapTour,
    newScenarioTour: newScenarioTour,
};
