/*global define */
define(['angular', 'directives-module'], function(angular, directives) {
	'use strict';

	/* Directives  */
	directives.directive('timeRange', ['$filter', '$rootScope', '$state', '$timeout', 'analysisTwoService',
	function($filter, $rootScope, $state, $timeout, analysisTwoService) {
		return {
			restrict : 'A',
			scope : {
				// datePickerObj : "=datepickerOn"
			},
			templateUrl : 'assets/views/analysis/timeRange.html',
			link : function($scope, element, attrs) {

				// Get static data from service
				$scope.staticData = analysisTwoService.staticData;
				$scope.analysisContext = analysisTwoService.analysisContext;
				$scope.tRbtns = $scope.staticData.buttons.timeRangeOptions;
				$scope.customDate = {
					isDatepickerVisible : false
				};
				$scope.tRange = {
					st : $scope.analysisContext.selectedCustomTimeStartDt,
					end : $scope.analysisContext.selectedCustomTimeEndDt
				};
				$scope.selectedTimeLabel = "Custom";
				//********************************
				// ****** update Chart by Time  ***
				//********************************
				$scope.applyTimeFilter = function(idx, evt) {
					$scope.analysisContext.selectedTimeIndex = analysisTwoService.analysisContext.selectedTimeIndex = idx;
					evt.preventDefault();
					if (idx === 11 && evt) {//If custom
						$scope.customDate.isDatepickerVisible = true;
					} else {
						$scope.requestTimeData(idx, evt);
						$scope.selectedTimeLabel = "Custom";
					}
				};

				/** Add Comment */
				$scope.requestTimeData = function(idx, evt) {

					if (evt) {
						evt.preventDefault();
					}

					var btnStr = $scope.tRbtns[idx].route;
					var timeObj = {
						stDt : analysisTwoService.getStartDt(btnStr, $scope.tRange.st),
						endDt : analysisTwoService.getEndDt(btnStr, $scope.tRange.end),
						tmIdx : idx
					};
					$scope.selectedTimeLabel = moment(timeObj.stDt).format("MM/DD/YYYY HH:mm") + " - " + moment(timeObj.endDt).format("MM/DD/YYYY HH:mm");						
					$scope.$parent.refreshPlot();
					//analysisTwoService.updateAllChart(timeObj);
				};

				// /*****************************************/
				// /********** Date Picker *****************/
				// /*****************************************/
				// $scope.getStartDt=function(tRange, stDt) {
				//     var dt = new Date();
				//     if(tRange === "custom" || tRange === 9) {
				//         if(stDt){
				//             return stDt;
				//         }
				//         else if($scope.startDatePic) {
				//             return $scope.startDatePic;
				//         }
				//         else {
				//             return dt.toISOString();
				//         }
				//     }

				//     if(tRange === "oneHour") {
				//         dt.setUTCHours(dt.getUTCHours() - 1);
				//     } else
				//     if(tRange === "fourHours") {
				//         dt.setUTCHours(dt.getUTCHours() - 4);
				//     }
				//     else if(tRange === "twelveHours") {
				//         dt.setUTCHours(dt.getUTCHours() - 12);
				//     }
				//     else if(tRange === "twentyFourHours") {
				//         dt.setUTCHours(dt.getUTCHours() - 24);
				//     }
				//     else if(tRange === "fortyEightHours") {
				//         dt.setUTCHours(dt.getUTCHours() - 48);
				//     }
				//     else if(tRange === "threeMonths") {
				//         dt.setUTCMonth(dt.getUTCMonth() - 3);
				//     }
				//     else if(tRange === "sixMonths") {
				//         dt.setUTCMonth(dt.getUTCMonth() - 6);
				//     }
				//     else if(tRange === "nineMonths") {
				//         dt.setUTCMonth(dt.getUTCMonth() - 9);
				//     }
				//     else if(tRange === "oneYear") {
				//         dt.setUTCMonth(dt.getUTCMonth() - 12);
				//     }
				//     return dt.toISOString();
				// };

				// /** Add Comment */
				// $scope.getEndDt=function(tRange, endDt) {
				//     var dt = new Date();
				//     if(tRange === "custom" || tRange === 9) {
				//         if(endDt){
				//             return endDt;
				//         }
				//         else if($scope.endDatePic) {
				//             return $scope.endDatePic;
				//         }
				//         else {
				//             return dt.toISOString();
				//         }
				//     }
				//     dt.setUTCHours(dt.getUTCHours());
				//     return dt.toISOString();
				// };

				/** Add Comment */
				$scope.$on("customDateUpdate", function(event, data) {

					var startEndDate = data;
					// pathObj is array returned from date picker start and end date obj
					var idx = 11;

					if ($rootScope.siteTimezoneOffset !== 0) {// If selected time zone is Local and siteTimeZone != "UTC"
						var s1 = moment(startEndDate[0], 'YYYY-MM-DDTHH:mm:ss ZZ').tz($rootScope.siteTimezone);
						var s2 = moment(startEndDate[1], 'YYYY-MM-DDTHH:mm:ss ZZ').tz($rootScope.siteTimezone);
						var zoneOffset = s1.format('ZZ');
						if (zoneOffset.indexOf("+") === 0) {
							zoneOffset = zoneOffset.replace("+", "-");
						} else if (zoneOffset.indexOf("-") === 0) {
							zoneOffset = zoneOffset.replace("-", "+");
						}
						$scope.tRange.st = $scope.analysisContext.selectedCustomTimeStartDt = moment.utc(startEndDate[0]).zone(zoneOffset).format('YYYY-MM-DDTHH:mm:ss');
						$scope.tRange.end = $scope.analysisContext.selectedCustomTimeEndDt = moment.utc(startEndDate[1]).zone(zoneOffset).format('YYYY-MM-DDTHH:mm:ss');
					} else {
						$scope.tRange.st = $scope.analysisContext.selectedCustomTimeStartDt = startEndDate[0];
						$scope.tRange.end = $scope.analysisContext.selectedCustomTimeEndDt = startEndDate[1];
					}
					$scope.customDate.isDatepickerVisible = !$scope.customDate.isDatepickerVisible;
					$scope.requestTimeData(idx);
				});
			}
		};
	}])

	return directives;
}); 