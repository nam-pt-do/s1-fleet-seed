/* global Highcharts, moment, _ */

/**
 * Category Chart Angular Directive
 * @author : Deepika singh - deepika.singh@ge.com
 * @deps: Highcharts, moment, underscore
 *
 */

/*global define */
define(['angular', 'directives-module'], function (angular, directives) {
    'use strict';

    /* Directives  */
    directives.directive('chartAnalysisPlot', ['ctxGlobal', function (ctxGlobal) {
        return {
            scope: {
                data: '='
            },
            template: '<div style="height: 200px;"><div id="chartLoadDisplay"><div id="loadIcon"></div></div></div>',
            restrict: 'AE',
            link: function postLink(scope, element, attrs) {
                var colorSeries = ["#2f7ed8", "#8bbc21", "#910000", "#f28f43", "#77a1e5", "#c42525", "#a6c96a", "#0d233a", "#1aadce", "#492970"];
                var instance;
                (function (H) {
                    H.Chart.prototype.createCanvas = function (divId) {
                        var svg = this.getSVG(),
                            width = parseInt(svg.match(/width="([0-9]+)"/)[1]),
                            height = parseInt(svg.match(/height="([0-9]+)"/)[1]),
                            canvas = document.createElement('canvas');

                        canvas.setAttribute('width', width);
                        canvas.setAttribute('height', height);

                        if (canvas.getContext && canvas.getContext('2d')) {
                            if (ctxGlobal.getBrowser() > 0) {
                                //IE Browser
                                canvg(canvas, svg, {
                                    renderCallback: function () {
                                        var image = canvas.msToBlob();
                                        if (navigator.msSaveBlob) {
                                            return navigator.msSaveBlob(new Blob([image], {type: "image/png"}), "download.png");
                                        }
                                    }
                                })


                            }
                            else {
                                canvg(canvas, svg, {
                                    renderCallback: function () {
                                        var image = canvas.toDataURL("image/png")
                                            .replace("image/png", "image/octet-stream");
                                        //  open(image);
                                        window.location.href = image;
                                    }
                                })
                            }


                            // var chart_img = canvas.toDataURL('image/png');
                            // window.location.href=chart_img;


                        } else {
                            alert("Your browser doesn't support this feature, please use a modern browser");
                        }

                    }
                }(Highcharts));

                function chartPlots(data, yaxis) {
                    var options = {
                        credits: {
                            enabled: false
                        },
                        chart: {
                            type: 'spline',
                            renderTo: element[0],
                            zoomType: 'xy'
                            , resetZoomButton: {
                                position: {
                                    x: -50,
                                    y: 2
                                },
                                relativeTo: 'chart'
                            },
                            pinchType: 'x',
                            panning: true,
                            panKey: 'shift',

                            spacingTop: 35,
                            marginRight: 40 + (yaxis.length / 2 * 30),
                            marginLeft: 40 + (yaxis.length / 2 * 30),
                            spacingLeft: 20

                        }
                        , exporting: {
                            buttons: {
                                contextButton: {
                                    align: 'right',
                                    menuItems: [{
                                        text: 'Print',
                                        onclick: function () {
                                            this.print();
                                        }
                                    }, {
                                        text: 'Save as PNG',
                                        onclick: function () {
                                            this.createCanvas();
                                        },
                                        separator: false
                                    }]
                                }

                            }
                            , enabled: true
                        },
                        title: {
                            text: null
                        },
                        subtitle: {
                            text: null
                        },
                        xAxis: {
                            type: 'datetime',
                            labels: {
                                rotation: -45
                            }
                            , dateTimeLabelFormats: {
                                second: '%Y-%m-%d<br/>%H:%M:%S',
                                minute: '%Y-%m-%d<br/>%H:%M',
                                hour: '%Y-%m-%d<br/>%H:%M',
                                day: '%Y<br/>%m-%d',
                                week: '%Y<br/>%m-%d',
                                month: '%Y-%m'
                                , year: '%Y'
                            }
                        },
                        yAxis: yaxis,
                        /*tooltip: {
                         headerFormat: '<b>{series.name}</b><br>',
                         pointFormat: '{point.x:%e. %b %H:%M:%S}: {point.y:.2f} m'
                         },*/
                        /*legend : {
                         useHTML: true,
                         layout: 'vertical',
                         itemDistance: 40,
                         align: 'right',
                         verticalAlign: 'top',
                         x: 16,
                         y: -0,
                         itemStyle: {
                         paddingBottom: '15px',
                         fontSize: '14px',
                         paddingRight: '10px',
                         paddingLeft: '10px'
                         },
                         symbolHeight: 0,
                         symbolWidth : 0,
                         borderWidth: 0,
                         title: {
                         text: '<span style="font-size: 12px; padding-bottom: 3px;"> Variable </span>'
                         },
                         labelFormatter: function() {
                         return '<div><span class="legend-analysis">' +
                         '<span class="legend-description">' + this.name + '</span>' +
                         '</span>' +
                         '<span class="legend-uom">(' +  this.options.yAxis + ')</span>' +
                         '</div>';
                         }
                         },*/
                        series: data
                    };

                    instance = new Highcharts.Chart(options);
                    return instance;

                };

                scope.$watch('data', function (newValue, oldValue) {
                    if (newValue && newValue.series && newValue.yaxis) {
                        if (instance) {
                            instance.destroy();
                        }
                        console.log("Analysis directive new plot called.");
                        console.log(newValue);
                        instance = chartPlots(newValue.series, newValue.yaxis);
                    } else {
                        // clear the plot
                        if (instance) {
                            instance.destroy();
                        }
                    }
                }, true);
            }
        };
    }])
    return directives;
})
