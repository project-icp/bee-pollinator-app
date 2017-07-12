"use strict";

var createTour = require('../core/createTour');

var compareTour = createTour(
    {
        id: "compare-tour",
        steps: [
            {
                target: "compare-crop-dropdown",
                content: "Use drop down menus to view one crop at a time.",
                placement: "bottom",
            },
            {
                target: "slide-controls",
                content: "Use these arrows to scroll through your scenarios.",
                placement: "top",
                arrowOffset: 250,
                xOffset: -230,
            },
            {
                target: "back-to-model",
                content: "Click here to return to the modeling view.",
                placement: "top",
                xOffset: 40,
            },
        ]
    }
);

module.exports = {
    compareTour: compareTour,
};
