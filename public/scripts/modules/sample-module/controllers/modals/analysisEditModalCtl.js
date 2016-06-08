/**
 * Renders all the widgets on the tab and triggers the datasources that are used by the widgets.
 * Customize your widgets by:
 *  - Overriding or extending widget API methods
 *  - Changing widget settings or options
 */
'use strict';

define(['angular', 'controllers-module', 'vruntime'], function(angular, controllers) {

	// Controller definition
	controllers.controller('analysisEditModalCtrl', ['$rootScope', '$scope', '$modal', '$log', '$timeout', '$state', '$stateParams', '$analysis', 'analysisTwoService', 'UserSelections', 'ctxGlobal', '$q', 'assetsService',
	function($rootScope, $scope, $modal, $log, $timeout, $state, $stateParams, $analysis, analysisTwoService, UserSelections, ctxGlobal, $q, assetsService) {

		var __AS = analysisTwoService;
		var __RS = $rootScope;
		var updateNodeValue = function(obj) {
			$scope.selectedNodeName = obj.nodeName ? obj.nodeName.name : obj.node.name;
			$scope.nodeSeverity = obj.nodeName ? obj.nodeName.highestNormalizedSevLevel : obj.node.highestNormalizedSevLevel;
			$scope.nodeType = obj.nodeName ? (obj.nodeName.type || '') : (obj.node.type || '');
			$scope.nodeNoDatapoints = obj.nodeName ? (obj.nodeName.ipNoDataS2 + obj.nodeName.imNoDataS2) : (obj.node.ipNoDataS2 + obj.node.imNoDataS2);
		};
		$scope.cId = ctxGlobal.getCustomerId();
		// Customer ID
		$scope.eId = $scope.enterpriseId;
		// Enterprise ID
		$scope.nId = ctxGlobal.getNodeId();
		// Node ID
		$scope.pId = null;
		// Point ID
		$scope.vId = null;
		// Enterprise ID
		$scope.plotSelections = $analysis.getPlotSelections;
		$scope.plot = {};
		$scope.selectedPtObj = {};
		$scope.availablePtsAndVars = [];
		$scope.availablePts = [];
		$scope.availableVars = [];
		$scope.enterpriseType = "";
		$scope.selectedPt = null;
		$scope.chartInstance = null;
		$scope.showSpinner = false;
		$scope.alerts = [];
		$scope.showAlert = false;
		$scope.inlineChartFltr = true;
		$scope.previousSelected = {};
		//handles checking of old selected items
		$scope.selectedTags = [];
		$scope.sortByEditChart = 'centralTagName';
		$scope.spinnerText = 'Loading Data...';
		$scope.sortOrderEditChart = '';
		// values are '' or 'reverse'
		$scope.searchTextEditChart = '';

		$scope.pageSize = 10;
		$scope.entriesPerPageOptions = [10, 25, 50, 100];
		$scope.currentPage = 1;
		// reset the page to 0
		$scope.loadingTags = __AS.loadingTags;

		//$scope.editChartAvailableTags = __AS.editChartAvailableTags;

		$scope.selectedObj = __AS.selectedObj;
		$scope.customerListArray = __AS.customerListArray;
		$scope.siteListArray = __AS.siteListArray;
		$scope.lineupListArray = __AS.lineupListArray;
		$scope.machineListArray = __AS.machineListArray;

		$scope.plottedCharts = __AS.plottedCharts;
		$scope.editChartAvailableTags = __AS.editChartAvailableTags;

		$scope.staticData = __AS.staticData;
		$scope.analysisContext = __AS.analysisContext;
		$scope.message = '';
		// get rid of error message if any

		$scope.updatePageSize = function(val) {
			$scope.pageSize = val;
			$scope.currentPage = 1;
		};

		$scope.toggleSortEditChart = function(column) {
			if ($scope.sortByEditChart === column) {
				$scope.sortOrderEditChart = $scope.sortOrderEditChart === '' ? 'reverse' : '';
			} else {
				$scope.sortByEditChart = column;
				$scope.sortOrderEditChart = '';
				// default for new is desc
			}
		};

		$scope.changedPrevious = function(selected, $event) {
			var checkbox = $event.target;
			//if selected
			if (checkbox.checked) {
				//push in array
				selected.selected = true;
			} else {
				//remove from array
				selected.selected = false;
			}
		};
		$scope.onDeleteSelectedTag = function(selectedNode) {
			selectedNode.selectedNodeObj.selected = false;
			__AS.onSelectionOfTagInEditChart(selectedNode);
			$scope.selectedTags = __AS.editSelectedTags;
			if ($scope.selectedPtObj && $scope.selectedPtObj.point) {
				var variables = $scope.availablePtsAndVars[$scope.selectedPtObj.point];
				for (var count = 0; count <= variables.length; count++) {
					if (variables[count].nodeId == selectedNode.selectedNode) {
						variables[count].selected = false;
						break;
					}
				}
			} else if ($scope.availablePts.length) {
				variables = $scope.availablePtsAndVars;
				_.each($scope.availablePts, function(pt, idx) {
					if (variables[pt.name].id == selectedNode.selectedNode) {
						variables[pt.name].selected = false;
						return false;
					}
				});
			}
		};
		$scope.onSelectionOfTagInEditChart = function(selectedNode) {
			var tag = {
				nodeName : selectedNode.name,
				namepath : selectedNode.namepath,
				customerId : $scope.cId,
				enterpriseId : $scope.enterpriseId,
				selectedPt : $scope.selectedPt,
				selectedNode : selectedNode.id || selectedNode.selectedNode,
				startDate : $scope.frmStartDate,
				endDate : $scope.frmEndDate,
				selectedNodeObj : selectedNode
			};
			__AS.onSelectionOfTagInEditChart(tag);
			$scope.selectedTags = __AS.editSelectedTags;
		};

		$scope.deleteAnalysisChart = function(instance) {
			$scope.confirm = true;
			$scope.confirmTitle = 'Confirmation:';
			$scope.confirmContent = 'Please confirm the deletion of the chart';
		};

		$scope.updateCustomer = function(customerObj) {
			$timeout(function() {
				__AS.updateCustomer(customerObj);
				$scope.siteListArray = __AS.getsiteListArray();
			});
		};

		$scope.showMessage = function(msg, msgType) {
			$scope.displayMessage = "true";
			$scope.message = msg;
			//btn-info or btn-warning or btn-error
			$scope.messageClass = msgType;
		};

		$scope.clearMessage = function() {
			$scope.displayMessage = "false";
			$scope.message = "";
			$scope.messageClass = "";
		};

		$scope.updateAnalysisChart = function(instance) {
			//remove deselected items from Preselected
			__AS.changePreselected();
			__AS.updateAnalysisChart();
			$scope.currentPage = 1;
			__AS.editChartSelectedTags = {};
			__AS.editSelectedTags = [];
			// reset the page to 0
			instance.$close();
		};

		//Confirm message
		$scope.onYes = function(instance) {

			var chartStatus = {};

			chartStatus.chartIdx = __AS.selectedPlottedChartForEdit;
			chartStatus.hasTagChanged = true;
			$scope.confirm = false;
			__AS.plottedCharts.splice(__AS.selectedPlottedChartForEdit, 1);
			instance.$dismiss('cancel');
			instance.$close();
			if (__AS.plottedCharts.length === 0) {
				$scope.isZoomApplied = false;
			}
			__AS.updateCtrl(chartStatus);
		};

		$scope.onNo = function(instance) {
			$scope.confirm = false;
			instance.$dismiss('cancel');
			instance.$close();
		};

		$scope.updateFilter = function(tag) {
			var filterUpdatingTag = _.last(tag);

			var customerId = filterUpdatingTag.customerId;
			var siteId = filterUpdatingTag.siteId;
			var lineupId = filterUpdatingTag.lineupId;

			__AS.selectedObj.customer = _.find(__AS.customerListArray, function(obj) {
				return obj.customerId === customerId;
			});
			__AS.selectedObj.site = _.find(__AS.selectedObj.customer.sites, function(obj) {
				return obj.siteId === siteId;
			});
			__AS.selectedObj.lineup = _.find(__AS.selectedObj.site.lineups, function(obj) {
				return obj.lineupId === lineupId;
			});
		};

		$scope.cancelAnalysisEditChart = function(instance) {
			__AS.editChartSelectedTags = {};
			__AS.editSelectedTags = [];
			instance.$dismiss('cancel');
		};

		$scope.selectionChanged = function(obj) {
			if (obj.node.enterpriseId && obj.node.id /*&& (obj.node.type === 'machine' || obj.node.type === 'machine_train')*/) {
				$scope.customerId = $scope.cId;
				$scope.nodeId = obj.node.id;
				$scope.enterpriseId = obj.node.enterpriseId;
				$scope.showSpinner = true;
				$analysis.getPtsAndVars($scope.customerId, obj.node.enterpriseId, obj.node.id).then(function(data) {
					/*
					 $scope.showSpinner = false;
					 $scope.availablePtsAndVars = data.response;
					 $scope.availablePts = Object.keys($scope.availablePtsAndVars);*/
					$scope.availablePts = [];
					$scope.enterpriseType = data.response.enterpriseType;
					var formattedResponse = {};
					if (data.response.analysisNodes.length) {
						if (data.response.enterpriseType == "System1") {
							_.each(data.response.analysisNodes, function(pts, idx) {
								formattedResponse[pts.name] = pts.childNodes;
								$scope.availablePts.push(pts.name);
							});
							$scope.availablePts = _.sortBy($scope.availablePts, function(name) {
								return name;
							});
						} else {
							_.each(data.response.analysisNodes, function(pts, idx) {
								formattedResponse[pts.name] = pts;
							});
							$scope.availablePts = data.response.analysisNodes;
							$scope.availablePts = _.sortBy($scope.availablePts, function(availablePts) {
								return availablePts.name;
							});
						}
					}
					$scope.availablePtsAndVars = formattedResponse;
					$scope.clearMessage();
				}, function() {
					$scope.showSpinner = false;
					$scope.showMessage("Unexpected error in processing the request. Please retry or contact the site administrator.", "btn-warning");
				});
			} else {
				//$scope.showMessage("Analysis is only available for trains or assets. Please select a System 1 train or asset from the hierarchy.", "btn-info");
			}
		};

		$scope.setSelected = function(selectedPoint) {
			var _variables = $scope.availablePtsAndVars[selectedPoint.point];
			_variables = _.sortBy(_variables, function(variable) {
				return variable.name;
			});
			$scope.availableVars = _variables;
			$scope.selectedPtObj = selectedPoint;
			$scope.selectedPt = selectedPoint.point;
			//Set styles for selected row
			if ($scope.lastSelected) {
				$scope.lastSelected.selected = '';
			}
			this.selected = 'selected';
			$scope.lastSelected = this;
		};

		$scope.getSelectedTags = function() {
			console.log("Selected Graph is :" + __AS.selectedPlottedChartForEdit);
			var idx = __AS.selectedPlottedChartForEdit;
			var i,
			    tag;
			var selectedTags = [];
			// *not used. Useful when filter needs to b updated

			//$scope.currentPage = 1; // reset the page to 0
			$scope.message = '';
			// get rid of error message if any
			$scope.confirm = false;
			$scope.loadingTags = false;
			__AS.editChartSelectedTags = {};
			//create object to hold users selected options
			__AS.computeEditChartAvailableTags(idx);
			//get selected tags and pass those editChartAvailableTags

			$scope.editChartAvailableTags = __AS.editChartAvailableTags;
			for (i in __AS.editChartAvailableTags) {
				if (__AS.editChartAvailableTags[i].selected) {

					tag = __AS.editChartAvailableTags[i].tag;
					selectedTags.push(tag);
					__AS.editChartSelectedTags[$scope.cId + tag.tagNode.enterpriseId + tag.tagNode.nodeId] = {};
					__AS.editChartSelectedTags[$scope.cId + tag.tagNode.enterpriseId + tag.tagNode.nodeId].selectedNodeObj = tag.tagNode;
					__AS.editChartSelectedTags[$scope.cId + tag.tagNode.enterpriseId + tag.tagNode.nodeId].selectedNodeObj.selected = __AS.editChartAvailableTags[i].selected;
					__AS.editChartSelectedTags[$scope.cId + tag.tagNode.enterpriseId + tag.tagNode.nodeId].name = $scope.cId + tag.tagNode.enterpriseId + tag.tagNode.nodeId;
					__AS.editChartSelectedTags[$scope.cId + tag.tagNode.enterpriseId + tag.tagNode.nodeId].nodeName = tag.tagNode.name;
					__AS.editChartSelectedTags[$scope.cId + tag.tagNode.enterpriseId + tag.tagNode.nodeId].namepath = ctxGlobal.getEnterpriseNode() + "->" + tag.tagNode.nodeNamePath;
					__AS.editChartSelectedTags[$scope.cId + tag.tagNode.enterpriseId + tag.tagNode.nodeId].customerId = $scope.cId;
					__AS.editChartSelectedTags[$scope.cId + tag.tagNode.enterpriseId + tag.tagNode.nodeId].enterpriseId = tag.tagNode.enterpriseId;
					__AS.editChartSelectedTags[$scope.cId + tag.tagNode.enterpriseId + tag.tagNode.nodeId].selectedPt = $scope.selectedPt;
					__AS.editChartSelectedTags[$scope.cId + tag.tagNode.enterpriseId + tag.tagNode.nodeId].selectedNode = tag.tagNode.nodeId;
					__AS.editChartSelectedTags[$scope.cId + tag.tagNode.enterpriseId + tag.tagNode.nodeId].startDate = $scope.frmStartDate;
					__AS.editChartSelectedTags[$scope.cId + tag.tagNode.enterpriseId + tag.tagNode.nodeId].endDate = $scope.frmEndDate;
					__AS.editSelectedTags.push(__AS.editChartSelectedTags[$scope.cId + tag.tagNode.enterpriseId + tag.tagNode.nodeId]);
					__AS.editChartAvailableTags[$scope.cId + tag.tagNode.enterpriseId + tag.tagNode.nodeId] = tag;
				}
			}
			$scope.selectedTags = __AS.editSelectedTags;
		};

		var isUTC = function() {
			return $rootScope.selectedTz && $rootScope.selectedTz == 'tzGmt';
		};

		var formatFormDates = function() {
			if (isUTC()) {
				$scope.dtEndDate = $scope.frmEndDate.utc().format('YYYY-MM-DD');
				$scope.dtStartDate = $scope.frmStartDate.utc().format('YYYY-MM-DD');

				$scope.startTime = $scope.frmStartDate.utc().format('HH:mm');
				$scope.endTime = $scope.frmEndDate.utc().format('HH:mm');

			} else {
				$scope.dtEndDate = $scope.frmEndDate.format('YYYY-MM-DD');
				$scope.dtStartDate = $scope.frmStartDate.format('YYYY-MM-DD');

				$scope.startTime = $scope.frmStartDate.format('HH:mm');
				$scope.endTime = $scope.frmEndDate.format('HH:mm');
			}
		};

		var initDates = function() {
			$scope.frmEndDate = new moment();
			$scope.frmStartDate = new moment().subtract(7, 'days');
			formatFormDates();
		};

		$scope.clearConfirm = function(obj) {
			$scope.confirm = false;
		};
		$scope.setCustomer = function(customerId) {
			$scope.cId = customerId;
			$scope.customerId = $scope.cId || UserSelections.getSelectedCustomer();
			$scope.resetCustomerSelection($scope.customerId);
			$("#fleet").addClass('active');
			//$rootScope.setFleet($scope.customerId + 'Fleet');
		};

		$scope.resetToCustomer = false;

		$scope.resetCustomerSelection = function(customerId) {
			$scope.resetToCustomer = true;
			$scope.customerId = customerId;
			UserSelections.setSelectedCustomer(customerId);
			delete $scope.selectedNode;
			$scope.nodeSeverity = -1;
			$scope.nodeNoDatapoints = 0;
			$scope.selectedNodeName = customerId;
			// not cleaning it as unaware where it is being used
			$scope.selectedNode = customerId;
			// In tandem with the new declaration
			delete $scope.enterpriseId;
			delete $scope.nodeId;
			delete $scope.selectedNodePath;

			$scope.nodeSelectedType = '';
			//recurse($scope.assets, '');
		};

		$scope.getEnterpriseNodes = function(nodeId) {
			var options = {};
			var assetList;
			var nodeList;

			options.enterpriseId = nodeId;
			options.customerId = $scope.customerId || $scope.cId;
			return assetsService.getEnterpriseNodes(options);
		};

		$scope.getEnterprises = function() {
			var options = {};
			var deffer = $q.defer();
			if ($rootScope.currentUser.preference.hierarchyOption == "SmartSignal") {
				var entprArray = [{
					label : "SmartSignal Hierarchy",
					items : []
				}, {
					label : "System 1 Hierarchy",
					items : []
				}];
			} else {
				var entprArray = [{
					label : "System 1 Hierarchy",
					items : []
				}, {
					label : "SmartSignal Hierarchy",
					items : []
				}];
			}
			$scope.enterpriseList = "";
			options.customerId = $scope.customerId || $scope.cId;
			$scope.showDropDownSpinner = true;
			assetsService.getEnterprise(options).then(
			// success
			function(response) {
				// unit test require
				var i;
				var length = response.length;

				for ( i = 0; i < length; i++) {
					if ($rootScope.currentUser.preference.hierarchyOption == "SmartSignal") {
						if (response[i].sourceSystem === "SmartSignal") {
							entprArray[0].items.push(response[i]);
						} else if (response[i].sourceSystem === "System1") {
							entprArray[1].items.push(response[i]);
						}
					} else {
						if (response[i].sourceSystem === "SmartSignal") {
							entprArray[1].items.push(response[i]);
						} else if (response[i].sourceSystem === "System1") {
							entprArray[0].items.push(response[i]);
						}
					}
				}
				$scope.enterpriseList = entprArray;
				deffer.resolve();
			},
			// error
			function(error) {
				$log.error(error);
			}).finally(function() {
				$scope.showDropDownSpinner = false;
			});

			return deffer.promise;
		};
		$scope.getVariableSelected = function(variable, selectedTags) {
			$(selectedTags).each(function(sTagIndex, sTagValue) {
				var variableId = variable.nodeId || variable.id;
				if (variableId == sTagValue.selectedNodeObj.nodeId) {
					variable.selected = true;
				}
			});
		};
		/** Start old stuff **/
		$scope.init = function() {
			$scope.clearMessage();
			// Clear Edited Tags
			__AS.editChartSelectedTags = {};
			$scope.setCustomer($scope.cId);
			$scope.getSelectedTags();
			for (var i = 0; i < UserSelections.getAssetArray().length; i++) {
				if (UserSelections.getAssetArray()[i].type === "enterprise" && UserSelections.getAssetArray()[i].sourceSystemEnum === "System1" && UserSelections.getAssetArray()[i].enterpriseId === $scope.eId) {
					findNodeFromEnterprise(UserSelections.getAssetArray()[i]);
				}
				if ($scope.n) {
					break;
				}
			}
			if ($scope.cId && $scope.eId && $scope.nId && $scope.n && ($scope.n.nodeTypeEnum === 'machine' || $scope.n.nodeTypeEnum === 'machine_train')) {
				showAnalysisSpinner("Loading points and variables for the selected node");
				$analysis.getPtsAndVars($scope.cId, $scope.eId, $scope.nId).then(function(data) {
					$scope.showAnalysisSpinner = false;
					$scope.clearMessage();
					$scope.availablePtsAndVars = data;
					$scope.availablePts = Object.keys($scope.availablePtsAndVars);
				}, function() {
					$scope.showAnalysisSpinner = false;
					$scope.showMessage("Unexpected error in processing the request. Please retry or contact the site administrator.", "btn-warning");
				});
			} else {
				//$scope.showMessage("Analysis is only available for trains or assets. Please select a System 1 train or asset from the hierarchy.", "btn-info");
			}

			// If there are any pre existing plot selections, plot them first
			if ($scope.plotSelections && $scope.plotSelections.length > 0) {
				processPlotSelections();
			} else {
				initDates();
			}
		};
		$scope.init();
		$scope.$on("update-selected-node", function(evt, obj) {
			updateNodeValue(obj);
			ctxGlobal.setSelectedNode(obj);
			$scope.selectionChanged(obj);
		});
	}]);

});
