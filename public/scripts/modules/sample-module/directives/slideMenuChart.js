/*global define */
define(['angular', 'directives-module'], function (angular, directives) {
    'use strict';

    /* Directives  */
    directives.directive('slideMenuChart', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
        // Runs during compile
        return {
            restrict: 'A',
            scope: {
                sliderStatus: "=",
                autoRefreshStatus: "=",
                index: "=",
                chartData: "=",
                plottedChart: "=",
                updateChartSeries: "&"
            },
            templateUrl: 'assets/views/analysis/slideMenuChart.html',

            link: function ($scope, element, attrs) {

                $scope.btnEnabled = false;
                $scope.chartData.raw = false;

                $scope.hasModified = false;
                // setting radio button on and off
                if (!$scope.plottedChart.type) {
                    $scope.plottedChart.type = "sampling"
                }
                $scope.chartData.raw = $scope.plottedChart.isRaw;
                $scope.chartData.type = $scope.plottedChart.type;

                // watching changes on auto refresh button
                $scope.$watch('autoRefreshStatus', function (newVal, oldVal) {

                    if (newVal !== oldVal) {

                        if (newVal.turnOn === true) {
                            $scope.chartData.raw = false;
                            $scope.btnEnabled = false;
                        }
                        else {
                            $scope.btnEnabled = true;
                        }
                    }

                }, true);

                // ** Update Chart's Series Data

                $scope.updateChart = function () {

                    var idx = $scope.index;
                    var chartInfo = $scope.plottedChart;
                    var chartDataType = $scope.chartData;

                    $scope.updateChartSeries()(idx, chartInfo, chartDataType);

                };

                $scope.$watch('chartData', function (newVal, oldVal) {

                    if (newVal !== oldVal) {

                        $scope.btnEnabled = $scope.autoRefreshStatus.turnOn === false ? true : "";

                    }

                }, true);
            }
        };
    }])
    return directives;
});
