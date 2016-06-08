
/**
 * Renders all the widgets on the tab and triggers the datasources that are used by the widgets.
 * Customize your widgets by:
 *  - Overriding or extending widget API methods
 *  - Changing widget settings or options
 */
'use strict';

define(['angular',
    'controllers-module',
    'vruntime'
], function(angular, controllers) {

    // Controller definition
    controllers.controller('analysisChartDetailsModalCtl',[
        '$rootScope', '$scope', 'analysisTwoService', '$modal', '$timeout',
        function ($rootScope, $scope, analysisTwoService, $modal, $timeout){
            var __AS = analysisTwoService;

            $scope.pageSize = 10;
            $scope.currentPage = 1;

            //$scope.selectedObj = __AS.selectedObj;
            //$scope.customerListArray = __AS.customerListArray;
            //$scope.siteListArray = __AS.siteListArray;
            //$scope.lineupListArray = __AS.lineupListArray;
            //$scope.machineListArray  = __AS.machineListArray;
            $scope.plottedCharts = __AS.plottedCharts;
            //$scope.plotNewSelectedTags = __AS.plotNewSelectedTags;
            //$scope.staticData = __AS.staticData;
            $scope.analysisContext = __AS.analysisContext;
            $scope.selectedPlottedChartForDetails = __AS.selectedPlottedChartForDetails;

            $scope.numberOfPagesChartDetails=function(){
                return Math.ceil($scope.plottedCharts[$scope.selectedPlottedChartForDetails].tags.length/$scope.pageSize);
            };

            $scope.nextPageChartDetails=function() {
                $scope.currentPage = ($scope.currentPage == $scope.numberOfPagesChartDetails() -1) ? $scope.currentPage : $scope.currentPage + 1;
            };

            $scope.currPageEndIndexChartDetails=function() {
                var idx = ($scope.currentPage+1) *  $scope.pageSize;
                return (idx > $scope.plottedCharts[$scope.selectedPlottedChartForDetails].tags.length) ? $scope.plottedCharts[$scope.selectedPlottedChartForDetails].tags.length : idx;
            };

            $scope.cancelAnalysisChartDetails = function (instance) {
                instance.$dismiss('cancel');
            };
        }]
    )});