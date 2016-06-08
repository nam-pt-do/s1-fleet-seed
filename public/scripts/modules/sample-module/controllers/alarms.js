/**
 * Renders all the widgets on the tab and triggers the datasources that are used by the widgets.
 * Customize your widgets by:
 *  - Overriding or extending widget API methods
 *  - Changing widget settings or options
 */
'use strict';

define(['angular', 'controllers-module', 'vruntime', 'moment'], function(angular, controllers) {

	// Controller definition
	controllers.controller('AlarmsCtrl', ['$log', '$scope', '$state', '$stateParams', '$assets', '$alarms', 'ctxGlobal', 'ctxAlarms', 'UserSelections', '$filter', '$modal', '$timeout', 'dateFormatter', '$rootScope', '$interval','toastr',
	function($log, $scope, $state, $stateParams, $assets, $alarms, ctxGlobal, ctxAlarms, UserSelections, $filter, $modal, $timeout, dateFormatter, $rootScope, $interval,toastr) {

		//Initialize


		var setRefresh;
		var _pg;
		var _pageIndex;
		var originalChartData = [];
		var chartJSON = [];
		var originalTimeSwitchData = [];
		var optMachine;
		var optPoint = [];
		var optVariable = [];
		var filterArray = [];
		var tempObject = [];
		var totalFilters = [];
		var getWaveformData = [];
		var filterEq_normalizedSeverityLevel = {};
		var filterEq_severityLevel = {};
		var filterEq_dataSource = {};
		var filterEq_count = {};
		var filterEq_acknowledged = {};
		var filterEq_active = {};
		var filterEq_density = {};
		var orderBy = $filter('orderBy');
		var refreshPointId = null;
		var refreshVariableId = null;
		var refreshEventId = null;
		$scope.table = null;
		$scope.rows = null;
	
		$scope.statusMessage = "";

		//toastr.info('There are total of 5000 alarms on this page', 'Toastr fun!',{"positionClass" : "toast-top-right"});


		var getCountRange = function(countRange) {
			var range = {};
			switch (countRange) {
			case '0-10':
				range.min = 0;
				range.max = 10;
				break;
			case '10-50':
				range.min = 10;
				range.max = 50;
				break;
			case '50-250':
				range.min = 50;
				range.max = 250;
				break;
			case '250-1000':
				range.min = 250;
				range.max = 1000;
				break;
			case '>=1000':
				range.min = 1000;
				break;
			case '0-0.2':
				range.min = 0;
				range.max = 0.2;
				break;
			case '0.4-0.6':
				range.min = 0.4;
				range.max = 0.6;
				break;
			case '0.6-0.8':
				range.min = 0.6;
				range.max = 0.8;
				break;
			case '0.8-1.0':
				range.min = 0.8;
				range.max = 1.0;
				break;

			case '10-20':
				range.min = 10;
				range.max = 20;
				break;

			case '20-40':
				range.min = 20;
				range.max = 40;
				break;

			case '40-80':
				range.min = 40;
				range.max = 80;
				break;

			case '>80':
				range.min = 80;
				break;

			}
			return range;
		};
		
		
		
		var getEnterpriseConnectionStatus = function() {

			var options = {
				customerId : $scope.customerId || ctxGlobal.getCustomerId(),
				enterpriseId : $scope.enterpriseId || ctxGlobal.getEnterpriseId()
			};
			
			if(options.enterpriseId){

		    $alarms.getEnterpriseConnectionStatus(options).then(
			// success
			function(data) {
				var response = data.response;
				if (response.communicationStatus == "Not Communicating") {
					$scope.statusMessage = response.communicationStatusMessage;
				}else{
					$scope.statusMessage = "";
				}
			},
			// error
			function(error) {
				$log.error(error);
			});

			}else{
				$scope.statusMessage = "";
			}

			
		};
		var getSeverityValue = function(label) {
			var sev;
			switch (label) {
			case 'High':
				sev = 3;
				break;
			case 'Medium':
				sev = 2;
				break;
			case 'Low':
				sev = 1;
				break;
			}
			return sev;
		};
		/**
		 * startTime and endTime return ISO 8601 strings
		 * depending on the value of $scope.range
		 * @return {string} ISO8601 String.
		 */
		var preferredTimeZone = UserSelections.getTimezone() || 'tzLocal';
		var getTimeStrings = function(range) {
			var t = {};
			switch (range) {
			case '1day':
				t.start = moment().subtract('hour', 24).toISOString();
				t.end = moment().toISOString();
				break;

			case '1week':
				t.start = moment().subtract('week', 1).toISOString();
				t.end = moment().toISOString();
				break;

			case '1month':
				t.start = moment().subtract('month', 1).toISOString();
				t.end = moment().toISOString();
				break;

			case '3months':
				t.start = moment().subtract('month', 3).toISOString();
				t.end = moment().toISOString();
				break;

			case '1m':
				t.start = moment().subtract('month', 1).toISOString();
				t.end = moment().toISOString();
				break;

			case '6m':
				t.start = moment().subtract('month', 6).toISOString();
				t.end = moment().toISOString();
				break;

			case '1y':
				t.start = moment().subtract('month', 12).toISOString();
				t.end = moment().toISOString();
				break;

			default:
				t.start = null;
				t.end = null;
				break;
			}
			return t;
		};
		var getTimeStringsGMT = function(range) {
			var t = {};
			switch (range) {
			case '1day':
				t.start = moment().subtract('hour', 24).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				t.end = moment().zone('GMT').format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				break;

			case '1week':
				t.start = moment().subtract('week', 1).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				t.end = moment().zone('GMT').format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				break;

			case '1month':
				t.start = moment().subtract('month', 1).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				t.end = moment().zone('GMT').format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				break;

			case '3months':
				t.start = moment().subtract('month', 3).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				t.end = moment().zone('GMT').format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				break;

			case '1m':
				t.start = moment().subtract('month', 1).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				t.end = moment().zone('GMT').format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				break;

			case '6m':
				t.start = moment().subtract('month', 6).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				t.end = moment().zone('GMT').format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				break;

			case '1y':
				t.start = moment().subtract('month', 12).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				t.end = moment().zone('GMT').format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				break;

			default:
				t.start = null;
				t.end = null;
				break;
			}
			return t;
		};
		var getTimeStringForTrend = function(range) {
			var baseTime = $scope.lastOccurrenceTime;

			var t = {};
			switch (range) {
			case '1day':
			    t.start = moment(baseTime).subtract('hour', 18).toISOString();
				var endForBaseDate = moment(baseTime).add('hour', 6).toISOString();
				var endToday = moment().toISOString();
				if (endForBaseDate < endToday) {
					t.end = endForBaseDate;
				} else {
					t.end = endToday;
				}

				break;

			case '1week':
				t.start = moment(baseTime).subtract('hour', 126).toISOString();
				// t.end = moment().toISOString();
				endForBaseDate = moment(baseTime).add('hour', 42).toISOString();
				endToday = moment().toISOString();
				if (endForBaseDate < endToday) {
					t.end = endForBaseDate;
				} else {
					t.end = endToday;
				}
				break;

			case '1month':
			    t.start = moment(baseTime).subtract('hour', 540).toISOString();
				// t.end =  moment().toISOString();
				endForBaseDate = moment(baseTime).add('hour', 180).toISOString();
				endToday = moment().toISOString();
				if (endForBaseDate < endToday) {
					t.end = endForBaseDate;
				} else {
					t.end = endToday;
				}
				break;

			case '3months':
				t.start = moment(baseTime).subtract('hour', 1620).toISOString();
				// t.end =  moment().toISOString();
				endForBaseDate = moment(baseTime).add('hour', 540).toISOString();
				endToday = moment().toISOString();
				if (endForBaseDate < endToday) {
					t.end = endForBaseDate;
				} else {
					t.end = endToday;
				}
				break;

			case '6months':
				t.start = moment(baseTime).subtract('hour', 3240).toISOString();
				// t.end =  moment().toISOString();
				endForBaseDate = moment(baseTime).add('hour', 1080).toISOString();
				endToday = moment().toISOString();
				if (endForBaseDate < endToday) {
					t.end = endForBaseDate;
				} else {
					t.end = endToday;
				}
				break;

			default:
				t.start = null;
				t.end = null;
				break;
			}
			return t;

		};
		var getTimeStringForTrendGMT = function(range) {
			var baseTime = $scope.lastOccurrenceTime;

			var t = {};
			switch (range) {
			case '1day':
					t.start = moment(baseTime).subtract('hour', 18).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
					var endForBaseDate = moment(baseTime).add('hour', 6).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
					//var endToday=moment().format("YYYY-MM-DDTHH:mm:ss.SSS")+"Z";
					var endToday = moment().zone('GMT').format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
					if (endForBaseDate < endToday) {
						t.end = endForBaseDate;
					} else {
						t.end = endToday;
					}

				break;

			case '1week':
				t.start = moment(baseTime).subtract('hour', 126).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				// t.end = moment().toISOString();
				endForBaseDate = moment(baseTime).add('hour', 42).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				endToday = moment().zone('GMT').format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				if (endForBaseDate < endToday) {
					t.end = endForBaseDate;
				} else {
					t.end = endToday;
				}
				break;

			case '1month':
				t.start = moment(baseTime).subtract('hour', 540).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				// t.end =  moment().toISOString();
				endForBaseDate = moment(baseTime).add('hour', 180).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				endToday = moment().zone('GMT').format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				if (endForBaseDate < endToday) {
					t.end = endForBaseDate;
				} else {
					t.end = endToday;
				}
				break;

			case '3months':
				t.start = moment(baseTime).subtract('hour', 1620).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				// t.end =  moment().toISOString();
				endForBaseDate = moment(baseTime).add('hour', 540).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				endToday = moment().zone('GMT').format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				if (endForBaseDate < endToday) {
					t.end = endForBaseDate;
				} else {
					t.end = endToday;
				}
				break;
			case '6months':
				t.start = moment(baseTime).subtract('hour', 3240).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				// t.end =  moment().toISOString();
				endForBaseDate = moment(baseTime).add('hour', 1080).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				endToday = moment().zone('GMT').format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				if (endForBaseDate < endToday) {
					t.end = endForBaseDate;
				} else {
					t.end = endToday;
				}
				break;

			default:
				t.start = null;
				t.end = null;
				break;
			}
			return t;

		};
		//METHOD: Get column list to allow users add/remove columns from Alarms and Events table
		var getAlarmFields = function() {
			//[9/5/2014]-Load context otherwise load default values
			if (ctxAlarms.getAlarmsTable().selectedColumns.length < 1) {
				$alarms.getAlarmFields().then(
				// success
				function(response) {
					$scope.fieldsToShow = response;
				},
				// error
				function(error) {
					$log.error(error);
				});
			} else {
				$scope.fieldsToShow = ctxAlarms.getAlarmsTable().selectedColumns;
				$scope.showSpinner = false;
			}
		};
		var orderPref = function(response) {
			if ($scope.currentUser && $scope.currentUser.preference) {
				var _predicate = $scope.currentUser.preference.alarmsGridSort;
				var _reverse = $scope.currentUser.preference.alarmsGridSortOrder;
			}

			var _alarms;
			if($scope.predicate) {
				_alarms = orderBy(response, $scope.predicate, $scope.sortOrder);
			}else{
				_reverse = _reverse=="sorting_desc" ? false : true;
				_alarms = orderBy(response, _predicate, _reverse);

			}
			return _alarms;
			//return(reverse);
		};
		var orderTable = function(predicate, sortOrder) {
			if($scope.predicate != undefined && predicate != $scope.predicate){
				$scope.sortOrder = false;
			}else{
				$scope.sortOrder = sortOrder;
			}
			$scope.predicate = predicate;
			$scope.alarms = orderBy($scope.alarms, predicate, $scope.sortOrder);
		};
		//METHOD: Set data for Bar/Line chart
		var getBasicPlots = function(obj) {
			$scope.chartData = obj;
			originalChartData = obj;
		};
		var getChartData = function(plotType, sourceId) {

			if (plotType == 'alarm-plot' && $scope.plotType == "System 1") {
				//var sourceID= sourceId ||$scope.selected;
				var sourceID = $scope.optVarId || $scope.selected;
				var options = alarmPlotParams();
				var eventTime = $scope.lastOccurrenceTime;
				var updatedResponse = [],
				    timeSwitchData = [];
				$scope.showSpinner = true;
				$scope.hasData = false
				$alarms.getAlarmPlot(plotType, options, sourceID).then(
				// success
				function(data) {

					var response = data.response;
					if (plotType == 'alarm-plot' || plotType == 'alarm-plot-waveform') {
						updatedResponse.push({
							'response' : response,
							'eventTime' : eventTime,
							'preferredTimeZone' : preferredTimeZone
						});
						// $scope.chartData = response;

						if (response.length > 0 && response.indexOf("Error") < 0 && typeof (response) !== 'string') {

							if (response[0].data.length > 0) {
								$scope.chartDataAlarmPlot = updatedResponse[0];
								$scope.hasData = true;
								$scope.showSpinner = false;

							} else {
								$scope.hasData = false;
								$scope.showSpinner = false;

							}
						} else {
							$scope.hasData = false;
							$scope.showSpinner = false;
							$scope.showErrorForWaveform = true;
						}
					} else {
						$scope.chartData = chartJSON;
					}
				},
				// error
				function(error) {
					$scope.hasData = false;
					$scope.showErrorForWaveform = true;

					$scope.showSpinner = false;
					$log.error(error);
				});
			} else if ($scope.plotType == 'smartSignal') {
				//$log.info("Loading Waveform from getChartData methods - Smart Signal Alarm Plot");
				$scope.showSpinnerForSSPlots = true;
				getWaveformSS($scope.sourceId, $scope.tagId);
			} else {
				if ($scope.alarms && chartJSON.length > 0) {
					chartJSON[0].response = $scope.alarms;
					$scope.chartData = chartJSON;
				}
				$scope.showSpinner = false;
			}
		};
		var getMachineService = function(sourceID) {
			//var nodeID=$scope.nodeId;
			var nodeID = $scope.enterpriseId || ctxGlobal.getEnterpriseId();
			var customerId = $scope.customerId;
			$scope.tempSourceID = sourceID;

			$alarms.getMachineService(customerId, nodeID, sourceID).then(
			//Success
			function(response) {
				var _optVariable = [],
				    _optWaveform;
				optMachine = response.name;
				optPoint = [];
				_.forEach(response.childNodes, function(child) {
					if (optPoint.indexOf(child.nodeId < 0)) {
						optPoint.push({
							"id" : child.nodeId,
							"name" : child.name,
							"children" : child.childNodes
						});
					}
				});
				$scope.optMachine = optMachine;

				//Empty the array and then push new points to avoid duplication
				$scope.optPoint.length = 0;
				$scope.optPoint.push.apply($scope.optPoint, optPoint);

				//Separate dropdown values for Waveform(Sync& Async) NodeTypeEnum=s1_async_dynamic_variable
				_optVariable = [];
				_optWaveform = [];

				//TODO-Test dynamicVariables array in case of no data/null/bad data
				var variablesForPoint = _.filter($scope.optPoint, {
					"id" : $scope.tempSourceID
				});
				if (variablesForPoint.length > 0) {
					var staticVariables = _.filter(variablesForPoint[0].children, {
						"nodeTypeEnum" : "s1_static_variable"
					});

					var dynamicVariables = _.filter(selectedPoint[0].children, function(child) {
					return child.nodeTypeEnum == "s1_sync_dynamic_variable" || child.nodeTypeEnum == "s1_async_dynamic_variable"; 
					});

					$scope.optVariable = staticVariables;
					$scope.optVarPath = $scope.optVariable[0].nodePath;
					$scope.optVar = $scope.optVariable[0].name;
					$scope.optVarId = $scope.optVariable[0].nodeId;
					$scope.optVariableWaveform = dynamicVariables;
					$scope.optWave = $scope.optVariableWaveform[0].name;
				} else {
					$scope.hasData = false;
					$scope.showSpinner = false;
				}
			}, function(error) {
				$log.error(error);
			});
		};

		var getMachineForEventSource = function(sourceID,assetId) {
			//var nodeID=$scope.nodeId;
			var nodeID = $scope.enterpriseIdFromEvent;
			//$scope.enterpriseId=$scope.enterpriseIdFromEvent;
			var customerId = $scope.customerId;
			$scope.tempSourceID = sourceID;
			$scope.sourceId = sourceID;
			$scope.hasData = false;
			$scope.hasDataforWaveform = true;
			$alarms.getMachineForEventSource(customerId, nodeID, sourceID,assetId).then(
			//Success
			function(obj) {
				var response = obj.response;
				$scope.hasData = true;
				if ( typeof (response) != "string" && response != 0) {
					$scope.hasData = true;
					var _optVariable = [],
					    _optWaveform;
					optMachine = response.machine.name;
					optPoint = [];
					_.forEach(response.machine.childNodes, function(child) {
						if (optPoint.indexOf(child.nodeId < 0)) {
							optPoint.push({
								"id" : child.nodeId,
								"name" : child.name,
								"children" : child.childNodes
							});
						}
					});
					$scope.optMachine = optMachine;

					//Empty the array and then push new points to avoid duplication
					$scope.optPoint.length = 0;

					$scope.optPoint.push.apply($scope.optPoint, optPoint);
					var pointIndex = _.findIndex($scope.optPoint, {
						"id" : response.preferredPoint
					});
					if (pointIndex < 0) {
						$scope.hasData = false;
						$scope.showSpinner = false;
						$scope.showErrorForWaveform = false;
						$scope.showSpinnerForWaveform = false;
					} else {
						$scope.opt = $scope.optPoint[pointIndex].name;

						//Separate dropdown values for Waveform(Sync& Async) NodeTypeEnum=s1_async_dynamic_variable
						_optVariable = [];
						_optWaveform = [];

						//TODO-Test dynamicVariables array in case of no data/null/bad/undefined data
						var variablesForPoint = _.filter($scope.optPoint, {
							"id" : response.preferredPoint
						});
						if (variablesForPoint.length > 0) {
							
						if(document.getElementById('tooltipTimeSeries')){
						var toolTipText = '<b>'  + '</b>' + ' '  + ' &nbsp;&nbsp;'  + ' ';
						document.getElementById('tooltipTimeSeries').innerHTML = toolTipText;
						}
						
					
							var staticVariables = _.filter(variablesForPoint[0].children, {
								"nodeTypeEnum" : "s1_static_variable"
							});

							var dynamicVariables = _.filter(variablesForPoint[0].children, function(child) {
								return child.nodeTypeEnum == "s1_sync_dynamic_variable" || child.nodeTypeEnum == "s1_async_dynamic_variable"; 
							});

							$scope.optVariable = staticVariables;

							//Prepopulate the dropdowns with preferred point and corresponding preferred variable

							if (response.preferredStaticVar) {
								var point = _.findIndex(staticVariables, {
									"nodeId" : response.preferredStaticVar
								});
								if (point > -1) {
									$scope.optVarPath = $scope.optVariable[point].nodePath;
									$scope.optVar = $scope.optVariable[point].name;
									$scope.optVarId = $scope.optVariable[point].nodeId;
								} else {
									$scope.optVarPath = $scope.optVariable[0].nodePath;
									$scope.optVar = $scope.optVariable[0].name;
									$scope.optVarId = $scope.optVariable[point].nodeId;
								}
							}

							$scope.optVariableWaveform = dynamicVariables;
							if (response.preferredDynamicVar) {
								var dynVar = _.findIndex($scope.optVariableWaveform, {
									"nodeId" : response.preferredDynamicVar
								});
								if (dynVar > -1) {
									$scope.optWave = $scope.optVariableWaveform[dynVar].name;
									$scope.sourceId = $scope.optVariableWaveform[dynVar].nodeId;
								} else {
									$scope.optWave = $scope.optVariableWaveform[0].name;
									$scope.sourceId = $scope.optVariableWaveform[0].nodeId;

								}
							} else {
								if ($scope.optVariableWaveform[0]) {
									$scope.optWave = $scope.optVariableWaveform[0].name;
									$scope.showErrorForWaveform = false;

								} else {
									//$scope.hasData="false";
									$scope.showSpinnerForWaveform = false;
									$scope.showErrorForWaveform = true;
									$scope.optWave = null;
									$scope.sourceId = null;

									
									
									
								//getChartData('alarm-plot');
								}
							}
							getChartData('alarm-plot');
							getWaveform('alarm-plot', $scope.waveformType, $scope.sourceId, $scope.optWave);
						} else {
							$scope.hasData = false;
							$scope.showSpinner = false;
							$scope.showErrorForWaveform = false;
							$scope.showSpinnerForWaveform = false;
						}
					}
				} else {
					$scope.hasData = false;
					$scope.showSpinner = false;
					$scope.showErrorForWaveform = false;
					$scope.showSpinnerForWaveform = false;
				}
			}, function(error) {
				$log.error(error);
			});
		};

		var getAlarms = function(options) {
			$scope.showFetchingIcon = true;
			$alarms.getAlarmList(options).then(
			// success
			function(data) {

				var response = data.response;
				$scope.showFetchingIcon = false;
				//debugger;
				if ( typeof (response) != "string") {
					var getChartJSON = [];
					//Update [8/28/2014]:Format the Asset Path to exclude point/variable name and show dots(...)
					// followed by only last two levels
					var formattedResponse = [];
					_.forEach(response, function(obj) {

						var fleetCategories = [{
							'id' : 'assetManagement',
							'value' : 'Asset Management'
						}, {
							'id' : 'assetProtection',
							'value' : 'Asset Protection'
						}, {
							'id' : 'instrumentManagement',
							'value' : 'Instrument Management'
						}, {
							'id' : 'instrumentProtection',
							'value' : 'Instrument Protection'
						}, {
							'id' : 'smartSignal',
							'value' : 'SmartSignal'
						}];

						//Data Scrubbing - Change date format as per preference; default is local time

						if (preferredTimeZone == 'tzGmt') {
							//  console.log("Setting GMT TimeZone");
							//Get UTC Date-Time formatter
							if (obj.lastOccurrenceTime === null) {
								obj.lastOccurrenceTime = " ";
							} else {
								obj.lastOccurrenceTime = dateFormatter.getUTCFormat(obj.lastOccurrenceTime);
							}
							if (obj.firstOccurrenceTime === null) {
								obj.firstOccurrenceTime = " ";
							} else {
								obj.firstOccurrenceTime = dateFormatter.getUTCFormat(obj.firstOccurrenceTime);
							}
							
							

							if (obj.acknowledgedDateTime === null || obj.acknowledgedDateTime === undefined) {
								obj.acknowledgedDateTime = " ";
							} else {
								obj.acknowledgedDateTime = dateFormatter.getUTCFormat(obj.acknowledgedDateTime);
							}
						} else {

							//Get Local Time Formatter
							// console.log("Local Time zone");
							if (obj.lastOccurrenceTime === null) {
								obj.lastOccurrenceTime = " ";
							} else {
								//obj.lastOccurrenceTime = dateFormatter.getUTCFormat(obj.lastOccurrenceTime);
								obj.lastOccurrenceTime = dateFormatter.getUTCFormatCompleteDate(obj.lastOccurrenceTime);
							}
							if (obj.firstOccurrenceTime === null) {
								obj.firstOccurrenceTime = " ";
							} else {
								//obj.firstOccurrenceTime = dateFormatter.getUTCFormat(obj.firstOccurrenceTime);
								obj.firstOccurrenceTime = dateFormatter.getUTCFormatCompleteDate(obj.firstOccurrenceTime);
							}
							
							

							if (obj.acknowledgedDateTime === null || obj.acknowledgedDateTime === undefined) {
								obj.acknowledgedDateTime = " ";
							} else {
								//obj.acknowledgedDateTime = dateFormatter.getUTCFormat(obj.acknowledgedDateTime);
								obj.acknowledgedDateTime = dateFormatter.getUTCFormatCompleteDate(obj.acknowledgedDateTime);
							}
						}

						if (obj.assetNamePath) {
							var strParts = obj.assetNamePath.split('/');
							var strLength = strParts.length;
							//  var formattedPath='.../'+strParts[strLength-3]+'/'+strParts[strLength-2];
							var _eventOccurence = _.chain(obj.eventOccurences).pluck('startTime').valueOf();

							obj.filterThis = true;

							obj.tooltip = obj.assetNamePath;
							// obj.assetNamePath=formattedPath;
							//   obj.assetNamePath='<span title="'+obj.tooltip+'">'+formattedPath+'</span>';
							// obj.count=('<span>'+obj.count+'</span>');
							obj.density = Math.round(obj.density * 100) / 100;
							if (obj.dataSource == "SmartSignal") {
								obj.type = obj.description;
								obj.assetNamePath = '<span title="' + obj.tooltip + '">' + '.../' + strParts[strLength - 3] + '/' + strParts[strLength - 2] + '</span>';
								obj.fleetCategoryEnum = ' ';
								if (obj.eventStateEnum == 'Active') {
									obj.eventStateEnum = 'Yes';
								} else {
									obj.eventStateEnum = ' ';
								}
							} else {
								if (obj.dataSource == "System1") {
									//  var _eventCategory = obj.fleetCategoryEnum;
									// var getCategoryNameIndex= _.findWhere(fleetCategories,{id:_eventCategory});
									// obj.fleetCategoryEnum='';
									// obj.fleetCategoryEnum = getCategoryNameIndex.value;

									if (obj.eventStateEnum == 'Active') {
										obj.eventStateEnum = 'Yes';
									} else {
										obj.eventStateEnum = 'No';
									}

									obj.dataSource = "System 1";
									var baseString = obj.assetNamePath;
									var splitBaseString = baseString.split('/');
									var baseStringId = obj.assetPath;
									var assetPathId = baseStringId.split('/');
									//var indexAsset = baseString.indexOf(obj.machineName || obj.machineTrainName || obj.trainMachine);

									//var partialAssetPath = baseString.substr(0, indexAsset - 1);
									//var _strParts = partialAssetPath.split('/');
									var assetPathIdIndex = assetPathId.indexOf(obj.machineId || obj.machineTrainId || obj.nodeParentId);
									//var _strPartsLength = _strParts.length;
									if (!obj.machineId && !obj.machineTrainId && obj.nodeParentId) {
										if ((assetPathIdIndex - 1) == 0) {
											var formattedPath = splitBaseString[assetPathIdIndex - 1] + '/' + splitBaseString[assetPathIdIndex];
										} else {
											var formattedPath = '.../' + splitBaseString[assetPathIdIndex - 1] + '/' + splitBaseString[assetPathIdIndex];
										}

									} else {
										if ((assetPathIdIndex - 2) == 0) {
											var formattedPath = splitBaseString[assetPathIdIndex - 2] + '/' + splitBaseString[assetPathIdIndex - 1];
										} else {
											var formattedPath = '.../' + splitBaseString[assetPathIdIndex - 2] + '/' + splitBaseString[assetPathIdIndex - 1];
										}
									}

									//var formattedPath = '.../' + _strParts[_strPartsLength - 2] + '/' + _strParts[_strPartsLength - 1];
									obj.assetNamePath = '<span title="' + obj.tooltip + '">' + formattedPath + '</span>';
									var indexPoint = baseString.indexOf(obj.point);
									obj.asset = baseString.substr(assetPathIdIndex, (indexPoint - assetPathIdIndex) - 1);
									if (obj.density == 0) {
										obj.density = ' ';
									}
								}
							}
							//  console.log("obj.acknowledged = "+obj.acknowledged);
							if (obj.acknowledged === true) {
								obj.acknowledged = "Yes";
							} else {
								obj.acknowledged = "No";
							}
							$scope.showFetchingIcon = false;
						}
					});
					$scope.alarms = orderPref(response);
					
					//Added following lines to refresh the plots with autorefresh or clicking on refresh button on alarms page
					var pointVarExists = false;

					for(var i = 0; i <= $scope.alarms.length -1; i++){
						
							if(refreshPointId == $scope.alarms[i].sourceId || refreshVariableId == $scope.alarms[i].sourceId){
									if(refreshEventId == $scope.alarms[i].eventId){
										pointVarExists  = true;
									}
							}
				}

					if(!pointVarExists){
		
						$scope.chartType = '';
						$scope.plotType = '';
						$scope.chartData = {};
						$scope.chartDataWaveform = {};
						chartJSON.length = 0;      
					}        	
					
					
					
					
					
					
					
					//$scope.alarms = response;
					// $scope.pageSize=5;
					$scope.pageSize = $scope.pages || '10';
					var numberOfPages = function() {
						return (Math.ceil($scope.alarms.length / $scope.pageSize));
					};

					$scope.totalItems = Math.ceil($scope.alarms.length / $scope.pageSize);
					//   console.log("Total Items: "+$scope.totalItems);
					$scope.currentPage = 1;

					$scope.setPage = function(pageNo) {
						$scope.currentPage = pageNo;
					};

					$scope.pageChanged = function() {
						//console.log('Page changed to: ' + $scope.currentPage);
					};

					for (var j = 0; j < response.length; j++) {
						getChartJSON.push(response[j]);
					}
					chartJSON.length = 0;
					chartJSON.push({
						"options" : options,
						"response" : getChartJSON
					});

					getBasicPlots(chartJSON);
					$scope.errorCode = false;
				} else {
					//Show Error messages
					$scope.errorCode = true;
					$scope.alarms = [];
				}
			},
			// error
			function(error) {
				$scope.showFetchingIcon = false;
				$log.error(error);
			});
		};

		var getWaveform = function(plotType, waveformType, sourceId, waveformCriteria, eventTime) {
			$scope.prevDisable = false;
			$scope.nextDisable = false;
			var sourceID = sourceId || $scope.selected;
			//$scope.showSpinnerForWaveform=true;

			// var sourceID=194;
			var options = alarmPlotParams();
			var getWaveformData = [];
			var time;
				if (eventTime) {
					time = eventTime;
					//moment(eventTime).format("YYYY-MM-DDTHH:mm:ss.SSS")+"Z";
				} else if ($scope.lastOccurrenceTime) {

					var utcDate;
					if(preferredTimeZone == "tzLocal"){
						// console.log('in local time, get UTC date');
					    var utcDate = moment($scope.lastOccurrenceTime).utc();						
					} else {
						// console.log('in utc time, do nothing');
						utcDate = $scope.lastOccurrenceTime;
					}
					// console.log('lastOccurrenceTime: ' + JSON.stringify($scope.lastOccurrenceTime));
					// console.log('utcDate: ' + JSON.stringify(utcDate));

					time = moment(utcDate).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				}

			if (plotType == 'alarm-plot') {
				$alarms.getWaveform(plotType, options, time, sourceID).then(
				//success
				function(obj) {
					var response = obj.response;
					var waveformDataSeriesLen = null;
					$scope.modelTimeSwitch = null;
				
					if(obj.status !== '500'){
						if( typeof (response) != "string" && $scope.waveformType == 'Frequency'){
							waveformDataSeriesLen = obj.response[0].waveformFFT.length;
						}
						else {
							waveformDataSeriesLen = obj.response[0].rawTimeSeries.length;
						}
					}
					
					if ( typeof (response) != "string" && waveformDataSeriesLen) {
						for (var i = 0; i < response.length; i++) {
							getWaveformData.push(response[i]);
						}
						var responseObject = {
							"filterType" : waveformType || $scope.waveformType,
							"filterCriteria" : waveformCriteria || $scope.optWave,
							"plotType" : plotType,
							"response" : response
						};
						originalTimeSwitchData = [];
						if (response[0].nextSampleTime.substring(0, 4) === '0001') {
							var tmpnext = "";
							$scope.nextDisable = true;
						} else {
							var tmpnext = moment(response[0].nextSampleTime).toISOString();
							$scope.nextDisable = false;
						}

						if (response[0].prevSampleTime.substring(0, 4) === '0001') {
							var tmpprev = "";
							$scope.prevDisable = true;
						} else {
							var tmpprev = moment(response[0].prevSampleTime).toISOString();
							$scope.prevDisable = false;
						}

						var tmpcurr = moment(response[0].datetime).toISOString();
						//Add values to time switch
						originalTimeSwitchData.push({
							'id' : 0,
							'name' : tmpprev
						});

						originalTimeSwitchData.push({
							'id' : 1,
							'name' : tmpcurr
						});

						originalTimeSwitchData.push({
							'id' : 2,
							'name' : tmpnext
						});

						$scope.optTime = originalTimeSwitchData;
						$scope.modelTimeSwitch = $scope.optTime[1];

						if(preferredTimeZone == "tzLocal"){

							 $scope.waveformTimeDisplay = moment($scope.modelTimeSwitch.name).utc($scope.modelTimeSwitch.name).local().format("YYYY-MM-DD HH:mm:ss");

						} else {
							$scope.waveformTimeDisplay = $scope.modelTimeSwitch.name.replace("T", " ");
							$scope.waveformTimeDisplay = $scope.waveformTimeDisplay.substring(0, $scope.waveformTimeDisplay.indexOf('.'));
			

						}

						//console.log("responseObject",responseObject)
						$scope.chartDataWaveform = responseObject;

						/*if(response.length>0 && response.indexOf("Error")<0){
						 $scope.hasData=true;
						 }
						 else{
						 $scope.hasData="false";
						 }*/
						$scope.hasDataforWaveform = true;
						$scope.showSpinnerForWaveform = false;
						$scope.showErrorForWaveform = false;
					} else {
						if ($scope.chartDataWaveform)
							$scope.chartDataWaveform.length = 0;
						else {
							$scope.chartDataWaveform = [];
							$scope.chartDataWaveform.length = 0;
						}
                        $scope.hasDataforWaveform = false;
						$scope.showSpinnerForWaveform = false;
						$scope.showErrorForWaveform = false;

					}
				},
				//error
				function(error) {

					$scope.showSpinnerForWaveform = false;
					$scope.showErrorForWaveform = false;
					getWaveformData = [];
					$log.error(error);
				});
			} else {
				$scope.prevDisable = true;
				$scope.nextDisable = true;
			}
		};

		var alarmsListParams = function() {
			var params = {
				customerId : $scope.customerId,
				enterpriseId : ctxGlobal.getEnterpriseId(),
				isActive : $scope.range === 'active',
				startTime : getTimeStrings($scope.range).start,
				endTime : getTimeStrings($scope.range).end,
				consolidate : $scope.consolidated
			};
		
			// For enterprises, don't send the nodeId
			if ($scope.$parent.nodeType && $scope.$parent.nodeType !== 'enterprise') {
				params.nodeId = ctxGlobal.getNodeId();
			}

			return params;

		};
		//Recursive function to get childNodes or the node
		var getChildNodes = function(baseNode) {
			if (baseNode.id == $rootScope.nodeId) {
				//Matched, return available children else return itself
				if (baseNode.childNodes.length > 0) {
					return baseNode.childNodes;
				} else {
					return baseNode;
				}
			} else {
				//Check its children for match (machine level/train level)
				if (baseNode.childNodes.length > 0) {
					var _children;
					for (var k = 0; k < baseNode.childNodes.length; k++) {
						//_children= getChildNodes(baseNode[k]);
						if (baseNode.childNodes[k].id == $rootScope.nodeId) {
							//Level 2
							if (baseNode.childNodes[k].childNodes.length > 0) {
								return baseNode.childNodes[k].childNodes;
							} else {
								//Level 3
								return [baseNode.childNodes[k]];
								// return getChildNodes(baseNode.childNodes[k]);
							}
						}
						/*else{
						 return getChildNodes(baseNode[k]);
						 }*/
					}
					if (_children.length > 0) {
						return _children;
					}
				} else {
					//Case: No match and no children to recurse through
					return 0;
				}
			}
		};
		var getTagIdsFromAlarmsTable = function(sourceId) {
			var baseArray = $scope.chartData[0].response;
			var selectedRecord = _.pluck(baseArray, {
				sourceId : sourceId
			});

		};
		/* $scope.$watch('optVar',function(newVal,oldVal){
		 if(newVal && newVal!==oldVal){
		 $scope.sourceId = newVal.nodeId;

		 }
		 });*/
		var precise_round = function(num, decimals) {
			var t = Math.pow(10, decimals);
			return (Math.round((num * t) + (decimals > 0 ? 1 : 0) * (sign(num) * (10 / Math.pow(100, decimals)))) / t).toFixed(decimals);
		};
		var sign = function(x) {
			if (+x === x) {// check if a number was given
				return (x === 0) ? x : (x > 0) ? 1 : -1;
			}
			return NaN;
		};
		var alarmPlotParamsSS = function() {
			var _endTimeInZone,
			    _startTimeInZone;
			if (preferredTimeZone == 'tzLocal') {
				_endTimeInZone = moment($scope.lastOccurrenceTime).toISOString();
				_startTimeInZone = moment($scope.lastOccurrenceTime).subtract('weeks', 2).toISOString();
			} else {
				_endTimeInZone = moment($scope.lastOccurrenceTime).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
				var temp = moment($scope.lastOccurrenceTime).subtract('weeks', 2);
				_startTimeInZone = moment(temp).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
			}
			var params = {
				customerId : $scope.customerId,
				enterpriseId : $scope.enterpriseId || $scope.enterpriseIdFromEvent,
				isActive : $scope.range === 'active',
				startTime : _startTimeInZone,
				endTime : _endTimeInZone,
				consolidate : $scope.consolidate
			};

			// For enterprises, don't send the nodeId
			if ($scope.$parent.nodeType && $scope.$parent.nodeType !== 'enterprise') {
				params.nodeId = $scope.nodeId;
			}

			return params;
		};
		var getWaveformSS = function(sourceId, tags) {
			var sourceID = sourceId || $scope.selected;
			var options = alarmPlotParamsSS();
			//$log.info('Loading Waveform SS getWaveform SS');
			options.type = "SmartSignalPlot";

			$scope.showSpinnerForSSPlots = true;

			$alarms.getWaveformSS(options, sourceID, tags).then(
			//success
			function(response) {
				/* if((response.data).indexOf("Error")<0){
				$scope.chartData= response.data;
				}*/
				//debugger;

				if (response.status == '200' && response.statusText == 'OK'/*(response.data).indexOf("Failure") < 0 &&   (response.data).indexOf("Invalid") < 0*/ && typeof (response.data) != 'string') {
					$scope.showErrorForWaveform = false;

					//PROCESS DATA - Grid Table
					var _gridTable = [],
					    _rules = [];
					var _ruleName,
					    _tempRuleName = [];
					_.forEach(response.data.response, function(dataNode) {
						//Get the last data point; the date for this object should conform to last event time
						var lastNode = dataNode.data[dataNode.data.length - 1];
						//var rule_actual = Math.round(lastNode.actual*100)/100;
						var rule_actual = precise_round(lastNode.actual, dataNode.tagNode.ssExtra != null ? dataNode.tagNode.ssExtra.decimalPlaces : 0);
						//Grid actual
						//console.log("lastNode.actual,rule_actual",lastNode.actual,rule_actual,dataNode.tagNode.ssExtra.decimalPlaces);
						var rule_estimate = precise_round(lastNode.estimate, dataNode.tagNode.ssExtra != null ? dataNode.tagNode.ssExtra.decimalPlaces : 0);
						//Grid Estimate
						var rule_adivsory = lastNode.advisories[0];

						//RULE Name: To plot this column, check for all the advisories present for the lastNode. Take this array and look at dataNode.advisoriesNodes
						//The advisoriesNode will provide you the type of this node. If its ss_diagnostic rule, ignore it for the grid. But if the type is "ss_rule", get the name and start making a comma separated list.

						var _lastNodeAdvisories = lastNode.advisories;
						_.forEach(_lastNodeAdvisories, function(obj) {
							var _tempNode = _.filter(dataNode.advisoriesNode, {"nodeId": obj})[0];
							if (_tempNode.nodeTypeEnum == "ss_rule") {
								_tempRuleName.push(_tempNode.ssExtra.shortName);
							}
						});

						_ruleName = _tempRuleName.toString();
						_tempRuleName.length = 0;
						var tagNode = {
							"tagName" : dataNode.tagNode.name,
							"tagDataSource" : dataNode.tagNode.ssExtra.dataSourceTagName,
							"tagDescription" : dataNode.tagNode.ssExtra.description,
							"tagRules" : dataNode.tagNode.ssExtra.rules,
							"tagUnits" : dataNode.tagNode.units,
							"ruleName" : _ruleName,
							"ruleActual" : rule_actual,
							"ruleEstimate" : rule_estimate
						};
						dataNode.grid = tagNode;
						dataNode.preferredTimeZone = preferredTimeZone;
					});
					$scope.chartDataSSWaveform = response.data.response;
					$scope.showSpinnerForSSPlots = false;
					$scope.showErrorForSSPlots = false;
					$scope.collapsed = true;
				} else {
					$scope.showSpinnerForSSPlots = false;
					$scope.showErrorForSSPlots = true;
				}

				// return response.data;
			},
			//error
			function(error) {
				$log.error(error);
			});
		};
		var _enterpriseId = ctxGlobal.getEnterpriseId();
		var _customerId = ctxGlobal.getCustomerId();
		//Create params object for alarm-plots
		var alarmPlotParams = function() {
			var _startTime,
			    _endTime;
			if (preferredTimeZone == 'tzLocal') {
				_startTime = getTimeStringForTrend($scope.timeDuration).start;
				_endTime = getTimeStringForTrend($scope.timeDuration).end;
			} else {
				_startTime = getTimeStringForTrendGMT($scope.timeDuration).start;
				_endTime = getTimeStringForTrendGMT($scope.timeDuration).end;
			}

			var params = {
				customerId : $scope.customerId,
				enterpriseId : $scope.enterpriseId || $scope.enterpriseIdFromEvent,
				isActive : $scope.range === 'active',

				/* startTime:getTimeStringForTrend($scope.timeDuration).start,
				 endTime: getTimeStringForTrend($scope.timeDuration).end,*/

				startTime : _startTime,
				endTime : _endTime,

				/* startTime:getTimeStrings($scope.timeDuration).start,
				 endTime: getTimeStrings($scope.timeDuration).end,*/
				consolidate : $scope.consolidate
			};

			// For enterprises, don't send the nodeId
			if ($scope.$parent.nodeType && $scope.$parent.nodeType !== 'enterprise') {
				params.nodeId = $scope.nodeId;
			}

			return params;
		};
		var ctrlEventOccurrences = function($scope, $modalInstance) {
			$scope.closeModal = function() {
				$modalInstance.dismiss('cancel');
			};
		};
		//Get Event occurrences for modal
		var getEventOccurrences = function(alarm) {
			var formattedList = [];
			if (alarm.dataSource == 'SmartSignal') {
				var startTime = alarm.lastOccurrenceTime;
				//formattedList.push(moment(startTime).format("YYYY-MM-DD HH:mm:ss"));
				formattedList.push(getLocalFormatCompleteDate(startTime));
			} else {
				startTime = _.chain(alarm['eventOccurences']).pluck('startTime').flatten().valueOf();

				_.forEach(startTime, function(obj) {
					//formattedList.push(moment(obj).format("YYYY-MM-DD HH:mm:ss"));
					//formattedList.push(moment(obj).format('MMMM Do YYYY, h:mm:ss a'));
					formattedList.push(getLocalFormatCompleteDate(obj));
				});
			}

			return (formattedList);
		};
		var getEventOccurrencesGMT = function(alarm) {
			var formattedList = [];
			if (alarm.dataSource == 'SmartSignal') {
				var startTime = alarm.lastOccurrenceTime;
				formattedList.push(moment(startTime).format("YYYY-MM-DD HH:mm:ss"));
			} else {
				startTime = _.chain(alarm['eventOccurences']).pluck('startTime').flatten().valueOf();
				_.forEach(startTime, function(obj) {
					formattedList.push(dateFormatter.getUTCFormatCompleteFullDate(obj));
				});
			}

			return (formattedList);
		};
		var getDDValue = function(_key) {
			switch (_key) {
			case 'normalizedSeverityLevel':
				var sev = getSeverityValue($scope.myValue[_key]);
				// filterEq_normalizedSeverityLevel.id="normalizedSeverityLevel";
				// filterEq_normalizedSeverityLevel.value=sev;
				//   filterArray.push({"id":"normalizedSeverityLevel","value":sev});
				return sev;
				break;
			case 'severityLevel':
				return ($scope.myValue[_key]);
				break;
			case 'dataSource':
				return ($scope.myValue[_key]);
				break;
			case 'density':
				return ($scope.myValue[_key]);
				break;
			case 'count':
				var count = {};
				var _range = getCountRange($scope.myValue.count);
				count.min = _range.min;
				count.max = _range.max;
				// return ($scope.myValue[_key]);
				return count;
				break;
			case 'acknowledged':
				return ($scope.myValue[_key]);
				break;
			case 'active':
				return ($scope.myValue["active"]);
				break;

			}
		};
		var findBaseObject = function(tempObject, totalFilters, filterKey, originalObject) {
			var _temp = [];
			if (tempObject.length > 0 && totalFilters.length > 1) {
				_temp = tempObject;
				tempObject = [];

			} else {
				if (totalFilters.length == 1 && totalFilters[0] == filterKey) {
					_temp = originalObject;

				}
			}
			return _temp;
		};
		var findKey = function(obj, value) {
			var key = [];
			_.each(obj, function(v, k) {
				if (v != value) {
					key.push(k);
				}
			});

			return key;
		};
		var filterChartByEquate = function(originalObject, filterCriteria, filterKey, tempObject) {
			tempObject = [];
			_.forEach(originalObject, function(obj) {
				if (obj[filterKey] == filterCriteria) {
					tempObject.push(obj);
				}
			});

			$scope.chartData[0].response = tempObject;
		};
		var filterChartByFleetSeverity = function(originalObject, filterCriteria, filterKey, tempObject) {
			var sev = getSeverityValue(filterCriteria);
			tempObject = [];
			_.forEach(originalObject, function(obj) {
				if (obj[filterKey] == sev) {
					tempObject.push(obj);
				}
			});

			$scope.chartData[0].response = tempObject;

		};

		//Initialize
		$scope.currentUser = UserSelections.getCurrentUser();
		$scope.customerId = ctxGlobal.getCustomerId();
		$scope.nodeId = ctxGlobal.getNodeId();
		$scope.toggleBtnName = 'Show Tag Grid';
		// TODO: from prefs
		$scope.consolidate = $stateParams.range || true;
		//$scope.range = 'active';
		$scope.viewType = $stateParams.viewType || 'Subgroup';
		if ($scope.currentUser && $scope.currentUser.preference && $scope.currentUser.preference.alarmChart) {
			$scope.chartType = $scope.currentUser.preference.alarmChart;
			// temp condition
			if ($scope.hideFeatures)
				$scope.chartType = 'alarm-plot';
		} else {
			$scope.chartType = 'alarm-plot';
		}
		$scope.range = ctxAlarms.getAlarmsTable().filterBy;
		// $scope.chartType = ctxAlarms.getChartSelection().chartType;

		// ====================================================
		// PRIVATE METHODS AND VARS
		/*Set Filters for Alarms and Events table*/

		$scope.freeText = {};
		$scope.pageRange = ['10', '20', '50', '100'];
		//$scope.countRange = [500, 250, 100, 50, 10];
		$scope.countRange = ['0-10', '10-50', '50-250', '250-1000', '>=1000', 'All'];
		$scope.densityRange = ['0-0.2', '0.2-0.4', '0.4-0.6', '0.6-0.8', '0.8-1.0', '0-10', '10-20', '20-40', '40-80', '>80', 'All'];
		$scope.activeRange = ['Yes', 'No', 'All'];
		$scope.dataSourceOptions = ["System 1", "SmartSignal", "All"];
		$scope.sourceSeverityOptions = ['All', 1, 2, 3, 4, 5];
		$scope.ackOptions = ['Yes', 'No', 'All'];
		$scope.fleetSeverityOptions = ['High', 'Medium', 'Low', 'All'];
		$scope.orderBy = "";
		$scope.optPoint = [];
		$scope.showResetFilter = true;
		$scope.filtered = '';
		$scope.filteredArray = [];
		$scope.myValue = {
			dataSource : 'All',
			normalizedSeverityLevel : 'All',
			severityLevel : 'All',
			count : 'All',
			density : 'All',
			acknowledged : 'All',
			active : 'All'
		};

		$scope.timeDuration = $stateParams.timeDuration || '1day';
		$scope.waveformType = $stateParams.waveformType || 'Frequency';
		$scope.optWave = $stateParams.optWave || '';
		$scope.filteredArrayDD = [];
		$scope.showFilters = false;

		if (!$scope.enterpriseId) {
			$scope.enterpriseId = ctxGlobal.getEnterpriseId() || $stateParams.enterpriseId || UserSelections.getGotoAlarmParams().enterpriseId;
		}
		getEnterpriseConnectionStatus();	
		
		
		getAlarmFields();
		// getting table data
		
		$scope.$watch("nodeSelected", function(newValue, oldValue) 
		{
			if (newValue !== oldValue) {
				$scope.nodeId = ctxGlobal.getNodeId();
				$scope.enterpriseId = ctxGlobal.getEnterpriseId();
				$scope.customerId = ctxGlobal.getCustomerId();

				getAlarms(alarmsListParams());
				getEnterpriseConnectionStatus();
				getAlarmFields();

				//$scope.chartData = {};
				//$scope.optVar = null;
				//$scope.selected = null;
				//chartJSON.length = 0;
				//if ($scope.assetType == 'System1')
				//$scope.plotType = "System 1";
				//$scope.chartType = '';
				//getting table data
				//getChartData('alarm-plot');
			
			}
				
		});

		//  $scope.pages=10;
		//  $scope.pages=$scope.currentUser.preference.alarmGridSize||10;
		if ($scope.currentUser && $scope.currentUser.preference) {
			_pg = $scope.currentUser.preference.alarmGridSize;
			_pageIndex = $scope.pageRange.indexOf(_pg);
		}
		if (_pageIndex > -1) {
			$scope.pages = $scope.pageRange[_pageIndex];
		} else {
			$scope.pages = $scope.pageRange[0];
		}

		$scope.countFilter = function(alarm) {
			if ($scope.myValue.count == 'All') {
				if (alarm['count'] === 0) {
					return '0';
				} else {
					return (alarm['count']);
				}
			} else {
				if ($scope.myValue.count == '>=1000') {

					return (alarm['count'] >= 1000);
				} else {
					var _range = getCountRange($scope.myValue.count);
					var min = _range.min;
					var max = _range.max;
					if (alarm['count'] >= min && alarm['count'] <= max) {
						return (alarm['count'] + 1);
					}
				}
			}
		};
		$scope.densityFilter = function(alarm) {
			if ($scope.myValue.density == 'All') {
				if (alarm['density'] === 0) {
					return '0.00';
				} else {
					return (alarm['density']);
				}

			} else {
				var _range = getCountRange($scope.myValue.density);
				var min = _range.min;
				var max = _range.max;
				if (alarm['density'] === null) {
					//   alarm['density']=0;
					//TODO - Handle the cases where fields are null
					return (alarm['density']);
				} else {
					if (alarm['density'] >= min && alarm['density'] < max) {
						return alarm['density'];
					}
				}
			}
		};
		$scope.dataSourceFilter = function(alarm) {
			if ($scope.myValue.dataSource == "All") {
				return (alarm['dataSource']);
			} else {
				return (alarm['dataSource'] == $scope.myValue.dataSource);
			}
		};
		$scope.sourceSeverityFilter = function(alarm) {
			if ($scope.myValue.severityLevel == "All") {
				return (alarm['severityLevel']);
			} else {
				return (alarm['severityLevel'] == $scope.myValue.severityLevel);
			}
		};
		$scope.ackFilter = function(alarm) {
			if ($scope.myValue.acknowledged == 'All') {
				return (alarm['acknowledged']);
			} else {
				return (alarm['acknowledged'] == $scope.myValue.acknowledged);
			}
		};
		$scope.activeFilter = function(alarm) {
			if ($scope.myValue.active == 'All') {
				return (alarm['eventStateEnum']);
			} else {
				return (alarm['eventStateEnum'] == $scope.myValue.active);
			}
		};
		$scope.sevFilter = function(alarm) {

			if ($scope.myValue.normalizedSeverityLevel == 'All') {
				return (alarm['normalizedSeverityLevel']);
			} else {
				var sev = getSeverityValue($scope.myValue.normalizedSeverityLevel);
				return (alarm['normalizedSeverityLevel'] == sev);
			}

		};
		//Once user updates column list through view, set the selection in context Methods (ctxAlarms).
		// This way, we can preserve user selection across pages
		$scope.setColumns = function(newVal,evt) {
			evt.stopPropagation();
			ctxAlarms.setAlarmsTableColumns(newVal);
		};

		//METHOD: Get events for alarms and events table; load the basic charts (Bar or Line) based on these events.
		$scope.order = function(predicate, reverse) {
			//console.log("Predicate: "+predicate);
			//  $scope.alarms = orderBy($scope.alarms, predicate, reverse);
			orderTable(predicate, reverse);
		};
		/**=========================================================================================
		 *  SYSTEM 1 TREND PLOT
		 * This section contains all the methods required for plotting alarm plots for System 1
		 * =========================================================================================*/
		//METHOD:[System1 Trend and Waveform]  - Get Machine, Points and Variable details
		$scope.timeByType = function(timeDuration) {
			$scope.timeDuration = timeDuration;
			switch (timeDuration) {
			case '1day':
				return '1 day';
			case '1week':
				return '1 week';
			case '1month':
				return '1 month';
			case '3months':
				return '3 months';
			case '6months':
				return '6 months';
			}
		};
		$scope.setRowSelection = function(_this) {
			if ($scope.lastSelected) {
				$scope.lastSelected.selected = '';
			}
			_this.selected = 'selected';
			$scope.lastSelected = _this;

			$("html, body").animate({
				scrollTop: 0
				}, 600);
				return false;
			};
	
		$scope.getColumn = function(_this, alarm, col) {
			var d = _this;
			var data = alarm;

		    //console.log("------alarm",_this,alarm);
			/*
			if (col == 'count') {
							if (preferredTimeZone == 'tzLocal') {
								$scope.eventList = getEventOccurrences(alarm);
			
							} else {
								$scope.eventList = getEventOccurrencesGMT(alarm);
							}
			
			
							$scope.modalEventOccurrences = $modal.open({
								template : ' <div class="modal">' + '<div class="modal-header">' + '  <button type="button" class="close" data-dismiss="modal" ng-click="closeModal()"><i class="icon-remove"></i></button>' + '<h3>Alarm Occurrences</h3>' + '</div>' + '<div class="modal-body">' + '<ul>' + '<li ng-repeat="time in eventList track by $index">{{time}}</li>' + '</ul>' + '</div>'
								 // +  '<div class="modal-footer">'
								 // +'<a class="btn" data-dismiss="modal">Close</a>'
								 // +'<a class="btn btn-primary">Save changes</a>'
								 // +'</div>'
								+ ' </div>',
								controller : ctrlEventOccurrences,
								scope : $scope
							});
							$scope.modalEventOccurrences.result.then(function() {
			
							});
						} else {
							var _sourceId = alarm.sourceId;
							var _lastOccurrenceTime = alarm.lastOccurrenceTime;
							var _enterpriseId = alarm.enterpriseId;
							var _supportingTagIds = alarm.supportingTagIds;
							var _dataSource = alarm.dataSource;
							var _point = alarm.point;
							$scope.loadSelectedRow = true;
														   // if (alarm.machineId) {
							 // var assetId = alarm.machineId;
							 // } else if (alarm.machineTrainId) {
							 // var assetId = alarm.machineTrainId;
							 // } else {
			
							var assetId = alarm.nodeParentId;
							//}
							$scope.select(_sourceId, _lastOccurrenceTime, _enterpriseId, _supportingTagIds, _dataSource, _point, assetId);
						}*/
			
				var _sourceId = alarm.sourceId;
				var _lastOccurrenceTime = alarm.lastOccurrenceTime;
				var _enterpriseId = alarm.enterpriseId;
				var _supportingTagIds = alarm.supportingTagIds;
				var _dataSource = alarm.dataSource;
				var _point = alarm.point;
				$scope.loadSelectedRow = true;
				var assetId = alarm.nodeParentId;
				refreshEventId = alarm.eventId;
				$scope.select(_sourceId, _lastOccurrenceTime, _enterpriseId, _supportingTagIds, _dataSource, _point, assetId);
		};
		//FUNCTION: Load Plots on selecting any row/event in alarms and events table
		$scope.select = function(_sourceId, _lastOccurrenceTime, _enterpriseId, _supportingTagIds, _dataSource, _point, assetId) {
			/*   $scope.selected =this.alarm.sourceId;
			 $scope.sourceId=this.alarm.sourceId;
			 $scope.lastOccurrenceTime=this.alarm.lastOccurrenceTime;
			 $scope.enterpriseIdFromEvent=this.alarm.enterpriseId;*/

			$scope.selected = _sourceId;
			$scope.sourceId = _sourceId;
			$scope.lastOccurrenceTime = _lastOccurrenceTime;
			$scope.enterpriseIdFromEvent = _enterpriseId;
			
			refreshVariableId = $scope.sourceId;
			refreshPointId = $scope.sourceId;

			//ctxAlarms.setChartType('alarm-plot');
			// var datasource=this.alarm.dataSource;
			var datasource = _dataSource;

			$scope.showSpinner = true;
			$scope.showSpinnerForWaveform = true;

			//TODO - [Check 9/7/2014] This is a fragile logic, what if the datasource is named as 'System 1' instead of 'System1'?
			//[Check] Do we have a field which differentiates between System1 and SmartSignal data? Text comparison is not so good approach
			if (datasource == "System 1") {
				getMachineForEventSource($scope.sourceId, assetId);
				//  getMachineService($scope.sourceId);
				$scope.chartType = 'alarm-plot';
				$scope.plotType = 'System 1';
			} else {
				// var tags=this.alarm.supportingTagIds;
				var tags = _supportingTagIds;
				$scope.tagId = tags;
				$scope.plotType = 'smartSignal';
				$scope.chartType = 'alarm-plot';
				getWaveformSS($scope.sourceId, tags);
			}
			// $scope.opt=this.alarm.point;
			$scope.opt = _point;
		};
		//WATCHERS
		$scope.$watch('timeDuration', function(newVal, oldVal) {
			//   alarmPlotParams();
			//   getWaveform=function(plotType,waveformType ,sourceId, waveformCriteria)
			if (oldVal !== newVal) {
				$scope.timeDuration = newVal;
				alarmPlotParams();
				getChartData('alarm-plot');
				//$scope.chartDataAlarmPlot={};
			}

		});
		//Watch filters in waveform chart (Synchronous OR Asynchronous)
		$scope.$watch('optWave', function(newVal, oldVal) {
			if (oldVal !== newVal) {
				//console.log('----------Loading Waveform - optWave watch',$scope.sourceId,newVal);
				getWaveform('alarm-plot', $scope.waveformType, $scope.sourceId, newVal);
			}
		});
		$scope.$watch('waveformType', function(newVal, oldVal) {
			//console.log("waveformType:",$scope.waveformType ,"values",newVal,oldVal);
			if (newVal !== oldVal) {
				$scope.waveformType = newVal;
				$scope.showSpinnerForWaveform = true;
				$scope.showErrorForWaveform = false;
				//console.log("waveformType:"+$scope.waveformType +"option"+$scope.opt+" Wave "+$scope.optWave);
				//console.log('----------Loading Waveform - waveformType watch',$scope.sourceId,newVal,oldVal);
				getWaveform('alarm-plot', $scope.waveformType, $scope.sourceId, $scope.optWave);
			}
		});

		/**=========================================================================================
		 * SYSTEM 1 WAVEFORM PLOT
		 * This section contains all the methods required for plotting alarm plots for System 1
		 * =========================================================================================*/
		//Process the waveform response as per filters and return the filtered response
		$scope.next = function(text) {
			if (!text || !text.modelTimeSwitch)
				return;
			var selectedNode,
			    count = 0,
			    eventTime;
			var index = _.findWhere($scope.optTime, {
				"name" : text.modelTimeSwitch.name
			});
			if (index.id < $scope.optTime.length) {
				selectedNode = index.id + 1;
			} else {
				selectedNode = index.id;
			}
			eventTime = $scope.optTime[selectedNode];
			getWaveform('alarm-plot', $scope.waveformType, $scope.sourceId, $scope.optWave, eventTime.name);
		};
		$scope.prev = function(text) {
			if (!text || !text.modelTimeSwitch)
				return;
			var selectedNode,
			    count = text.modelTimeSwitch.id - 1;
			var eventTime;
			var index = _.findWhere($scope.optTime, {
				"name" : text.modelTimeSwitch.name
			});
			if (index.id > -1) {
				selectedNode = index.id - 1;
			} else {
				selectedNode = index.id;
			}
			eventTime = $scope.optTime[selectedNode];
			getWaveform('alarm-plot', $scope.waveformType, $scope.sourceId, $scope.optWave, eventTime.name);

		};
		$scope.changeData = function(text) {
			var _optVariable = [],
			    _optWaveform = [];
			_.forEach(optPoint, function(point) {
				if (text.modelOptPoint.name == point.name) {
					$scope.optVariableWaveform.length = 0;
					$scope.optVariable.length = 0;
					_.forEach(point.children, function(child) {
						if (child.nodeTypeEnum == "s1_static_variable") {
							_optVariable.push({
								"id" : child.nodeId,
								"name" : child.name
							});
						} else {
							_optWaveform.push({
								"id" : child.nodeId,
								"name" : child.name
							});
						}
					});
					$scope.optVariable = _optVariable;
					$scope.modelOptVariable = $scope.optVariable[0];
					$scope.optVariableWaveform = _optWaveform;
					$scope.modelOptVariableWaveform = $scope.optVariableWaveform[0];
					$scope.optVariableType = $scope.optVariable[0];
					$scope.optVariableWaveformType = $scope.optVariableWaveform[0];
				}
			});
		};
		//METHOD - Load waveform on clicking any point on System 1 Trend Plot
		$scope.toggleWaveform = function(newTime) {
			/* var index= _.findWhere($scope.optTime,{"name":newTime});
			 var eventTime=$scope.optTime[index];*/
			getWaveform('alarm-plot', $scope.waveformType, $scope.sourceId, $scope.optWave, newTime);
		};
		$scope.waveformByType = function(waveformType) {
			$scope.waveformType = waveformType;
			switch (waveformType) {
			case 'Frequency':
				return 'Frequency';
			case 'Time':
				return 'Time';
			}
		};
		//DEPRECATED
		/* $scope.optWave1 = function (optWave) {
		/* switch(optPointType){
		case 'Frequency':
		return 'Frequency';
		case 'Time':
		return 'Time';
		}*/
		//find id of selected point
		/*if (optPoint.length > -1) {
		var _tempObj = _.findWhere(optPoint, {"name": optWave.name});
		$scope.sourceId = _tempObj.id;
		}

		//$scope.sourceId=optWave.id;
		$scope.opt = optWave.name;

		};*/
		//=================================================================================================

		// ================================================
		// PUBLIC METHODS AND VARS
		/**
		 * Given a range value, return a human-readable string
		 * @param  {string} range 1m, 6m, 1y, etc.
		 * @return {string}       '1 Month', etc.
		 */
		// $scope.rangeString = function (range) {
		//     ctxAlarms.setAlarmsTableFilterRange(range);
		//     switch (range) {
		//         case 'active':
		//             return 'Active';
		//         case '1m':
		//             return '1 Month';
		//         case '3m':
		//             return '3 Month';
		//         case '6m':
		//             return '6 Months';
		//         case '1y':
		//             return '1 Year';
		//     }
		// };

		$scope.selectedMonthVals = [{
			id : 'active',
			name : 'Active'
		}];
		if ($scope.hideFeatures == 'false')
			$scope.selectedMonthVals.push({
				id : '1m',
				name : '1 Month'
			}, {
				id : '3m',
				name : '3 Months'
			}, {
				id : '6m',
				name : '6 Months'
			}, {
				id : '1y',
				name : '1 Year'
			});

		$scope.changedRange = function(range) {

			ctxAlarms.setAlarmsTableFilterRange(range);
			$scope.range = range;

		};

		//$scope.chartData =  {};

		//----------------------------------------------------
		/**
		 * Given a range value, return a human-readable string
		 * @param  {string} range 1m, 6m, 1y, etc.
		 * @return {string}       '1 Month', etc.
		 */

		$scope.viewByType = function(viewType) {
			switch (viewType) {
			case 'EventType':
				return 'Event Type';
			case 'Subgroup':
				return 'Subgroup';
			}
		};
		//$scope.chartData =  {};
		// ================================================
		// INITIALIZE
		// This comes from static JSON
		// TODO: this is pretty fragile--probably ought to be a service
		// which actually checks to see which fields exist in the database -pb

		$scope.$watch('range', function(newVal, oldVal) {
			getAlarms(alarmsListParams());
			getChartData();
		});

		$scope.tempChilds = [];
		// 'enterpriseId' isn't a state property, it comes from the attributes
		// of whichever node was selected. The alarms service needs this as a query
		// parameter, so wait until it's populated to make the call to get alarms.
		$scope.$watch('enterpriseId', function(newVal, oldVal) {
			if (newVal !== oldVal) {
				//$log.info('initial enterpriseId',newVal);
				// OK, we've got an enterpriseId. Go ahead and get the alarms list
				getAlarms(alarmsListParams());
				getChartData();
			}
			/*else{
			 $scope.tempChilds=ctxGlobal.getChildNodeIds();
			 }*/

		});

		/* $scope.$watch('tempChilds',function(newVal,oldVal){
		if(oldVal!=='undefined'){
		getAlarms(alarmsListParams());
		getChartData();
		}
		});*/
		// Reload the alarms list $scope.consolidate changes.
		$scope.$watch('consolidate', function(newVal, oldVal) {
			if (oldVal !== newVal) {
				getAlarms(alarmsListParams());
				getChartData();
			}
		});
		// Reload the alarms list $scope.chartType changes.
		/*
		 $scope.$watch('chartType', function(newVal, oldVal){
		 if(oldVal !== 'undefined' && newVal){
		 ctxAlarms.setChartType(newVal);
		 //$log.info('changed chartType to',newVal);
		 if(newVal=='alarm-plot'){
		 if($scope.loadSelectedRow==true){
		 if($scope.plotType =="System 1"){
		 getMachineForEventSource($scope.sourceId);
		 $scope.chartType='alarm-plot';
		 }
		 else{
		 /*if($scope.plotType!='smartSignal'){
		 //Case: Smartsignal mapped with System 1; and the top record in alarms table belongs to smartsignal datasource
		 getTagIdsFromAlarmsTable($scope.sourceId);
		 $scope.tagId=$scope.chartData[0].response[0].supportingTagIds;
		 $scope.plotType='smartSignal';
		 $scope.chartType='alarm-plot';
		 getWaveformSS($scope.sourceId,$scope.tagId);
		 }*/
		/*}
		 }
		 else{
		 if(!$scope.chartData) $timeout(getChartData(),1000);
		 else{
		 $scope.chartData[0].response  =$scope.alarms;
		 if($scope.chartData[0] && $scope.chartData[0].response[0]){
		 $scope.plotType=$scope.chartData[0].response[0].dataSource;
		 $scope.selected=$scope.chartData[0].response[0].sourceId;
		 $scope.lastOccurrenceTime=$scope.chartData[0].response[0].lastOccurrenceTime;
		 $scope.enterpriseIdFromEvent = $scope.chartData[0].response[0].enterpriseId;
		 $scope.sourceId = $scope.chartData[0].response[0].sourceId;

		 if($scope.plotType =="System 1"){
		 if( $scope.loadSelectedRow!=true){
		 getMachineForEventSource($scope.selected);
		 $scope.chartType='alarm-plot';
		 //$scope.selected='selected';
		 }
		 }
		 else{
		 if($scope.loadSelectedRow!=true){
		 $scope.tagId=$scope.chartData[0].response[0].supportingTagIds;
		 $scope.plotType='smartSignal';
		 $scope.chartType='alarm-plot';
		 getWaveformSS($scope.sourceId,$scope.tagId);
		 }
		 }
		 //$scope.selected='selected';
		 }
		 }

		 }

		 }
		 else{
		 ctxAlarms.setChartType(newVal);
		 getChartData(newVal);
		 }
		 }
		 else{
		 ctxAlarms.setChartType(newVal);
		 getChartData(newVal);
		 }
		 });*/

		/*$scope.$watchCollection('[optVar,optVarPath]',function(newVal, oldVal){
		 if(newVal[0]!=undefined){
		 console.log('optVar,optVarPath watch');
		 $scope.optVar=newVal[0];
		 //$scope.showSpinner=true;
		 //$scope.showSpinnerForWaveform=true;
		 //console.log('----------Loading Waveform - optVar watch',$scope.sourceId,newVal,oldVal,$scope.optVarId);
		 getChartData('alarm-plot');
		 getWaveform('alarm-plot',$scope.waveformType, $scope.sourceId, $scope.optWave);
		 }
		 });*/

		$scope.$watch('viewType', function(newVal, oldVal) {
			var viewType;
			if (oldVal !== newVal) {
				viewType = newVal;
			} else {
				viewType = 0;
			}
		});

		$scope.$watch('pages', function(newVal, oldVal) {
			if (newVal !== oldVal) {
				$scope.pageSize = newVal;
				$scope.pages = newVal;

			}
		});

		$scope.updatePoints = function(selected) {
			$scope.opt = selected.opt.name;
			var _optVariable = [],
			    _optWaveform = [];

			//Get the point and its children from $scope.optPoint
			var selectedPoint = _.filter($scope.optPoint, {
				"id" : selected.opt.id
			});
			var staticVariables = _.filter(selectedPoint[0].children, {
				"nodeTypeEnum" : "s1_static_variable"
			});

			var dynamicVariables = _.filter(selectedPoint[0].children, function(child) {
				return child.nodeTypeEnum == "s1_sync_dynamic_variable" || child.nodeTypeEnum == "s1_async_dynamic_variable"; 
			});
	
			$scope.optVariable = staticVariables;
			$scope.optVariableWaveform = dynamicVariables;

			if ($scope.optVariable.length > 0) {
				$scope.optVarPath = $scope.optVariable[0].nodePath;
				$scope.optVar = $scope.optVariable[0].name;
				$scope.optVarId = $scope.optVariable[0].nodeId;
				$scope.sourceId = selected.opt.id;
			} else {
				$scope.hasData = false;
				$scope.showSpinner = false;
				$scope.hasDataforWaveform = false;
				$scope.showSpinnerForWaveform = false;
			}

			if (dynamicVariables[0] !== undefined) {
				$scope.optWave = $scope.optVariableWaveform[0].name;
				$scope.sourceId = $scope.optVariableWaveform[0].nodeId;
			} else {
				// $scope.optWave.length=0;
				$scope.optWave = "";
				$scope.hasData = false;
				$scope.showSpinner = false;
				$scope.hasDataforWaveform = false;
				$scope.showSpinnerForWaveform = false;
			}
			
			
			
			getChartData('alarm-plot');
			getWaveform('alarm-plot', $scope.waveformType, $scope.sourceId, $scope.optWave);

			return (selected.opt.name);
		};

		$scope.updateTrendSeries = function(text,optVar) {
			if (!text || !text.optVar)
				return;
			var selectedNode;
			$scope.optVar = text.optVar.name;
			$scope.optVarId = text.optVar.nodeId;
			selectedNode = text.optVar.nodeId;
			//$scope.sourceId=text.optVar.nodeId;
			//console.log('----------Loading Waveform - updateTrendSeries call',$scope.sourceId,text,selectedNode);
			getChartData('alarm-plot', selectedNode);
			//getWaveform('alarm-plot', $scope.waveformType, selectedNode);
		};

		$scope.updateTrendPerTime = function(text) {
		};

		$scope.updateWaveform = function(text) {
			if (!text || !text.optWave)
				return;
			var selectedNode;
			$scope.optWave = text.optWave.name;
			var index = _.findIndex($scope.optVariableWaveform, {
				"nodeId" : text.optWave.nodeId
			});
			if (index > -1) {
				selectedNode = text.optWave.nodeId;
				$scope.sourceId = text.optWave.nodeId;
			} else {
				//TODO - No Waveform Available for this Point
			}
			//getWaveform('alarm-plot',selectedNode);
			//console.log('----------Loading Waveform - updateWaveform call',$scope.sourceId,text,selectedNode);

			getWaveform('alarm-plot', $scope.waveformType, selectedNode, $scope.optWave);
		};

		//Export to CSV
		//  $scope.consolidated=false;
		$scope.exportToCSV = function(param) {
			var options = alarmsListParams();
			$scope.exportToCSVData = $alarms.getAlarmsForExport(options);
			//window.open($alarms.getAlarmsForExport(options));
			//window.open('/customer/'+escape($scope.customerId)+'/mapping/download?primarySystem=System1'+ "&ts=" + dt.getTime());

			//TODO - Move this call to the service layer.
			var dt = new Date();
			// $rootScope.nodeId=ctxGlobal.getNodeId();

			var queryParams = '/export?onlyActive=' + options.isActive + '&format=csv';
			if ($rootScope.nodeId && $rootScope.nodeId !== _customerId && $rootScope.nodeId !== _enterpriseId) {
				queryParams += '&nodeId=' + $rootScope.nodeId;
			}
			queryParams += '&startTime=' + options.startTime;
			queryParams += '&endTime=' + options.endTime;
			queryParams += '&consolidated=' + param;
			queryParams += '&ts=' + dt.getTime();

			var restUrl = '/customer/' + escape(_customerId);
			if (_enterpriseId) {
				restUrl += '/enterprise/' + escape(_enterpriseId);
			} else {
				restUrl += '/enterprise/null';
			}

			window.open(restUrl + queryParams);

		};
		$scope.toggleFilter = function() {
			$scope.showFilters = !$scope.showFilters;
		};
		$scope.toggleGrid = function() {
			$scope.showGrid = !$scope.showGrid;
			if ($scope.showGrid) {
				$scope.toggleBtnName = 'Hide Tag Grid';
			} else {
				$scope.toggleBtnName = 'Show Tag Grid';
			}
		};

		
		/*
		if ($scope.currentUser && $scope.currentUser.preference) {
							var _predicate = $scope.currentUser.preference.alarmsGridSort;
							var _order = $scope.currentUser.preference.alarmsGridSortOrder;
							orderTable(_predicate, _order);
						}*/
		
		

		$scope.updateDashStatus = function(){

			var params = alarmsListParams();

			if (params.customerId) {
	            var isEnterprise = (params.enterpriseId) ? true : false;
	            var isNode = (params.nodeId) ? true : false;
	        }

			 //do not call the update status service got GE level as the service will fail
		        if(isEnterprise || isNode) {

		        $alarms.updateStatus(params, isEnterprise, isNode).then(function(response) {

	            $scope.selectedNodeName = response.name;
	            $scope.$parent.nodeSeverity = response.highestNormalizedSevLevel;
	            $scope.$parent.nodeType = response.type;
	            $scope.$parent.nodeNoDatapoints = response.imPointsNoData + response.ipPointsNoData;
				
			   //Update Bread crumb and selected Node
			   	$scope.$emit('update-selected-node', {
						node : response
					});     

		        }, function(error) {
	                        console.log("Failure- Services cannot be accessed!");
	                        $scope.showTableSpinner = false;
				})
	        }
           
		}

		$scope.updateDashStatus();
		


		$scope.mnRefresh = function() {
			console.log("--------------Alarm Manual Refresh---------------");
			
			$scope.updateDashStatus();
	};
		﻿
		//AUTO REFRESH FUNCTIONALITY
         
		if ($rootScope.currentUser.preference.autoRefresh == 'on') {
			$scope.refreshInterval = $rootScope.currentUser.preference.refreshInterval;
			$scope.autoRefresh = $rootScope.currentUser.preference.autoRefresh;
		} else {
			$scope.refreshInterval = undefined;
			$scope.autoRefresh = "off";
		}
		if ($scope.refreshInterval !== undefined) {
			setRefresh = $interval($scope.mnRefresh, $scope.refreshInterval * 60000);
		}

		// $scope.myValue ={dataSource:'All',normalizedSeverityLevel:'All',severityLevel:'All', count: 'All', density: 'All',acknowledged:'All' ,active:'All'};
		$scope.resetFilters = function() {
			//$scope.chartData[0].response=$scope.alarms;
			$scope.myValue = {
				dataSource : 'All',
				normalizedSeverityLevel : 'All',
				severityLevel : 'All',
				count : 'All',
				density : 'All',
				acknowledged : 'All',
				active : 'All'
			};
			$scope.freeText = {};
		};
		$scope.$watchCollection('myValue', function(newVal) {
			// var filterObject=newVal;
			//originalChartData[0].response= $scope.filteredArray || $scope.alarms;

			if (originalChartData[0] != undefined) {
				var originalObject = [];

				//check if freetext filters are applied or not
				var keyColFreeText = _.keys($scope.freeText);
				if (keyColFreeText.length > 0) {
					originalChartData[0].response = angular.copy($scope.filteredArray);

				} else {
					var keyCollDD = _.keys($scope.myValue);
					if (keyCollDD && $scope.alarms) {
						originalChartData[0].response = angular.copy($scope.alarms);
					}
				}

				//  originalObject=originalChartData[0].response;
				var originalData = [];
				if (originalChartData[0]) {
					originalObject = originalChartData[0].response;
				}

				if (($scope.myValue.dataSource == 'All' || $scope.myValue.dataSource == undefined ) && ($scope.myValue.normalizedSeverityLevel == 'All' || $scope.myValue.normalizedSeverityLevel == undefined) && ($scope.myValue.count == 'All' || $scope.myValue.count == undefined) && ($scope.myValue.density == 'All' || $scope.myValue.density == undefined) && ($scope.myValue.acknowledged == 'All' || $scope.myValue.acknowledged == undefined) && ($scope.myValue.active == 'All' || $scope.myValue.active == undefined) && ($scope.severityLevel == 'All' || $scope.severityLevel == undefined))
				//Case when the column is not visible in UI i.e. not selected to appear in Alarms and Events table
				{
					$scope.chartData[0].response = originalObject;
					//TODO - perform check - do we need to set the filterThis field to true here for all the records?
					_.forEach($scope.chartData[0].response, function(obj) {
						obj.filterThis = true;
					});
					$scope.showResetFilter = true;
					$scope.filtered = '';
				} else {
					var keyColl = _.keys($scope.myValue);
					tempObject = [];

					_.forEach(chartJSON[0].response, function(obj) {
						if (obj.filterThis == true) {
							originalData.push(obj);
						}
					});

					if (originalData.length < 1) {
						originalData = chartJSON[0].response;
					}

					for (var l = 0; l < keyColl.length; l++) {
						var _key = keyColl[l];
						//   var val = $scope.myValue[_key];
						$scope.showResetFilter = true;
						$scope.filtered = 'active';
						var val = getDDValue(_key);

						if (val != 'All' && val != undefined) {
							if (_key != 'active' && _key != 'count' && _key != 'density') {
								_.forEach(originalData, function(obj) {
									if (obj[_key] == val && obj.filterThis == true) {
										obj.filterThis = true;
									} else {
										obj.filterThis = false;
									}
								});
								$scope.filteredArrayDD = originalData;
								$scope.chartData[0].response = originalData;
							} else {
								if (_key == 'count' || _key == 'density') {
									if (val.max != undefined) {
										_.forEach(originalData, function(obj) {
											if (obj[_key] <= val.max && obj["count"] >= val.min && obj.filterThis == true) {
												obj.filterThis = true;
											} else {
												obj.filterThis = false;
											}
										});
									} else {
										if (val.min != undefined) {
											_.forEach(originalData, function(obj) {
												if (obj[_key] >= val.min && obj.filterThis == true) {
													obj.filterThis = true;
												} else {
													obj.filterThis = false;
												}
											});
										}
									}
								} else {
									_.forEach(originalData, function(obj) {
										if (val != undefined) {
											if (obj["eventStateEnum"] == val && obj.filterThis == true) {
												obj.filterThis = true;
											} else {
												obj.filterThis = false;
											}
										}
									});
									$scope.filteredArrayDD = originalData;
									$scope.chartData[0].response = originalData;
								}
							}

						}
					}
				}
			}

		});
		$scope.$watchCollection('freeText', function(newVal) {
			var originalData = [];
			// var searchText=this.last;

			if (chartJSON.length > 0) {
				if ($scope.filteredArrayDD.length > 0) {
					chartJSON[0].response = angular.copy($scope.filteredArrayDD);
				} else {
					if ($scope.alarms) {
						chartJSON[0].response = angular.copy($scope.alarms);
					}
				}
				var keyColl = _.keys($scope.freeText);
				tempObject = [];

				chartJSON[0].response = angular.copy($scope.alarms);
				originalData = chartJSON[0].response;
				for (var l = 0; l < keyColl.length; l++) {
					var _key = keyColl[l];
					var val = $scope.freeText[_key];
					//console.log("Evaluating: "+_key);
					if (_key != 'severityLevel') {
						_.forEach(originalData, function(obj) {
							if (obj != null) {
								if ((obj[_key].toLowerCase()).indexOf(val.toLowerCase()) < 0 && obj.filterThis == true) {
									obj.filterThis = false;
									//console.log("Setting: "+obj);
								}
							} else {
								//$log.info("obj has null values: "+obj);
							}
						});
					}
				}
				$scope.filteredArray = originalData;
				$scope.chartData[0].response = originalData;
			}

		});
		$scope.downloadTagGrid = function() {
			var table = document.getElementById('tblTagGrid');
			var html = table.outerHTML;
			// window.open('data:application/vnd.ms-excel,' + encodeURIComponent(html));

			if (ctxGlobal.getBrowser() > 0) {
				//IE Browser
				if (navigator.msSaveBlob) {
					return navigator.msSaveBlob(new Blob([html], {
						type : "application//vnd.ms-excel"
					}), "SmartSignalTagGrid.xls");
				}
			} else {
				window.open('data:application/vnd.ms-excel,' + encodeURIComponent(html));
			}

		};
		$scope.$on('$destroy', function() {
			$timeout.cancel($scope.refreshFunction);
			$scope.refreshFunction = undefined;
			$timeout.cancel($scope.mnRefresh);
			$scope.mnRefresh = undefined;
			$interval.cancel(setRefresh);
			refreshPointId = null;
			refreshVariableId = null;
			refreshEventId = null;
		});
	}]);
	 
});
