/**
 * Renders all the widgets on the tab and triggers the datasources that are used by the widgets.
 * Customize your widgets by:
 *  - Overriding or extending widget API methods
 *  - Changing widget settings or options
 */
'use strict';

define(['angular', 'controllers-module', 'vruntime'], function(angular, controllers) {

	// Controller definition
	controllers.controller('analysisNewCtrl', ['$scope', '$rootScope', '$modal', '$timeout', '$interval', '$state', '$stateParams', 'ctxGlobal', 'analysisTwoService', 'analysisPreset', 'modalService',
	function($scope, $rootScope, $modal, $timeout, $interval, $state, $stateParams, ctxGlobal, analysisTwoService, analysisPreset, modalService) {

		var __AS = analysisTwoService;
		var __RS = $rootScope;
		__RS.siteTimezone = "UTC";

		$scope.isAdmin = $rootScope.showAdmin;
		// Show Customer list if the user is an admin
		$scope.backupHierarchy = angular.copy(ctxGlobal.getSelectedNode());
		$scope.templateUrl = 'assets/views/analysis/analysisNew.html';
		//$scope.customDate = { isDatepickerVisible : false };
		$scope.loading = __AS.loading;
		$scope.loadingChart = __AS.loadingChart;
		$scope.chartTool = {
			"openMenu" : true
		};
		$scope.staticData = __AS.staticData;
		$scope.analysisContext = __AS.analysisContext;
		$scope.analysisContext.selectedTimeIndex = __AS.analysisContext.selectedTimeIndex = 0;
		$scope.analysisContext.selectedTimeZoneIndex = __AS.analysisContext.selectedTimeZoneIndex = ($scope.isCustomerLogin ? 0 : 1);
		$rootScope.siteTimezoneOffset = ($scope.isCustomerLogin ? 1 : 0);
		// 0 (UTC) for iCenter and 1 (Local) for Customer

		$scope.lineupsForSelectedSite = [];

		$scope.editChartAvailableTags = __AS.editChartAvailableTags;
		$scope.plottedCharts = __AS.plottedCharts;
		$scope.chartobjs = __AS.chartobjs;
		$scope.selectedPlottedChartForDetails = 0;
		$scope.selectedPlottedChartForEdit = 0;

		$scope.isZoomApplied = __AS.isZoomApplied = false;
		$scope.tRbtns = $scope.staticData.buttons.timeRangeOptions;
		$scope.tRange = {
			st : $scope.analysisContext.selectedCustomTimeStartDt,
			end : $scope.analysisContext.selectedCustomTimeEndDt
		};

		/*** user and system preset  ***/

		$scope.preset = null;
		$scope.selectedPresetType = "";
		$scope.emptyPreset = {
			"presetName" : "Choose a plot session",
			"chart" : null
		};
		$scope.selectedPreset = $scope.emptyPreset;
		$scope.deletePreset = "";
		$scope.sysPresetUser = analysisTwoService.sysPresetUser;
		$scope.userPreset = [];
		// holds list of user Preset
		$scope.sytemPreset = [];
		// holds list of system preset
		$scope.template = [];
		//holds list of templates
		$scope.presetType = '';
		$scope.presetName = '';
		$scope.presetId = '';
		$scope.emptyChart = true;
		$scope.showSaveAsOnly = true;
		$scope.enableDeletePreset = false;
		$scope.enableSaveButton = false;
		$scope.hasTagChanged = false;
		$scope.targetUrl = '';
		$scope.showAllBtns = false;
		$scope.forceLoadPlot = true;
		// when going out of analysis without saving preset
		$scope.hasMultipleCustomer = false;
		//
		$scope.inlineChartFltr = false;
		$scope.autoRefreshStatus = {
			turnOn : false
		};
		$scope.autoRefreshDisabled = false;
		$scope.fullScreenMode = {
			visible : false
		};

		$scope.loadPreSet = function() {
			var customer = $scope.customerId;
			var userId = $rootScope.currentUser.userId;

			analysisPreset.readAll(customer, userId).then(function(response) {
				$scope.preset = response;
				$scope.userPreset = __AS.userPreset = response.USER_PRESET;
				$scope.systemPreset = __AS.systemPreset = response.SYSTEM_PRESET;
			}, function(error) {
				$scope.dataError();
			});
		};

		$scope.initView = function() {
			$scope.loadPreSet();
		};
		$scope.init = (function() {
			$scope.initView();
			// $("#analysis-chart-container").bind('mousemove', function(e) {
			// var chart,
			// point,
			// i;
			// var originalEvent = e.originalEvent;
			//
			// var list = [];
			// console.log($scope.chartobjs);
			// for ( i = 0; i < $scope.chartobjs.length; i++) {
			// chart = $scope.chartobjs[i];
			// // Find coordinates within the chart
			// e = chart.pointer.normalize(originalEvent);
			// _.each(chart.series, function(series, idx) {
			// if (idx % 2 != 0) {
			// point = series.searchPoint(e, true);
			// // Get the hovered point
			// if (point) {
			// list.push(point.index);
			// }
			// }
			// });
			// /*
			// if (list.length) {
			// chart.tooltip.refresh(list);
			// }
			//
			// if (point) {
			// chart.xAxis[0].drawCrosshair(e, point);
			// }*/
			//
			// }
			// list = _.sortBy(list,function(item){
			// return item;
			// });
			// for ( i = 0; i < $scope.chartobjs.length; i++) {
			// var indexPoints = [];
			// var indexedPoint;
			// chart = $scope.chartobjs[i];
			// e = chart.pointer.normalize(originalEvent);
			// _.each(chart.series, function(series, idx) {
			// if (idx % 2 != 0) {
			// indexedPoint = series.points[list[0]];
			// if (indexedPoint) {
			// indexPoints.onMouseOver();
			// indexPoints.push(indexedPoint);
			// }
			// }
			// });
			//
			// if (indexPoints.length) {
			// chart.tooltip.refresh(indexPoints);
			// }
			// if (indexedPoint) {
			// chart.xAxis[0].drawCrosshair(e, indexedPoint);
			// }
			// }
			// list = [];
			// });
		})();
		$scope.refreshPlot = function(evt) {
			/*
			 __AS.chartobjs = [];
			 $scope.chartobjs = [];*/

			var idx = __AS.analysisContext.selectedTimeIndex;
			if (evt && idx != 11) {
				var btnStr = $scope.tRbtns[idx].route;
				var timeObj = {
					stDt : __AS.getStartDt(btnStr, $scope.tRange.st),
					endDt : __AS.getEndDt(btnStr, $scope.tRange.end),
					tmIdx : idx
				};
				__AS.updateAllChart(timeObj);
			} else if (!evt) {
				var btnStr = $scope.tRbtns[idx].route;
				var timeObj = {
					stDt : __AS.getStartDt(btnStr, $scope.tRange.st),
					endDt : __AS.getEndDt(btnStr, $scope.tRange.end),
					tmIdx : idx
				};
				__AS.updateAllChart(timeObj);
			}

		};
		//********************************
		// ****** Export Data to CSV  ***
		//********************************
		$scope.export = function(idx) {
			var allPlottedTags = [];
			var tags = "";
			var uoms = "";
			var plottedChart = $scope.plottedCharts[idx];
			var i;

			var timeZone = $scope.analysisContext.selectedTimeZoneIndex;
			var isLocalTimeZone = "false";

			if ($scope.analysisContext.selectedTimeZoneIndex === 0) {
				isLocalTimeZone = "true";
			}

			for (i in plottedChart.response) {
				allPlottedTags.push(plottedChart.response[i]);
				tags += plottedChart.response[i].sourceId + ";";
				uoms += plottedChart.response[i].tagNode.enterpriseId + ";";
			}

			if (tags.length > 1) {
				tags = tags.substr(0, tags.length - 1);
			}

			if (uoms.length) {
				uoms = uoms.substr(0, uoms.length - 1);
			}
			var algorithm = plottedChart.type;
			var isRaw = (!plottedChart.isRaw ? "false" : plottedChart.isRaw);

			if (allPlottedTags.length > 0) {
				var tmRange = $scope.staticData.buttons.timeRangeOptions[$scope.analysisContext.selectedTimeIndex].route;
				var stDt = analysisTwoService.getStartDt(tmRange, $scope.analysisContext.selectedCustomTimeStartDt);
				var endDt = analysisTwoService.getEndDt(tmRange, $scope.analysisContext.selectedCustomTimeEndDt);
				var url = "/exportTagsValues?customerId=" + "&timeRange=" + tmRange + "&tags=" + escape(tags) + "&uoms=" + escape(uoms) + "&startTime=" + stDt + "&endTime=" + endDt + "&localTimeZoneOffset=" + __RS.siteTimezoneOffset + "&isCustomerView=" + true + "&algorithm=" + algorithm + "&needRawData=" + isRaw;

				window.open(url, '_self');
			}
		};

		// //********************************
		// // ****** update Chart by Time  ***
		// //********************************

		// $scope.applyTimeFilter = function(idx, evt) {

		//     $scope.analysisContext.selectedTimeIndex = __AS.analysisContext.selectedTimeIndex = idx;
		//     evt.preventDefault();

		//     if(idx === 9 && evt){    //If custom
		//         //evt.stopPropagation();
		//         $scope.customDate.isDatepickerVisible = true;
		//         //$scope.setDatePickerPos(evt.currentTarget);
		//     }
		//     else{
		//         $scope.requestTimeData(idx, evt);
		//     }
		// };

		// /** Add Comment */
		// $scope.requestTimeData = function(idx, evt){

		//     if(evt){evt.preventDefault();}

		//     var btnStr = $scope.tRbtns[idx].route;
		//     var timeObj = {
		//         stDt : $scope.getStartDt(btnStr, $scope.tRange.st),
		//         endDt : $scope.getEndDt(idx, $scope.tRange.end),
		//         tmIdx : idx
		//     };
		//     $scope.chartobjs = [];
		//     __AS.updateAllChart(timeObj);

		//     $scope.autoRefreshStatus.turnOn = (idx > 3) ? false : true;
		//     $scope.autoRefreshDisabled = (idx > 3) ? true : false;

		// };
		/** Add Comment */
		$scope.autoRefresh = $interval(function() {

			var idx = __AS.analysisContext.selectedTimeIndex;

			if ($scope.autoRefreshStatus.turnOn && (idx < 4) && ($scope.chartobjs.length > 0)) {

				var btnStr = $scope.tRbtns[idx].route;
				var timeObj = {
					stDt : analysisTwoService.getStartDt(btnStr, $scope.tRange.st),
					endDt : analysisTwoService.getEndDt(idx, $scope.tRange.end),
					tmIdx : idx
				};

				$scope.chartobjs = [];
				__AS.updateAllChart(timeObj);
			}

			if (idx > 3) {
				$scope.autoRefreshDisabled = true;
			}

		}, 120000);

		$scope.$on("$destroy", function() {
			$interval.cancel($scope.autoRefresh);
		});

		//********************************
		// ****** Zooming Charts       ***
		//********************************
		$scope.applyZoom = function(data) {

			var timeObj = {
				stDt : data.xMin,
				endDt : data.xMax,
				tmIdx : 9
			};
			if (__RS.siteTimezoneOffset !== 0) {// If selected time zone is Local and siteTimeZone != "UTC"
				var s1 = moment(data.xMin, 'YYYY-MM-DDTHH:mm:ss ZZ').tz(__RS.siteTimezone);
				var s2 = moment(data.xMax, 'YYYY-MM-DDTHH:mm:ss ZZ').tz(__RS.siteTimezone);
				var zoneOffset = s1.format('ZZ');
				if (zoneOffset.indexOf("+") === 0) {
					zoneOffset = zoneOffset.replace("+", "-");
				} else if (zoneOffset.indexOf("-") === 0) {
					zoneOffset = zoneOffset.replace("-", "+");
				}
				timeObj = {
					stDt : moment.utc(data.xMin).zone(zoneOffset).format('YYYY-MM-DDTHH:mm:ss'),
					endDt : moment.utc(data.xMax).zone(zoneOffset).format('YYYY-MM-DDTHH:mm:ss'),
					tmIdx : 9
				};
			}

			$scope.analysisContext.selectedTimeIndex = __AS.analysisContext.selectedTimeIndex = 9;

			$scope.isZoomApplied = __AS.isZoomApplied = true;

			__AS.analysisContext.selectedCustomTimeStartDt = timeObj.stDt;
			__AS.analysisContext.selectedCustomTimeEndDt = timeObj.endDt;
			__AS.analysisContext.selectedTimeIndex = timeObj.tmIdx;

			$scope.chartobjs = [];
			__AS.updateAllChart(timeObj);

			$scope.autoRefreshStatus.turnOn = false;
			$scope.autoRefreshDisabled = true;

		};

		/** Resetting zoom to original fo all the plotted chart **/
		$scope.resetZoom = function() {
			var btnStr = $scope.tRbtns[0].route;
			var timeObj = {
				stDt : analysisTwoService.getStartDt(btnStr, $scope.tRange.st),
				endDt : analysisTwoService.getEndDt(btnStr, $scope.tRange.end),
				tmIdx : 0
			};
			$scope.isZoomApplied = __AS.isZoomApplied = false;
			$scope.analysisContext.selectedTimeIndex = __AS.analysisContext.selectedTimeIndex = 0;

			$scope.chartobjs = [];
			__AS.updateAllChart(timeObj);

			$scope.autoRefreshStatus.turnOn = true;
			$scope.autoRefreshDisabled = false;
		};

		//********************************
		// ****** Plotting Charts    ***
		//********************************
		$scope.openAnalysisPlotNewChart = function() {
			$scope.chartTool.openMenu = true;
			$scope.plotNewSelectedTags = {};
			$scope.message = '';
			// get rid of error message if any
			$scope.isZoomApplied = false;

			if (!$scope.plottedCharts.length) {
				$scope.triggerOriginalPlotsBackup();
			}
			$scope.plotNewModalInstance = $modal.open({
				templateUrl : 'assets/views/analysis/analysis_plot_new.html',
				windowClass : 'analysisChartlModal span12',
				controller : 'analysisPlotNewModalCtrl',
				backdrop : 'static'
			});
		};

		/** Add Comment */
		$scope.openAnalysisChartDetails = function(idx) {
			__AS.selectedPlottedChartForDetails = idx;
			$scope.chartDetailsModalInstance = $modal.open({
				templateUrl : 'assets/views/analysis/analysis_chart_details.html',
				windowClass : 'analysisChartDetailModal span10',
				controller : 'analysisChartDetailsModalCtl',
				backdrop : 'static',
				resolve : {
					items : function() {
						return idx;
					}
				}
			});
		};

		// Open modal to show selected tags for site and lineup
		$scope.openAnalysisEditChart = function(idx, chart) {
			$scope.chartTool.openMenu = true;
			__AS.selectedPlottedChartForEdit = idx;
			//selected graph that you clicked on
			$scope.editChartModalInstance = $modal.open({
				templateUrl : 'assets/views/analysis/analysis_edit_chart.html',
				windowClass : 'analysisChartlModal span12',
				backdrop : 'static',
				controller : 'analysisEditModalCtrl'
			});
		};
		$scope.exportTo = function(chartIndex, type) {
			var index = $("#analysis-chart-container .chart-content").eq(chartIndex).attr("data-highcharts-chart");
			var chart = Highcharts.charts[index];

			chart.exportChart({
				type : type
			});

		};
		//** Check to see if plotted charts has multiple customer and standard tags
		// $scope.checkForMultipleSite = function(newChart){
		//     var i, j, k;
		//     var tag;
		//     var newTag;
		//     var tags;
		//     var chart;
		//     var charts;
		//     var chartsLength;
		//     var source;
		//     var enterprise;
		//     var newTags = newChart ? newChart.response : null;

		//     charts = $scope.plottedCharts;
		//     chartsLength = $scope.plottedCharts.length;
		//     $scope.hasMultipleSite = false;
		//     //if we have any charts shown
		//     if (charts){
		//         for(i = 0; i < chartsLength; i++){
		//             chart = charts[i];
		//             // get data points for the chart
		//             tags = chart.response;
		//             // if there are any data points for this chart
		//             if(tags){
		//                 for(j=0; j < tags.length; j++){
		//                     tag = tags[j];
		//                     $scope.hasMultipleSite = true;
		//                     //i = 1000; // ** Breaking parent loop
		//                     //break;
		//                     source = tag.tagNode.sourceId;
		//                     enterprise = tag.tagNode.enterpriseId;
		//                 }
		//             }
		//             else {
		//                 $scope.dataError();
		//             }
		//         }
		//     }
		//     //if we have a new chart
		//     // if(newChart){
		//     //     for(k=0; k < newTags.length; k++){
		//     //         newTag = newTags[k];

		//     //         if((site && newTag.siteId != site)){
		//     //             $scope.hasMultipleSite = true;
		//     //             i = 1000; // ** Breaking parent loop
		//     //             break;
		//     //         }
		//     //         site = newTag.siteId;
		//     //         enterprise = newTag.customerId;
		//     //     }
		//     // }
		//     $scope.currentTagsCustomer = enterprise;
		//     $scope.currentTagsSite = source;
		// };

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

		// /** Add Comment */
		// $scope.$on("customDateUpdate", function(event, data){

		//     var startEndDate = data;// pathObj is array returned from date picker start and end date obj
		//     var idx = 9;

		//     if (__RS.siteTimezoneOffset !== 0)  {    // If selected time zone is Local and siteTimeZone != "UTC"
		//         var s1 = moment(startEndDate[0],'YYYY-MM-DDTHH:mm:ss ZZ').tz(__RS.siteTimezone) ;
		//         var s2 = moment(startEndDate[1],'YYYY-MM-DDTHH:mm:ss ZZ').tz(__RS.siteTimezone);
		//         var zoneOffset = s1.format('ZZ') ;
		//         if (zoneOffset.indexOf("+") === 0)  {
		//             zoneOffset = zoneOffset.replace("+", "-");
		//         } else
		//         if (zoneOffset.indexOf("-") === 0)  {
		//             zoneOffset = zoneOffset.replace("-", "+");
		//         }
		//         $scope.tRange.st = $scope.analysisContext.selectedCustomTimeStartDt =  moment.utc(startEndDate[0]).zone(zoneOffset).format('YYYY-MM-DDTHH:mm:ss');
		//         $scope.tRange.end = $scope.analysisContext.selectedCustomTimeEndDt = moment.utc(startEndDate[1]).zone(zoneOffset).format('YYYY-MM-DDTHH:mm:ss');
		//     } else {
		//         $scope.tRange.st = $scope.analysisContext.selectedCustomTimeStartDt = startEndDate[0];
		//         $scope.tRange.end = $scope.analysisContext.selectedCustomTimeEndDt = startEndDate[1];
		//     }

		//     $scope.customDate.isDatepickerVisible = !$scope.customDate.isDatepickerVisible;
		//     $scope.requestTimeData(idx);
		// });

		/*****************************************/
		/********** Clearing  *****************/
		/*****************************************/
		$scope.clearMessage = function() {
			$scope.message = false;
		};

		/** Add Comment */
		$scope.clearConfirm = function(instance) {
			$scope.confirm = false;
			instance.$close();
		};

		$scope.clearAllChartsForNewConfig = function(evt) {

			if (evt) {
				evt.preventDefault();
			}

			$scope.enableDeletePreset = false;
			$scope.enableSaveButton = false;

			$scope.selectedPreset = $scope.emptyPreset;
			$scope.plottedCharts = __AS.plottedCharts = [];
			$scope.hasTagChanged = false;
			$scope.presetType = null;
			$scope.presetName = null;
			$scope.emptyChart = true;
			$scope.presetId = null;
			$scope.hasMultipleCustomer = false;
			$scope.hasMultipleSite = false;
			$scope.canCreateTemplate = false;
			$scope.chartTool.openMenu = true;
		};

		/*****************************************/
		/** Listeners/Subscriber for  BroadCast */
		/*****************************************/
		__RS.$on('event:plottedCharts', function() {
			$scope.plottedCharts = __AS.getPlottedCharts();
			$scope.emptyChart = false;
			// ** to enable save / save as button
		});
		$scope.arrayDifference = function(array) {
			var rest = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
			var containsEquals = function(obj, target) {
				if (obj == null)
					return false;
				return _.any(obj, function(value) {
					return _.isEqual(value, target);
				});
			};

			return _.filter(array, function(value) {
				return ! containsEquals(rest, value);
			});
		};
		$scope.customFilter = function(item) {
			if (item.trendFailed) {
				return true;
			}
		};
		$scope.triggerOriginalPlotsBackup = function() {
			$scope.originalSavedPlots = angular.copy($scope.plottedCharts);
			$scope.originalPlotTags = [];
			_.each($scope.originalSavedPlots, function(oplot, idx) {
				var list = [];
				_.each(oplot.sources, function(source, idx) {
					list.push({
						"sourceId" : source.sourceId || source.selectedNodeObj.nodeId || source.selectedNodeObj.id
					});
				});
				$scope.originalPlotTags.push(list);
			});
		};
		__RS.$on('event:finishedPlottedCharts', function() {
			$scope.plottedCharts = __AS.getPlottedCharts();
			if ($scope.plottingTrigger == "chartPresetLoadTrigger") {
				$scope.triggerOriginalPlotsBackup();
				$scope.plottingTrigger = "";
			} else {

				var plottedTags = [];
				_.each($scope.plottedCharts, function(plot, idx) {
					var plist = [];
					_.each(plot.sources, function(source, idx) {
						plist.push({
							"sourceId" : source.sourceId || source.selectedNodeObj.nodeId || source.selectedNodeObj.id
						});
					});
					plottedTags.push(plist);
				});
				if (plottedTags.length > $scope.originalPlotTags.length) {
					var plotArrayDifference = $scope.arrayDifference(plottedTags, $scope.originalPlotTags);
				} else {
					var plotArrayDifference = $scope.arrayDifference($scope.originalPlotTags, plottedTags);
				}

				if (plotArrayDifference.length && $scope.presetType == "usr") {
					$scope.enableSaveButton = true;
					$scope.changeStatus = "*";
					//$scope.hasTagChanged = true;
					$scope.canNavigate = false;
					$scope.forceLoadPlot = false;

				} else if (plotArrayDifference.length && $scope.presetType == "sys") {
					$scope.enableSaveButton = false;
					$scope.changeStatus = "*";
					//$scope.hasTagChanged = true;
					$scope.canNavigate = false;
					$scope.forceLoadPlot = false;

				} else if (plotArrayDifference.length && !$scope.presetType) {
					$scope.enableSaveButton = false;
					$scope.changeStatus = "*";
					//$scope.hasTagChanged = true;
					$scope.canNavigate = false;
					$scope.forceLoadPlot = false;
				} else {
					$scope.enableSaveButton = false;
					$scope.changeStatus = "";
					//$scope.hasTagChanged = false;
					$scope.canNavigate = true;
					$scope.forceLoadPlot = true;
				}

			}
			// ** to enable save / save as button
			$scope.emptyChart = false;
		});

		var analysisStateChangeStart = __RS.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

			/*
			 var obj;
			 var modalType = 'savePreset';
			 $scope.targetUrl = angular.copy(toState);
			 // saving current State
			 /!*templateUrl : 'assets/views/analysis/analysis_chart_details.html',
			 windowClass : 'analysisChartDetailModal span10',
			 controller : 'analysisChartDetailsModalCtl',
			 backdrop : 'static',*!/
			 if ($scope.hasTagChanged && !$scope.canNavigate) {
			 obj = {
			 'controller' : 'analysisSaveNewPresetCtl',
			 'templateUrl' : 'assets/views/analysis/analysis_saveNewPreset.html',
			 'scope' : $scope,
			 'type' : modalType,
			 'callBack' : function(flag) {
			 $scope.navigateTo(flag);
			 }
			 };
			 event.preventDefault();
			 $modal.open(obj);
			 }
			 });

			 } */

			if ($scope.editChartModalInstance) {
				$scope.editChartModalInstance.close();
			}
			if ($scope.plotNewModalInstance) {
				$scope.plotNewModalInstance.close();
			}
			if ($scope.chartDetailsModalInstance) {
				$scope.chartDetailsModalInstance.close();
			}
			if ($scope.fullScreenMode.visible) {
				$scope.fullScreenMode.visible = !$scope.fullScreenMode.visible;
			}
			ctxGlobal.setSelectedNode($scope.backupHierarchy);
			$scope.$emit('update-selected-node', {
				node : $scope.backupHierarchy
			});

			if ($scope.changeStatus == "*") {
				event.preventDefault();

				$scope.targetUrl = angular.copy(toState);

				$scope.chartDetailsModalInstance = $modal.open({
					templateUrl : 'assets/views/analysis/analysis_NavigateOutPreset.html',
					windowClass : 'analysisChartDetailModal span10',
					controller : 'analysisNavigateOutPresetCtl',
					backdrop : 'static',
					scope : $scope,
				});

				$scope.no = function() {
					$scope.changeStatus = "";
					//$('.modal-backdrop').remove();
					// $scope.chartDetailsModalInstance.close();

					$scope.navigateTo('navigateAway');
					return false;
				};

				$scope.yes = function() {
					//$modal.backdrop.remove();
					$('.modal-backdrop').remove();
					$scope.chartDetailsModalInstance.close();
					//$scope.navigateTo("");
				};

				if ($scope.chartDetailsModalInstance) {
					$('.modal-backdrop').remove();
					$scope.chartDetailsModalInstance.close();
					return false;
				}
			} else {
				event.defaultPrevented = false;
				return false;
			}

			if ($scope.chartDetailsModalInstance) {
				$('.modal-backdrop').remove();
				$scope.chartDetailsModalInstance.close();
				return false;
			}
		});

		$scope.$on("$destroy", function() {

			analysisStateChangeStart();
		});

		$scope.$on("$destroy", function() {

			__AS.availableTags = false;
			__AS.plottedCharts = [];
			__AS.plotNewSelectedTags = {};

		});

		$scope.$on('service:update', function(evt, obj) {
			// ** any update on plots should trigger save message on navigating away

			// ** check for spinner status
			if (obj.loading === true) {
				$scope.loading = true;
			} else {
				$scope.loading = false;
			}
		});

		/*******************************/
		/*** user and system preset  ***/

		/*******************************/
		$scope.$watchCollection('[presetType, hasTagChanged]', function() {
			var modifiedPreset = $scope.presetType && $scope.hasTagChanged;
			// if tags has changed
			if ($scope.hasTagChanged) {
				$scope.enableSaveButton = true;

			}
			var isAuthorized = ($scope.presetType === 'sys' && $scope.isAdmin && !$scope.hasMultipleCustomer) || ($scope.presetType === 'usr');
			$scope.showAllBtns = modifiedPreset;
		});

		//** open preset model to save preset configuration
		$scope.openPresetModal = function(evt) {
			evt.preventDefault();
			/*
			 var mType = evt.target.dataset ? evt.target.dataset.actionId : evt.target.getAttribute('data-action-id');
			 var obj = {
			 'controller' : 'analysisSaveNewPresetCtl',
			 'templateUrl' : 'assets/views/analysis/analysis_saveNewPreset.html',
			 'scope' : $scope,
			 'type' : mType
			 };
			 $modal.open(obj);*/

			var mType = evt.target.dataset ? evt.target.dataset.actionId : evt.target.getAttribute('data-action-id');
			$scope.presetActionType = mType;
			$scope.chartDetailsModalInstance = $modal.open({
				templateUrl : 'assets/views/analysis/analysis_saveNewPreset.html',
				windowClass : 'analysisChartDetailModal span10',
				controller : 'analysisSaveNewPresetCtl',
				backdrop : 'static',
				scope : $scope
			});
		};

		$scope.PromptSave = function(type) {
			//evt.preventDefault();

			$scope.PromptSaveModalInstance = $modal.open({
				templateUrl : 'assets/views/analysis/analysis_NavigateOutPreset.html',
				windowClass : 'analysisChartDetailModal span10',
				controller : 'analysisNavigateOutPresetCtl',
				//backdrop: 'static',
				scope : $scope,
			});
			if (type == "erase") {
				$scope.no = function() {
					$scope.createNewPreset();
					$scope.PromptSaveModalInstance.close();
				};
			} else {
				$scope.no = function() {
					$scope.forceLoadPlot = true;
					$scope.$emit("forceLoad", {
						forceLoad : $scope.forceLoadPlot
					});
					$scope.PromptSaveModalInstance.close();
				};
			}
			$scope.yes = function() {
				$scope.PromptSaveModalInstance.close();
				$('.modal-backdrop').remove();
			};

		};
		$scope.clearAllPlots = function() {
			if ($scope.changeStatus == "*") {
				$scope.PromptSave("erase");
			} else {
				$scope.createNewPreset();
			}
		};
		$scope.createNewPreset = function(evt) {
			if (evt) {
				evt.preventDefault();
			};
			$scope.changeStatus = "";
			var obj = {
				'ctrl' : 'analysisSaveNewPresetCtl',
				'tpl' : 'analysis_saveNewPreset.html',
				'scope' : $scope,
				'type' : '',
				'callBack' : function() {
					$scope.clearAllChartsForNewConfig();
				}
			};

			//** has preset modified or  new chart plotted without clicking on preset?
			//** if so give user option to save the current changes
			if (($scope.presetId && $scope.hasTagChanged) || (!$scope.presetId && $scope.hasTagChanged)) {

				obj.type = 'savePreset';
				modalService.open(obj);
				return;
			} else {
				$scope.clearAllChartsForNewConfig();
			}
			$scope.analysisContext.selectedTimeZoneIndex = __AS.analysisContext.selectedTimeZoneIndex = ($scope.isCustomerLogin ? 0 : 1);
		};

		//$scope.askedToSave = false;
		//** load preset when clicked on apply button
		$scope.loadPresetChart = function(chartObj, type) {
			var presetId = chartObj.presetId;
			var customerId = chartObj.customerId;
			$scope.enableSaveButton = false;
			$scope.changeStatus = "";
			var isSystemPreset = (type === 'sys') ? true : false;
			var pType = 'UserPreset';
			pType = (type === 'sys') ? 'SystemPreset' : pType;
			pType = (type === 'tpl') ? 'Template' : pType;

			analysisPreset.read(customerId, presetId, pType).then(function(response) {
				chartObj = response;
				chartObj.customerId = customerId;
				chartObj.presetId = presetId;
				$rootScope.siteTimezoneOffset = ($scope.isCustomerLogin ? 1 : 0);
				// 0 for UTC and 1 for Local
				$scope.analysisContext.selectedTimeZoneIndex = __AS.analysisContext.selectedTimeZoneIndex = ($scope.isCustomerLogin ? 0 : 1);
				$scope.chartTool.openMenu = true;
				$scope.autoRefreshDisabled = false;
				//$scope.switchOn.turnOn = false;
				$scope.autoRefreshStatus.turnOn = false;

				var hasPresetChanged = ($scope.presetId === 'true') && $scope.hasTagChanged;
				// boolean value
				var isNewChartPlotted = ($scope.presetId !== 'true') && $scope.hasTagChanged;
				// boolean value
				var obj = {
					'ctrl' : 'analysisSaveNewPresetCtl',
					'tpl' : 'analysis_saveNewPreset.html',
					'scope' : $scope,
					'type' : ''
				};

				if (!$scope.canNavigate && (hasPresetChanged || isNewChartPlotted )) {

					obj.type = 'savePreset';
					obj.callBack = function() {
						$scope.plotPresetChart(chartObj, type);
					};
					//$scope.askedToSave = true;
					modalService.open(obj);
					return;
				} else {
					$scope.plotPresetChart(chartObj, type);
				}
			}, function(error) {
				$scope.dataError();
			});
		};

		$scope.plotPresetChart = function(chartObj, type) {
			//** has preset modified or  new chart plotted without clicking on preset?
			//** if so give user option to save the current changes
			var charts = null;
			var btnStr = '';
			var timeObj = null;
			$scope.plottingTrigger = "chartPresetLoadTrigger";
			charts = chartObj.data.charts;
			btnStr = $scope.tRbtns[0].route;
			// time range
			timeObj = {
				stDt : analysisTwoService.getStartDt(btnStr, $scope.tRange.st),
				endDt : analysisTwoService.getEndDt(btnStr, $scope.tRange.end),
				tmIdx : 0
			};

			$scope.clearAllChartsForNewConfig();
			// cleanup existed unmodified presets
			$scope.enableDeletePreset = ($scope.isAdmin || type === "usr") ? true : false;
			// enable the save function
			if (chartObj.data.userId != "SYSTEM_PRESET" && $scope.hasTagChanged) {
				$scope.enableSaveButton = true;
			}
			// check if this preset can be deleted by the user
			$scope.presetType = type;
			// get the type of preset user clicked
			$scope.presetName = chartObj.data.presetName;
			// get the name of preset user clicked
			$scope.presetId = chartObj.data.presetId;
			// get the Id of preset user clicked
			$scope.selectedPreset = chartObj;
			$scope.isZoomApplied = __AS.isZoomApplied = false;
			__AS.analysisContext.selectedTimeIndex = 0;

			var chartObjs = [];
			//  to do check if user is not selecting the same preset hide one on the list
			_.each(charts, function(chart, idx) {
				var chartObj = {
					"tags" : chart.tags,
				};
				chartObjs[idx] = chartObj;
			});
			if (type === 'tpl') {
				delete chartObj.charts;
				$scope.canCreateTemplate = true;

				$scope.chartobjs = [];
				__AS.updateAllChart(timeObj, chartObjs);

			} else {

				$scope.chartobjs = [];
				__AS.updateAllChart(timeObj, chartObjs);
			}
		};

		//** removing tagNameDispaly and tagValuse from charts (not required to send to server)
		$scope.filteredChartData = function() {

			var chartArray = angular.copy($scope.plottedCharts);

			_.each(chartArray, function(chartObj) {
				delete chartObj.tagNameDisplayOption;
				delete chartObj.tagsValues;
				delete chartObj.rawData;
				delete chartObj.isRaw;
				delete chartObj.type;

			});
			//console.log(chartArray);
			return chartArray;
		};

		//** saving as new or existing preset
		$scope.savePreset = function(presetType, overWritePresetId, name, msg, overwrite) {
			var isSystemPreset;
			var chartArray;
			var obj;
			if (overWritePresetId) {
				var presetId = overWritePresetId;
			} else {
				var presetId = angular.copy($scope.presetId);
			}

			$scope.savePresetMsg = msg;
			$scope.presetName = name ? name : $scope.presetName;
			$scope.presetType = presetType ? presetType : $scope.presetType;

			if (presetType && typeof (presetType) === "string" && !overwrite) {
				// this event is triggered from modal
				// this action will be "save as" where id needs to be empty
				presetId = "";
			}

			// ** if modifying preset is system preset and user is not authorized
			// ** set the new preset as user preset

			isSystemPreset = ($scope.presetType === 'sys') ? true : false;
			var pType = isSystemPreset ? 'SystemPreset' : 'UserPreset';
			// ** defining chart arrays
			chartArray = $scope.filteredChartData();

			var tagNode = chartArray[0].response[0].tagNode;

			// create array of tags
			var userCharts = chartArray.map(function(chart) {
				var allSeries = [];

				chart.response.forEach(function(series) {
					var nSeries = {
						"customerId" : "GE",
						"sourceId" : series.sourceId,
						"enterpriseId" : series.tagNode.enterpriseId,
						"startDate" : "06/11/2015",
						"startTime" : chart.eventTime,
						"centralTagName" : series.tagNode.name + series.sourceId,
						"nodePath" : series.tagNode.nodePath,
						"nodeNamePath" : series.tagNode.nodeNamePath,
						"endDate" : "06/11/2015",
						"endTime" : chart.endEventTime,
						"chartType" : "1",
						"supportingTagId" : "1",
						"customParam1" : "1",
						"customParam2" : "1"
					};
					allSeries.push(nSeries);
				});
				return {
					"chartId" : 1,
					"tags" : allSeries
				};
			});
			var datatobesent = {
				"customerId" : $scope.customerId,
				"userId" : $rootScope.currentUser.userId,
				"presetName" : $scope.presetName,
				"presetId" : presetId,
				"presetType" : pType,
				"charts" : userCharts
			};

			// ** calling service to save preset
			analysisPreset.save(datatobesent).then(function(response) {

				$scope.presetType = isSystemPreset ? 'sys' : 'usr';
				$scope.preset = response;
				$scope.userPreset = __AS.userPreset = response.USER_PRESET;
				$scope.systemPreset = __AS.systemPreset = response.SYSTEM_PRESET;
				$scope.template = __AS.template = response.TEMPLATE;

				// ** setting selected preset
				_.each(response, function(obj) {
					_.each(obj, function(preset) {
						if (preset.presetName === $scope.presetName) {
							$scope.selectedPreset = preset;
						}
					});
				});
				// ** displaying success message
				if (pType === 'Template') {
					$scope.dataSuccess('The plot session template has been saved');
				} else {
					$scope.dataSuccess('The plot session has been saved');
				}

				// ** now user can navigated to other page
				$scope.canNavigate = true;

				// can this preset can be deleted by the user
				$scope.enableDeletePreset = ($scope.isAdmin || $scope.presetType === "usr") ? true : false;

				// get the name of preset user clicked
				$scope.presetName = $scope.selectedPreset.presetName;
				// get the Id of preset user clicked
				$scope.presetId = $scope.selectedPreset.presetId;
				// disable save button
				$scope.hasTagChanged = false;
				$scope.enableSaveButton = false;
				$scope.changeStatus = "";
			}, function(error) {
				$scope.dataError();
			});
			$scope.triggerOriginalPlotsBackup();
		};
		$scope.doNotSavePreset = function() {
			$scope.askedToSave = true;
		};
		// ** deleting preset
		// ** deleting preset
		$scope.deletePreset = function() {

			// make sure users are not on default config
			// make sure users are authorized

			var isSystemPreset = ($scope.presetType === 'sys' && $scope.isAdmin && !$scope.hasMultipleCustomer) ? true : false;

			var pType = isSystemPreset ? 'SystemPreset' : 'UserPreset';
			pType = ($scope.presetType === 'tpl') ? 'Template' : pType;

			var obj = {
				"customerId" : $scope.customerId,
				"userId" : $rootScope.currentUser.userId,
				"presetName" : $scope.presetName,
				"presetId" : $scope.presetId,
				"presetType" : pType
			};

			analysisPreset.delete(obj.customerId, obj.userId, obj.presetId, obj.presetType).then(function(response) {
				var presetArray = [];
				var i;
				switch (obj.presetType) {
				case "UserPreset" :
					presetArray = $scope.preset.USER_PRESET;
					break;
				case "SystemPreset" :
					presetArray = $scope.preset.SYSTEM_PRESET;
					break;
				case "Template" :
					presetArray = $scope.preset.TEMPLATE;
				}
				for ( i = 0; i < presetArray.length; i++) {
					if (presetArray[i].presetName === $scope.presetName) {
						presetArray.splice(i, 1);
						break;
					}
				}
				$scope.clearAllChartsForNewConfig();
				$scope.dataSuccess('The plot session has been deleted');
			}, function(error) {
				$scope.dataError(error);
			});
		};

		// ** Allow user to get out of analysis page
		$scope.navigateTo = function(flag) {
			var stateName = $scope.targetUrl.name;

			$scope.canNavigate = true;
			if (stateName === 'analysis') {
				$scope.initView();
				if (flag === 'navigateAway') {
					$scope.clearAllChartsForNewConfig();
				} else {
					//$scope.checkForMultipleCustomer();
				}
			} else {
				$state.go(stateName);
			}
		};

		// ** Full Screen Display
		$scope.fullScreenToggle = function() {
			$scope.fullScreenMode.visible = !$scope.fullScreenMode.visible;
			$timeout(function() {
				$(window).trigger('resize');
				// for chart resize
				$scope.chartTool.openMenu = true;
			});

		};

		// ** Minimize full screen to normal
		$scope.fullScreenMinimize = function() {
			$scope.fullScreenMode.visible = !$scope.fullScreenMode.visible;
			$timeout(function() {
				$(window).trigger('resize');
				// for chart resize
			});
		};

		// ** When user view is changed between Customer and ICenter

		$scope.$on('userView:switched', function() {
			var oldPlottedCharts = angular.copy(__AS.plottedCharts);
			__AS.plottedCharts = $scope.plottedCharts = [];
			_.each(oldPlottedCharts, function(chart, idx) {

				var chartObj = {
					"tags" : chart.tags,
					"tagNameDisplayOption" : "Customer",
					"tagsValues" : chart.tagsValues,
					"rawData" : chart.rawData,
					"type" : chart.type,
					"isRaw" : chart.isRaw
				};
				__AS.plottedCharts[idx] = chartObj;
			});
			$rootScope.$broadcast('event:plottedCharts', __AS.plottedCharts);

		});

		// ** When Time Zone is changed

		$scope.switchTimeZone = function(evt, idx) {
			__AS.analysisContext.selectedTimeZoneIndex = $scope.analysisContext.selectedTimeZoneIndex = idx;
			if (evt) {
				evt.preventDefault();
			}

			var oldPlottedCharts = angular.copy(__AS.plottedCharts);
			__AS.plottedCharts = $scope.plottedCharts = [];
			var timezoneOffset = 0;
			_.each(oldPlottedCharts, function(chart, idx) {

				var chartObj = {
					"tags" : chart.tags,
					"tagNameDisplayOption" : "Customer",
					"tagsValues" : chart.tagsValues,
					"rawData" : chart.rawData,
					"type" : chart.type,
					"isRaw" : chart.isRaw
				};
				__AS.plottedCharts[idx] = chartObj;
			});

			if (idx === 1) {
				$rootScope.siteTimezoneOffset = 0;
				//UTC
			} else {
				$rootScope.siteTimezoneOffset = 1;
				//Local (Site Time Zone)
			}
			$rootScope.$broadcast('event:plottedCharts', __AS.plottedCharts);

		};

		// ** Update Chart's Series Data

		$scope.updateChartSeries = function(idx, chartInfo, chartDataType) {

			var updateType = chartDataType.type;
			var hasRawData = (chartDataType.raw) ? true : false;

			__AS.selectedPlottedChartForEdit = idx;
			__AS.changeChartSeries(chartInfo.tags, updateType, hasRawData);
		};

		/*******************************/
		/****** Error Handler *********/
		/******************************/
		$scope.dataError = function(msg) {

			var message = msg ? msg : 'Unable to get data from server!';

			$scope.message = {
				type : 'error',
				title : 'Error:',
				content : message
			};
		};

		$rootScope.$on('analysisError', function() {
			$scope.message = {
				type : 'error',
				title : 'Error:',
				content : 'There was an error getting data!'
			};
		});

		$scope.dataSuccess = function(response) {
			var msgObj = {
				type : 'success',
				title : 'Message:',
				content : response
			};

			$scope.clearMessage();
			$scope.message = msgObj;

			$timeout(function() {
				$scope.clearMessage();
			}, 2000);
		};
		$scope.$on('update-chartobj', function(evt, obj) {
			__AS.chartobjs = obj.chartobj;
			$scope.chartobjs = obj.chartobj;
		});
		// need to do
		// jasmin testing
		// message to save the preset
		// make user user has not change the preset , if change get ready to show pop up
	}]);

});
