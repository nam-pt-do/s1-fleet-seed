/* global Highcharts, moment, _ */

/**
 * Category Chart Angular Directive
 * @author : Deepika singh - deepika.singh@ge.com
 * @deps: Highcharts, moment, underscore
 *
 Usage: <div chart-category data="data"></div>

 where "data" is an attribute on $scope like:
 {
   categories: ['Brains', 'Brawn', 'Looks'],
   series: [
     {name:"The Tick", data:[1,10,3]},
     {name:"Authur", data:[7,2,2]},
     {name:"Captain Liberty", data:[7,7,10]},
     {name:"Batmanuel", data:[5,6,8]}
   ]
 }

 */

/*global define */
define(['angular', 'directives-module'], function (angular, directives) {
    'use strict';

    /* Directives  */
    directives.directive('chartAnalysisPlot', [function () {
        return {
            scope: {
                data: '='
            },
            // template: '<div style="height: 200px;"><div id="chartLoadDisplay"><div id="loadIcon"><i class="icon-spinner icon-spin" style="font-size: 30px;margin-left: 30%;margin-top: 15%;"></i> <span>Loading...</span></div></div></div>',
            template: '<div style="height: 200px;"><div id="chartLoadDisplay"><div id="loadIcon"></div></div></div>',
            restrict: 'AE',
            link: function postLink(scope, element, attrs) {

                function Chart(el, data, options) {
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
                    var self = this;
                    // =================================================
                    // CHART OPTIONS
                    console.log("Loading Data: " + data.length);
                    Highcharts.setOptions({
                        credits: {
                            enabled: false
                        },
                        chart: {
                            zoomType: 'xy'
                        },
                        colors: ['#000000', '#058DC7', '#fba13b', '#50B432', '#4B0082']
                        , loading: {
                            labelStyle: {
                                top: '45%'
                                , formatter: '<i class="loading">Loading</i> '
                            }
                        }
                        , marginRight: 80
                        , marginLeft: 80
                        , backgroundColor: 'none',
                        borderWidth: 0,
                        shadow: false,
                        useHTML: true,
                        renderTo: element,
                        padding: 0
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
                        }

                    });
                    options.chart = options.chart || {
                            type: 'spline',
                            exporting: {
                                enabled: true
                            }
                        };

                    options.chart.renderTo = el;
                    options.title = options.title || {text: null};


                    options.plotOptions = _.extend(options.plotOptions || {}, {
                        column: {
                            dataLabels: {
                                enabled: false
                            }
                        }
                        , series: {
                            cursor: 'pointer'
                        }
                    });

                    options.legend = {
                        enabled: true
                        , align: 'center'
                        , verticalAlign: 'top'
                        , layout: 'horizontal',
                        y: 30,
                        navigation: {
                            activeColor: '#3E576F',
                            animation: true,
                            arrowSize: 12,
                            inactiveColor: '#CCC',
                            style: {
                                fontWeight: 'bold',
                                color: '#333',
                                fontSize: '12px'
                            }
                        }
                        , borderWidth: 0
                    };

                    // CHART OPTIONS
                    // =================================================

                    // =================================================
                    // DATA

                    // Populate the series array with empty series, each on its own axis,
                    // applying any series yAxis options
                    // options.series = data.series;

                    //FORMAT Data

                    options.xAxis = {
                        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    };
                    options.yAxis = [{
                        lineWidth: 1,
                        title: {
                            text: 'Primary Axis'
                        }
                    }, {
                        lineWidth: 1,
                        opposite: true,
                        title: {
                            text: 'Secondary Axis'
                        }
                    }/*, {
                     lineWidth: 1,
                     title: {
                     text: 'Third Axis'
                     }
                     }, {
                     lineWidth: 1,
                     opposite: true,
                     title: {
                     text: 'Fourth Axis'
                     }
                     }*/

                    ];

                    options.series = [{
                        data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
                        //,yAxis: 1
                    }, {
                        data: [144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4, 29.9, 71.5, 106.4, 129.2]
                        , yAxis: 1
                    }/*, {
                     data: [144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4, 29.9, 71.5, 106.4, 129.2]
                     }, {
                     data: [44.0, 76.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4, 29.9, 71.5, 106.4, 129.2]
                     ,yAxis: 1
                     }*/
                    ];


                    options.exporting = true;
                    // =================================================

                    // CREATE THE CHART
                    self.chart = new Highcharts.Chart(options);

                    // Return for chaining
                    return self;
                }

                function addSeriesToYAxis(_yAxis) {
                    options.yAxis.push(_yAxis);
                }

                // ===============================================================================
                // INITIALIZATION
                var options = {};
                var instance = null;

                // ===============================================================================
                // WATCHERS
                scope.$watch('data', function (newData, oldData) {
                    if (newData[0].action == 'addChart') {
                        if (instance) {
                            instance.chart.destroy();
                        }
                        instance = new Chart(element[0], newData, options);
                    }
                    else if (newData[0].action == 'addSeries') {
                        //Stub Data
                        var _data = {
                            "data": {
                                name: 'Fifth Series',
                                //yAxis: 0,
                                data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
                            },
                            "yAxis": {
                                /* title: {
                                 text: 'Time',
                                 style: {
                                 color: Highcharts.getOptions().colors[0]
                                 }
                                 },
                                 labels: {
                                 format: 'ms',
                                 style: {
                                 color: Highcharts.getOptions().colors[0]
                                 }
                                 }*/
                                lineWidth: 1,
                                title: {
                                    text: 'Fifth Axis'
                                }
                            }//,
                            //opposite:true
                        };
                        instance.chart.addSeries({
                            name: _data.data.name,
                            // data: newData
                            data: _data.data.data
                        });
                        addSeriesToYAxis(_data.yAxis);

                    }
                    else if (newData[0].action == 'clearPlot') {
                        if (instance) {
                            instance.chart.destroy();
                        }
                        instance = new Chart(element[0], newData, options);
                    }

                });


            }
        };
    }])
    return directives;
})
