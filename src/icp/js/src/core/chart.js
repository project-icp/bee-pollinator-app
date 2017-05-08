"use strict";

var d3 = require('d3'),
    nv = require('../../shim/nv.d3.js'),
    $ = require('jquery'),
    _ = require('lodash');

// Make jQuery handle destroyed event. This is needed so that
// removeTooltipOnDestroy will work.
// http://stackoverflow.com/questions/2200494/
// jquery-trigger-event-when-an-element-is-removed-from-the-dom
(function($) {
    $.event.special.destroyed = {
        remove: function(o) {
            if (o.handler) {
                o.handler();
            }
        }
    };
})($);

function makeSvg(el) {
    // For some reason, the chart will only render if the style is
    // defined inline, even if it is blank.
    var svg = $('<svg style=""></svg>').get(0);
    $(el).empty();
    $(svg).appendTo(el);
    return svg;
}

function handleCommonOptions(chart, options) {
    if (options.yAxisLabel) {
        chart.yAxis.axisLabel(options.yAxisLabel);
    }
    if (options.isPercentage) {
        chart.yAxis.tickFormat(d3.format('.0%'));
    }
    if (options.abbreviateTicks) {
        chart.yAxis.tickFormat(d3.format('.2s'));
    }
}

function getNumBars(data) {
    return data[0].values.length;
}

// When we replace a chart with a new one, the tooltip for the old chart
// persists because it resides under the body tag instead of under
// chartEl (the container div for the chart) like the other chart components.
// Therefore, we manually remove the tooltip when elements under chartEl are
// destroyed.
function removeTooltipOnDestroy(chartEl, tooltip) {
    $(chartEl).children().bind('destroyed', function() {
        $('#' + tooltip.id()).remove();
    });
}

/*
    Renders a grouped vertical bar chart for multiple series of data
    with a legend.

    data is of the form
    [
        {
            key: series-name,
            values: [
                {
                    x: ...,
                    y: ...
                },
                ...
            ]
        },
        ...
   ]

   where a series corresponds to a group of data that will be
   displayed with the same color/legend item. Eg. Current Conditions

   options includes: margin, showLegend, yAxisLabel, yAxisUnit, seriesColors,
   isPercentage, maxBarWidth, abbreviateTicks, reverseLegend, and
   disableToggle, barColors
*/
function renderGroupedVerticalBarChart(chartEl, data, options) {
    var chart = nv.models.multiBarChart(),
        svg = makeSvg(chartEl),
        $svg = $(svg);

    // The colors and barColors methods on chart do not
    // support the behavior we want.
    function addBarClasses() {
        var bars = $(chartEl).find('.nv-bar');

        _.each(bars, function(bar, i) {
            var $bar = $(bar),
                newClass = options.barClasses[i];

            addSvgClass($bar, newClass);
            $(bar).attr('style', '');
        });
    }

    function addSvgClass($el, newClass) {
        // Can't use $.addClass on SVG elements.
        var oldClass = $el.attr('class') || '';
        newClass = oldClass + ' ' + newClass;
        $el.attr('class', newClass);

    }
    function setChartWidth() {
        // Set chart width to ensure that bars (and their padding)
        // are no wider than maxBarWidth.
        var numBars = getNumBars(data),
            maxWidth = options.margin.left + options.margin.right +
                       numBars * options.maxBarWidth,
            actualWidth = $svg.width();

        if (actualWidth > maxWidth) {
           chart.width(maxWidth);
        } else {
           chart.width(actualWidth);
        }
    }

    function updateChart() {
        if($svg.is(':visible')) {
            setChartWidth();
            chart.update(); // Throws error if updating a hidden svg.

            if (options.barClasses) {
                addBarClasses();
            }
        }
    }

    options = options || {};
    _.defaults(options, {
        margin: {top: 20, right: 30, bottom: 40, left: 60},
        maxBarWidth: 150,
        showLegend: true,
        disableToggle: true,
    });

    nv.addGraph(function() {
        chart.showLegend(options.showLegend)
             .showControls(false)
             .reduceXTicks(false)
             .duration(0)
             .margin(options.margin);

        if (options.compareMode) {
            addSvgClass($svg, 'compare');
        }

        setChartWidth();
        // Throws error if this is not set to false for unknown reasons.
        chart.legend
            .disableToggle(options.disableToggle)
            .reverse(options.reverseLegend)
            .rightAlign(false);
        chart.yAxis.ticks(5);
        chart.tooltip.enabled(true);
        handleCommonOptions(chart, options);

        if (options.yAxisUnit) {
            chart.tooltip.valueFormatter(function(d) {
                return chart.yAxis.tickFormat()(d) + ' ' + options.yAxisUnit;
            });
        }

        if (options.yAxisDomain) {
            chart.yDomain(options.yAxisDomain);
        }

        if (options.seriesColors) {
            chart.color(options.seriesColors);
        }

        d3.select(svg)
            .datum(data)
            .call(chart);

        if (options.barClasses) {
            addBarClasses();
        }

        nv.utils.windowResize(updateChart);
        // The bar-chart:refresh event occurs when switching tabs which requires
        // redrawing the chart.
        $(chartEl).on('bar-chart:refresh', updateChart);

        removeTooltipOnDestroy(chartEl, chart.tooltip);

        return chart;
    });
}


module.exports = {
    renderGroupedVerticalBarChart: renderGroupedVerticalBarChart
};
