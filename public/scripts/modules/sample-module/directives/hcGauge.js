/*global define */
define(['angular', 'directives-module'], function (angular, directives) {
    'use strict';

    /* Directives  */
    directives.directive('hcGauge', ['$location', '$log', function ($location, $log) {
        return {
            restrict: 'C',
            replace: true,
            template: '<div style="width:320px; height: 170px; margin: 0 auto">not working</div>',
            link: function (scope, element, attrs) {
                var customFormatPointName = function (id, pointName, def, maxT) {
                    var maxLabel = '', minLabel = '', actualLabel = 'Actual', maxTLabel = 'Design';
                    if (id == 'bRisk') {
                        //maxLabel = 'Max';
                    }
                    var label;
                    switch (pointName) {
                        case 0 :
                            label = '';
                            break;
                        case maxT :
                            label = maxLabel;
                            break;
                        default :
                            label = def;
                            break;
                    }
                    var point = '"' + pointName + '"';
                    $log.log("def");
                    $log.log(def);
                    var newpoint = point.replace(/"(\d*)"/gm, '\$1' + label);
                    //if (def == 'CD') newpoint= point.replace(/"(\d*)"/gm, label);
                    return newpoint;
                };
                scope.getGauge = function (dataX, min, max, minT, maxT, unit, desc, label, id, sz) {
                    $('#' + id).highcharts({
                        chart: {
                            type: 'gauge',
                            plotBackgroundColor: null,
                            plotBackgroundImage: null,
                            plotBorderWidth: 0,
                            plotShadow: false
                        },
                        title: {
                            text: desc
                        },
                        credits: {
                            enabled: false
                        },
                        pane: {
                            startAngle: -90,
                            endAngle: 90,
                            size: [sz],
                            center: ['36%', '80%'],
                            background: null
                        },

                        plotOptions: {
                            gauge: {
                                dataLabels: {
                                    enabled: true

                                },
                                dial: {
                                    baseLength: '0%',
                                    baseWidth: 10,
                                    radius: '80%',
                                    rearLength: '0%',
                                    topWidth: 2
                                }
                            }
                        },

                        // the value axis
                        yAxis: {
                            labels: {
                                enabled: true,
                                formatter: function () {
                                    var point = this.value;
                                    return customFormatPointName(id, point, label, maxT);
                                },
                                x: 0, y: -10,
                                distance: 15
                                //rotation: 'auto'
                            },
                            tickPositions: [min, max, maxT],
                            minorTickLength: 0,
                            min: min,
                            max: maxT,
                            plotBands: [{
                                from: min,
                                to: max,
                                color: '#86C200',
                                thickness: '40%'
                            }, {
                                from: max,
                                to: maxT,
                                color: '#cf1e10',
                                thickness: '40%'
                            }]
                        },

                        series: [{
                            name: desc,
                            data: [dataX],
                            tooltip: {
                                valueSuffix: label
                            }
                        }]

                    });

                }
            }
        }
    }])
    return directives;
});
