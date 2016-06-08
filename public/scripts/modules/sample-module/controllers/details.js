/**
 * Renders all the widgets on the tab and triggers the datasources that are used by the widgets.
 * Customize your widgets by:
 *  - Overriding or extending widget API methods
 *  - Changing widget settings or options
 */
'use strict';

define(['angular', 'controllers-module', 'vruntime'], function(angular, controllers) {

	// Controller definition
	controllers.controller('DetailCtrl', ['$log', '$scope', '$state', '$stateParams', '$details', '$users', 'UserSelections', 'DropdownMenuList', '$timeout', '$interval', 'ctxGlobal', '$rootScope', '$filter',
	function($log, $scope, $state, $stateParams, $details, $users, UserSelections, DropdownMenuList, $timeout, $interval, ctxGlobal, $rootScope, $filter) {
		var setRefresh;
		var detailListParams = function() {
			var params = {
				customerId : $scope.customerId,
				enterpriseId : $scope.enterpriseId || ctxGlobal.getEnterpriseId()
			};
			// For enterprises, don't send the nodeId
			if (($scope.nodeType) && $scope.nodeType.toLowerCase() !== 'enterprise') {
				params.nodeId = $scope.nodeId || ctxGlobal.getNodeId();
			}
			return params;
		};
		var removeSelectClass = function(data) {
			var current;
			for (var key in data) {
				current = data[key];
				if ( typeof (current) === 'object') {
					// console.log('current',current, nodeId);

					if (current) {

						current.selected = undefined;
					}
					removeSelectClass(current);

				}
			}
		};

		$scope.autoRefresh = '';
		$scope.refreshInterval = '';
		$scope.showTableSpinner = false;
		$scope.statusMessage = undefined;
		$scope.currentUser = UserSelections.getCurrentUser();
		$scope.sortTypeName = 'Name';
		$scope.showResetSort = false;
		$scope.defaultSortValue = '';
		$scope.assetsView = true;
		$scope.resetToHierarchy = true;
		$scope.tmpGridSort = UserSelections.getGridSort();
		$scope.overviewGridSort = $scope.tmpGridSort.overviewGridSort || 'severity';
		$scope.overviewGridSortOrder = $scope.tmpGridSort.overviewGridSortOrder || 'desc';
		//$scope.overviewTypeIcon = UserSelections.getDashTab();
		$scope.sortType = UserSelections.getSortType();
		$scope.widgetOptions = !$scope.widgetOptions ? (!UserSelections.getWidgetOptions() ? $rootScope.currentUser.preference.index : UserSelections.getWidgetOptions()) : $scope.widgetOptions;
		if ($rootScope.currentUser.preference === null) {
			console.info('current user doesnt have default preference, getting default preference from service');
			//debugger;
			$rootScope.currentUser.preference = $users.getDefaultUserPreference();
		}else{
			$rootScope.currentUser.preference = $scope.currentUser.preference;
		}

		$scope.getSortType = function() {

			$scope.sortType = UserSelections.getSortType();
			if (!$scope.ddmenuList) {
				$scope.ddmenuList = DropdownMenuList.getddmenuList();
			}
			for (var i = 0; i < $scope.ddmenuList.length; i++) {
				if ($scope.ddmenuList[i].val == $scope.sortType) {
					$scope.sortTypeName = $scope.ddmenuList[i].name;
				}
			}
		};

		$scope.findAssetType = function(assetTypeVal) {
			if (assetTypeVal == 'System1')
				return 's1Enabled';
			else
				return 'ssEnabled';
		};

		$scope.showTrends = function(item, b, type, min, max) {
			$scope.options = {
				customerId : item.params.customerId,
				enterpriseId : item.enterpriseId,
				nodeId : item.nodeId || null,
				type : type
			};
			//console.log("show trends options",$scope.options)
			item.selectedTypeName = item.selectedTypeName == type ? item.selectedTypeName = '' : item.selectedTypeName = type;
			item.itemSelected = item.selectedTypeName != type;
			item.showingTrend = !item.showingTrend;
			$details.getTrendData($scope.options).then(function(response) {
				//debugger;
				item.data = response.data;
				item.categories = response.dates;
				//$scope.categories = ["2014-08-19","2014-08-20","2014-08-21","2014-08-22","2014-08-23","2014-08-24","2014-08-25","2014-08-26","2014-08-27","2014-08-28","2014-08-29","2014-08-30","2014-08-31","2014-09-01","2014-09-02","2014-09-03","2014-09-04","2014-09-05","2014-09-06","2014-09-07","2014-09-08","2014-09-09","2014-09-10","2014-09-11","2014-09-12","2014-09-13","2014-09-14","2014-09-15","2014-09-16","2014-09-17","2014-09-18"];
				//$scope.data = [26.7351439096053,23.95974269981302,15.234161231823713,33.721101796304836,31.159604002263595,3.843735937665571,38.15013089814554,40.354048706120146,25.51006925170696,16.956254532536207,1.2058767233408818,29.637931318206263,15.176529865673881,17.596231841840755,44.37036620696901,39.84526596971743,10.334548939070354,34.22351119274612,10.010138812459612,24.07765821859226,46.455952551978704,14.814525207199575,25.149095058219185,6.974815315277222,23.18199090435149,8.212359719363644,8.768769092106826,24.31200758153257,40.942818706507964,39.43171600446971,18.90891241399552];
				item.chartConfig = {
					options : {
						chart : {
							type : 'areaspline',
							zoomType : 'x',
							backgroundColor : '#FFF',
							borderColor : '#575757',
							borderWidth : 2
						}
					},
					credits : {
						enabled : false
					},
					legend : {
						enabled : false
					},
					exporting : {
						enabled : false
					},
					plotOptions : {
						areaspline : {
							fillOpacity : 0.5
						}
					},
					yAxis : {
						gridLineWidth : 1,
						minorGridLineWidth : 0,
						title : {
							text : null
						},
						max : 100,
						plotLines : [{
							value : min,
							color : '#fd9727',
							width : 1
						}, {
							value : max,
							color : '#e2171a',
							width : 1
						}]
					},
					xAxis : {
						categories : item.categories,
						labels : {
							enabled : false // set to true to see the dates on the x
						},
						title : {
							text : null
						}
					},
					series : [{
						showInLegend : false,
						name : item.name,
						data : item.data,
						color : '#3693F8'
					}],
					title : {
						text : null
					},
					loading : false,
					size : {
						height : "200"
						//width: "1000"
					}
				};
			}, function(error) {
				console.log("Failure- Trend Data Not found!");
			});
		};

		$scope.setSortType = function(type) {
			$scope.sortTypeName = type.name;
			$scope.sortType = type.val;
			//console.log(';;;;;;;---------$scope.sortType',$scope.sortType)
			UserSelections.setSortType($scope.sortType);
		};

		$scope.findSortType = function() {

			if ($scope.sortType == 'name')
				return $scope.sortType;
			else
				return '-' + $scope.sortType;
		};

		$scope.keysNoSort = function(obj) {
			if (!obj) {
				return [];
			}
			return Object.keys(obj);
		};

		$scope.resetAlarms = function() {
			$scope.selectedAlarmValues = {};
			$scope.selectedAlarmsOptions = {};

			UserSelections.setAlarmValues($scope.selectedAlarmValues);
			UserSelections.setGotoAlarmParams($scope.selectedAlarmsOptions);

			ctxGlobal.setCustomerId($scope.customerId);
			ctxGlobal.setEnterpriseId($scope.enterpriseId);
			ctxGlobal.setNodeId($scope.nodeId);
		};

		$scope.getSourceIcon = function(source) {
			switch (source) {
			case 'System1':
				return 'system1Icon';
			case 'SmartSignal':
				return 'smartSignalIcon';
			default:
				return '';
			}
		};

		$scope.getNodeTypeIcon = function(type) {
			switch(type) {
			case 'machine':
				return 'icon-gear';
			case 'machine_train':
				return 'icon-gears';
			case 'group_folder':
				return 'icon-folder-open';
			default:
				return 'icon-map-marker';
			}
		};

		//Call service and fetch details
		$scope.select = function(text) {
			$scope.showTableSpinner = true;
			$scope.statusMessage = undefined;
			var params = detailListParams();
			var nodeObj;

			if (params.customerId) {
				var isEnterprise = (params.enterpriseId) ? true : false;
				var isNode = (params.nodeId) ? true : false;

				$details.getNodeStatus(params, isEnterprise, isNode, text).then(function(response) {console.log(response);
					if (response.length && (isNode || isEnterprise)) {
						if (response[0] && response[0].communicationStatus == "RED") {
							$scope.statusMessage = response[0].communicationStatusMessage;
						}
					}

					/*See previous versions to see what machine and machine train
					 appends speed to tooltip (communication status) */
					var formattedResponse = [];
					//var childNodeIds = [];
					var getColor = function(a, vi, vt1, vt2) {
						//console.log(a,vi,vt1,vt2)
						var vColor = "darkGrey";
						if (a == 'tpperformance') {
							if (vi >= 0) {
								if (vi >= vt2) {
									vColor = '#46ad00';
									//console.log(vColor,'green')
									return vColor;
								} else if (vi > vt1 && vi < vt2) {
									vColor = '#fd9727';
									//console.log(vColor,'yellow')
									return vColor;
								} else if (vi <= vt1) {
									vColor = '#e2171a';
									//console.log(vColor,'red')
									return vColor;
								}
							} else {
								return vColor = "darkGrey";
							}
						} else {
							if (vi >= 0) {
								if (vi >= vt2) {
									vColor = '#e2171a';
									//console.log(vColor,'red')
									return vColor;
								} else if (vi > vt1 && vi < vt2) {
									vColor = '#fd9727';
									//console.log(vColor,'yellow')
									return vColor;
								} else if (vi <= vt1) {
									vColor = '#46ad00';
									//console.log(vColor,'green')
									return vColor;
								}
							} else {
								return vColor = "darkGrey";
							}
						}
						if (vi >= 0) {
							if (vi >= vt2) {
								vColor = '#e2171a';
								//console.log(vColor,'red')
								return vColor;
							} else if (vi > vt1 && vi < vt2) {
								vColor = '#fd9727';
								//console.log(vColor,'yellow')
								return vColor;
							} else if (vi <= vt1) {
								vColor = '#46ad00';
								//console.log(vColor,'green')
								return vColor;
							}
						} else {
							return vColor = "darkGrey";
						}

					};
					var filterGrpFolder = function(type) {
						if (type && !text) {
							return type == 'group_folder';
						} else
							return false;
					};
					var setSourceType = function(enumStr, s1, ss, ty) {
						if (enumStr && enumStr == 'System1' || 'SmartSignal') {
							return enumStr
						} else {
							if (s1 == 'true' && ss == 'true')
								return 'Mapped';
							else if (s1 == 'false' && ss == 'true')
								return 'SmartSignal';
							else if (s1 == 'true' && ss == 'false') {
								return 'System1';
							}
						}

					};
					var length = 0;
					/*if(response.nodeTypeEnum == 'machine') {
					 $scope.showTableSpinner = false;
					 return;
					 }*/
					if (Array.isArray(response))
						length = response.length;
					/* To be used with nested structure

					 else {
					 if(response.childNodeHealth != undefined) response = response.childNodeHealth;
					 length = response.length;
					 if(!length || length == 0){
					 $scope.showTableSpinner = false;
					 return;
					 }
					 }*/

					/* To get the dynamic column bindings working. Removed for now
					 $scope.header = [];

					 for(var key in response[0]){
					 if(response[0][key] != null) $scope.header[key] ='true';
					 else $scope.header[key] = 'false';
					 } */

					for (var i = 0; i < length; i++) {
						/* Goofy Logic - to read from which row # based on fleet / enterprise / node level */

						if ((length == 2) && isNode) {// This condition arrives for the last node in the heirarchy
							$scope.overviewIndex = [{}];
							$scope.showTableSpinner = false;
							return;
						} else if (i < 3 && (!nodeObj)) {
							if (!isNode && !isEnterprise)
								i = 0;
							//This signifies if fleet level is selected
							else if (isEnterprise && !isNode)
								i = 1;
							//This signifies if enterprise is selected
							else if (isNode)
								i = 2;
							//This signifies if node is selected
						}

						// end of goofy logic

						nodeObj = (!response[i]) ? response : response[i];

						formattedResponse.push([{
							"params" : params,
							"source" : setSourceType(response[i].sourceSystemEnum, response[i].s1IndexEnabled, response[i].ssIndexEnabled, response[i].nodeType),
							"id" : response[i].nodeId,
							"enterpriseId" : response[i].enterpriseId,
							"path" : response[i].path,
							"name_path" : response[i].nodePathName,
							"name" : response[i].nodeName,
							"status" : response[i].runningState,
							"assetSpeed" : response[i].assetSpeed,
							"index" : "System 1 Machine Protection",
							"system1AP" : response[i].apIndex,
							"apHighAlarms" : response[i].apHighAlarmCnt,
							"apMedAlarms" : response[i].apMedAlarmCnt,
							"apLowAlarms" : response[i].apLowAlarmCnt,
							"apTotal" : response[i].apHighAlarmCnt + response[i].apMedAlarmCnt + response[i].apLowAlarmCnt,
							"apt1" : response[i].apThreshMed,
							"apt2" : response[i].apThreshHigh,
							'apColor' : getColor('apperformance', response[i].apIndex, response[i].apThreshMed, response[i].apThreshHigh),
							"system1AM" : response[i].amIndex,
							"amHighAlarms" : response[i].amHighAlarmCnt,
							"amMedAlarms" : response[i].amMedAlarmCnt,
							"amLowAlarms" : response[i].amLowAlarmCnt,
							"amTotal" : response[i].amHighAlarmCnt + response[i].amMedAlarmCnt + response[i].amLowAlarmCnt,
							"amt1" : response[i].amThreshMed,
							"amt2" : response[i].amThreshHigh,
							"amColor" : getColor('ammonitoring', response[i].amIndex, response[i].amThreshMed, response[i].amThreshHigh),
							"system1IP" : response[i].ipIndex,
							"ipHighAlarms" : response[i].ipHighAlarmCnt,
							"ipMedAlarms" : response[i].ipMedAlarmCnt,
							"ipLowAlarms" : response[i].ipLowAlarmCnt,
							"ipTotal" : response[i].ipHighAlarmCnt + response[i].ipMedAlarmCnt + response[i].ipLowAlarmCnt,
							"ipt1" : response[i].ipThreshMed,
							"ipt2" : response[i].ipThreshHigh,
							"ipColor" : getColor('ipperformance', response[i].ipIndex, response[i].ipThreshMed, response[i].ipThreshHigh),
							"system1IM" : response[i].imIndex,
							"imHighAlarms" : response[i].imHighAlarmCnt,
							"imMedAlarms" : response[i].imMedAlarmCnt,
							"imLowAlarms" : response[i].imLowAlarmCnt,
							"imTotal" : response[i].imHighAlarmCnt + response[i].imMedAlarmCnt + response[i].imLowAlarmCnt,
							"imt1" : response[i].imThreshMed,
							"imt2" : response[i].imThreshHigh,
							'imColor' : getColor('immonitoring', response[i].imIndex, response[i].imThreshMed, response[i].imThreshHigh),
							"system1IC" : response[i].icIndex,
							"icHighAlarms" : response[i].ipHighAlarmCnt + response[i].imHighAlarmCnt,
							"icMedAlarms" : response[i].ipMedAlarmCnt + response[i].imMedAlarmCnt,
							"icLowAlarms" : response[i].ipLowAlarmCnt + response[i].imLowAlarmCnt,
							"icTotal" : response[i].ipHighAlarmCnt + response[i].imHighAlarmCnt + response[i].ipMedAlarmCnt + response[i].imMedAlarmCnt + response[i].ipLowAlarmCnt + response[i].imLowAlarmCnt,
							"ict1" : response[i].icThreshMed,
							"ict2" : response[i].icThreshHigh,
							'icColor' : getColor('iccombined', response[i].icIndex, response[i].icThreshMed, response[i].icThreshHigh),
							'ipNoData' : response[i].ipNoDataSev2 + response[i].imNoDataSev2,
							"performance" : response[i].tpIndex,
							"tpIndex" : response[i].tpIndex,
							"tpEnable" : response[i].tpEnabled,
							"tpHighAlarms" : 'NA',
							"tpMedAlarms" : 'NA',
							"tpLowAlarms" : 'NA',
							"tpTotal" : 'NA',
							"tpt1" : response[i].tpThreshMed,
							"tpt2" : response[i].tpThreshHigh,
							'tpColor' : getColor('tpperformance', response[i].tpIndex, response[i].tpThreshMed, response[i].tpThreshHigh),
							"ssIndex" : response[i].ssIndex,
							"smartsignal" : response[i].ssIndex,
							"ssHighAlarms" : response[i].ssHighAlarmCnt,
							"ssMedAlarms" : response[i].ssMedAlarmCnt,
							"ssLowAlarms" : response[i].ssLowAlarmCnt,
							"ssTotal" : response[i].ssHighAlarmCnt + response[i].ssMedAlarmCnt + response[i].ssLowAlarmCnt,
							"sst1" : response[i].ssThreshMed,
							"sst2" : response[i].ssThreshHigh,
							'ssColor' : getColor('ss', response[i].ssIndex, response[i].ssThreshMed, response[i].ssThreshHigh),
							"system1AC" : response[i].acIndex,
							"acHighAlarms" : response[i].apHighAlarmCnt + response[i].amHighAlarmCnt,
							"acMedAlarms" : response[i].apMedAlarmCnt + response[i].amMedAlarmCnt,
							"acLowAlarms" : response[i].apLowAlarmCnt + response[i].amLowAlarmCnt,
							"acTotal" : response[i].apHighAlarmCnt + response[i].amHighAlarmCnt + response[i].apMedAlarmCnt + response[i].amMedAlarmCnt + response[i].apLowAlarmCnt + response[i].amLowAlarmCnt,
							"act1" : response[i].acThreshMed,
							"act2" : response[i].acThreshHigh,
							'acColor' : getColor('accombined', response[i].acIndex, response[i].acThreshMed, response[i].acThreshHigh),
							"severity" : response[i].highestNormalizedSevLevel,
							"total" : response[i].normalizedSev1AlarmCount + response[i].normalizedSev2AlarmCount + response[i].normalizedSev3AlarmCount,
							"highTotal" : response[i].normalizedSev3AlarmCount,
							"medTotal" : response[i].normalizedSev2AlarmCount,
							"lowTotal" : response[i].normalizedSev1AlarmCount,
							"communicationStatus" : response[i].communicationStatus,
							"communicationMessage" : response[i].communicationStatusMessage,
							"runStatus" : response[i].runningState,
							"nodeType" : (!response[i].nodeType ? response[i].type : (response[i].nodeType).toString().trim()),
							"selectedTypeName" : '',
							'ssIndexEnabled' : response[i].ssIndexEnabled,
							's1IndexEnabled' : response[i].s1IndexEnabled
						}]);

					}
					var _flatResponse = _.chain(formattedResponse).flatten().value();

					$scope.overviewIndex = _flatResponse;

					$scope.showTableSpinner = false;

				}, function(error) {
					console.log("Failure- Services cannot be accessed!");
					$scope.showTableSpinner = false;
				})
			} else {
				$scope.showTableSpinner = false;
			}
		};

		$scope.getBackgroundClass = function(ind, t1, t2, type) {
			if (type == "tp") {
				if (ind >= 0) {
					if (ind >= t2) {
						return 'background_success ';
					} else if (ind > t1 && ind < t2) {
						return 'background_warning';
					} else if (ind <= t1) {
						return 'background_danger';
					}
				} else {
					return 'background_na';
				}
			} else {
				if (ind >= 0) {
					if (ind >= t2) {
						return 'background_danger';
					} else if (ind > t1 && ind < t2) {
						return 'background_warning';
					} else if (ind <= t1) {
						return 'background_success';
					}
				} else {
					return 'background_na';
				}
			}
			if (ind >= 0) {
				if (ind >= t2) {
					return 'background_danger';
				} else if (ind > t1 && ind < t2) {
					return 'background_warning';
				} else if (ind <= t1) {
					return 'background_success';
				}
			} else {
				return 'background_na';
			}
		};
		$scope.getItemSeverity = function(severity) {
			console.log(severity);
		}
		$scope.restoreHierarchySort = function() {
			$timeout(function() {
				var el = document.getElementsByClassName('restore-hierarchy');
				angular.element(el).triggerHandler('click');
			}, 10);

		};

		$scope.toggleAssetView = function() {
			$scope.assetsView = !$scope.assetsView;
			$scope.select($scope.assetsView);
		};

		$scope.orderedAssets = function(asset, sortType, assetType) {
			//$scope.overviewIndex = _.sortBy($scope.overviewIndex, function(o) { return o.nodePathName; }).reverse();
			var tmparr = _.sortBy(asset, function(o) {
				return o.source == sortType;
			});
			return tmparr;
		};

		$scope.selectGridOrGauge = function(type) {
			$scope.overviewTypeIcon = type;
			$scope.assetsView = true;
			$scope.select('true');
			UserSelections.setDashTab(type);
		};

		$scope.refreshFunction = function() {

			var params = detailListParams();
			$scope.select('true');

			if (params.customerId) {
				var isEnterprise = (params.enterpriseId) ? true : false;
				var isNode = (params.nodeId) ? true : false;
			}
			//do not call the update status service got GE level as the service will fail
			if (isEnterprise || isNode) {

				$details.updateStatus(params, isEnterprise, isNode).then(function(response) {

					$scope.selectedNodeName = response.name;
					$scope.$parent.nodeSeverity = response.highestNormalizedSevLevel;
					$scope.$parent.nodeType = response.type;
					$scope.$parent.nodeNoDatapoints = response.imPointsNoData + response.ipPointsNoData;

					//Update Bread crumb and selected node
					$scope.$emit('update-selected-node', {
						node : response
					});

				}, function(error) {
					console.log("Failure- Services cannot be accessed!");
					$scope.showTableSpinner = false;
				})
			}

		};

		$scope.refreshFunction();

		//AUTO REFRESH FUNCTIONALITY
		if ($rootScope.currentUser.preference.autoRefresh == 'on') {
			$scope.refreshInterval = $rootScope.currentUser.preference.refreshInterval;
			$scope.autoRefresh = $rootScope.currentUser.preference.autoRefresh;
		} else {
			$scope.refreshInterval = undefined;
			$scope.autoRefresh = "off";
		}

		if ($scope.refreshInterval !== undefined) {
			setRefresh = $interval($scope.refreshFunction, $scope.refreshInterval * 60000);
		}

		if (!$scope.overviewTypeIcon || $scope.overviewTypeIcon == '') {
			$scope.overviewTypeIcon = (UserSelections.getDashTab() != ('table' || 'dashboard') ? 'table' : UserSelections.getDashTab());
		}
		//Dead code Jim
		$scope.getGridSortClass = function(val) {
			if (val == $scope.overviewGridSort && $scope.resetToHierarchy == true) {
				if ($rootScope.currentUser && $rootScope.currentUser.preference && $rootScope.currentUser.preference.overviewGridSort) {
					$scope.overviewGridSort = $rootScope.currentUser.preference.overviewGridSort;
				}
				if($scope.overviewGridSortOrder == "desc") {
					return "sorting_desc";	
				}else{
					return "sorting_asc";
				}
				
			} else
				return "";
		};
		
		$scope.getGridSort = function(val) {
			if (val == $scope.overviewGridSort && $scope.resetToHierarchy == true) {
				if ($rootScope.currentUser && $rootScope.currentUser.preference && $rootScope.currentUser.preference.overviewGridSort) {
					$scope.overviewGridSort = $rootScope.currentUser.preference.overviewGridSort;
				}
				return $scope.overviewGridSortOrder;
			} else
				return "";
		};

		$scope.getItemSource = function(val) {
			return val == 'System1' ? 'System 1' : (val == 'SmartSignal' ? 'SmartSignal' : '');
		};

		$scope.resetGridSort = function(val) {
			$scope.resetToHierarchy = !$scope.resetToHierarchy;
			//$scope.overviewIndex = _.sortBy($scope.overviewIndex, function(o) { return o.source+o.nodePathName; }).reverse();
			if ($scope.resetToHierarchy == false) {
				return 'nodePathName';
			} else
				return "";
		};
		$scope.$watch("nodeSelected", function(newValue, oldValue) {
			if (newValue !== oldValue) {
				$scope.nodeId = ctxGlobal.getNodeId();
				$scope.enterpriseId = ctxGlobal.getEnterpriseId();
				$scope.select('true');
			}
		});

		$scope.$watch('customerId', function(newVal, oldVal) {
			if (newVal !== oldVal) {
				$scope.select('true');
			}
		});

		//****initialize
		$scope.select('true');

		$scope.gotoAlarms = function(item, val, count) {

			ctxGlobal.setEnterpriseId(item.enterpriseId);
			ctxGlobal.setNodeId(item.nodeId);

			$scope.changeNodeId(item);

			$scope.selectedAlarmValues = {
				dataSource : 'All',
				normalizedSeverityLevel : val,
				severityLevel : 'All',
				count : count,
				density : 'All',
				acknowledged : 'All',
				active : 'All'
			};

			$scope.selectedAlarmsOptions = {
				customerId : $scope.customerId,
				enterpriseId : ctxGlobal.getEnterpriseId(),
				nodeId : ctxGlobal.getNodeId(),
				isActive : $scope.range === 'active',
				startTime : null,
				endTime : null,
				consolidate : null
			};

			UserSelections.setAlarmValues($scope.selectedAlarmValues);
			UserSelections.setGotoAlarmParams($scope.selectedAlarmsOptions);

			$state.go('assets.alarms');
		};

		$scope.changeNodeId = function(node) {
			//ctxGlobal.setAssetTree(node.path.split('->'),node.nodePathName.split('->'));
			$scope.$emit('update-selected-node', {
				node : node
			});

		}

		$scope.$on('$destroy', function() {
			$timeout.cancel($scope.refreshFunction);
			$scope.refreshFunction = undefined;
			$interval.cancel(setRefresh);
		});
	}]);

});
