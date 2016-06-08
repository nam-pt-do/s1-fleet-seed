/**
 * Renders all the widgets on the tab and triggers the datasources that are used by the widgets.
 * Customize your widgets by:
 *  - Overriding or extending widget API methods
 *  - Changing widget settings or options
 */
'use strict';

define(['angular', 'controllers-module', 'vruntime'], function(angular, controllers) {

	// Controller definition
	controllers.controller('analysisPlotNewModalCtrl', ['$rootScope', '$scope', '$modal', '$log', '$timeout', '$state', '$stateParams', '$assets', 'assetsService', '$customer', '$users', '$analysis', 'UserSelections', 'analysisTwoService', 'infoShare', 'ctxGlobal', '$q',
	function($rootScope, $scope, $modal, $log, $timeout, $state, $stateParams, $assets, assetsService, $customer, $users, $analysis, UserSelections, analysisTwoService, infoShare, ctxGlobal, $q) {
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
		$scope.availablePtsAndVars = [];
		$scope.availablePts = [];
		$scope.availableVars = [];
		$scope.enterpriseType = "";
		$scope.selectedPt = null;
		$scope.chartInstance = null;
		$scope.showSpinner = false;
		$scope.alerts = [];
		$scope.selectedTags = [];
		$scope.showAlert = false;
		$scope.spinnerText = 'Loading Data...';

		$scope.analysisPlotNewChart = function(instance) {
			analysisTwoService.analysisPlotNewChart();
			$scope.currentPage = 1;
			// reset the page to 0
			$scope.selectedNodeName = "";
			analysisTwoService.plotNewSelectedTags = {};
			analysisTwoService.selectedTags = [];
			instance.$close();
		};

		$scope.cancelAnalysisPlotNewChart = function(instance) {
			analysisTwoService.plotNewSelectedTags = {};
			analysisTwoService.selectedTags = [];
			$scope.selectedNodeName = "";
			instance.$dismiss('cancel');
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

		$scope.closeAlert = function(index) {
			$scope.alerts.pop();
		};

		function processPlotSelections() {
			if ($scope.plotSelections && $scope.plotSelections.length > 0) {
				var plotTemp = [];
				var yaxisTemp = [];
				for (var j = 0; j < $scope.plotSelections.length; j++) {
					var ps = $scope.plotSelections[j];
					var series = computePlotDataFromResponse(ps);
					//find if the data needs a new yaxis
					var existingAxis = -1;
					for (var axis = 0; axis < yaxisTemp.length; axis++) {
						if (yaxisTemp[axis] && ps.vUn === yaxisTemp[axis].title.text) {
							existingAxis = axis;
							break;
						}
					}
					if (existingAxis == -1) {
						//new yaxis
						yaxisTemp.push({
							id : ps.vUn,
							opposite : (yaxisTemp.length % 2 != 0),
							offset : (yaxisTemp.length % 2 == 0) ? (yaxisTemp.length / 2) * 50 : ((yaxisTemp.length - 1) / 2) * 50,
							labels : {
								formatter : function() {
									return this.value;
								},
								x : (yaxisTemp.length % 2 == 0) ? -8 : 10,
								y : 3,
								align : (yaxisTemp.length % 2 == 0) ? "right" : "left"
							},
							title : {
								text : ps.vUn,
								align : 'high',
								rotation : 0,
								offset : -20,
								x : (yaxisTemp.length % 2 == 0) ? -2 + (yaxisTemp.length) * -2 : 30 + (yaxisTemp.length) * 5,
								y : -15
							}
						});
						series.yAxis = ps.vUn;
					} else {
						//existing yaxis
						series.yAxis = ps.vUn;
					}
					plotTemp.push(series);
				}
				$scope.plot.yaxis = yaxisTemp;
				$scope.plot.series = plotTemp;
			} else {
				if ($scope.plot.yaxis) {
					$scope.plot.yaxis.splice(0);
				}
				if ($scope.plot.series) {
					$scope.plot.series.splice(0);
				}
			}
			hideAnalysisSpinner();
		};

		var initDates = function() {
			$scope.frmEndDate = new moment();
			$scope.frmStartDate = new moment().subtract(7, 'days');
			formatFormDates();
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

		var getMachineService = function(sourceID) {
			var nodeID = $scope.enterpriseId;
			var customerId = $scope.customerId;

			$log.info("Node ID: " + nodeID + " Customer ID " + customerId);
			$analysis.getPointsAndVariables(customerId, nodeID, sourceID).then(
			//Success
			function(response) {
				//debugger;
				$log.info("Analysis Response: " + response);
				arr = [];
				//Get Keys from this response
				arr = response;
				$scope.availablePoints = Object.keys(arr);
			});
		};

		$scope.setSelected = function(selectedPoint) {
			var _variables = $scope.availablePtsAndVars[selectedPoint.point];
			_variables = _.sortBy(_variables,function(variable){
				return variable.name;
			});
			$scope.availableVars = _variables;
			$scope.selectedPt = selectedPoint.point;
			//Set styles for selected row
			if ($scope.lastSelected) {
				$scope.lastSelected.selected = '';
			}
			this.selected = 'selected';
			$scope.lastSelected = this;
		};
		$scope.onDeleteSelectedTag = function(selectedNode) {
			selectedNode.selectedNodeObj.selected = false;
			analysisTwoService.onSelectionOfTagInPlotNewChart(selectedNode);
			$scope.selectedTags = analysisTwoService.selectedTags;
		};
		$scope.onSelectionOfTagInPlotNewChart = function(selectedNode) {
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
			analysisTwoService.onSelectionOfTagInPlotNewChart(tag);
			$scope.selectedTags = analysisTwoService.selectedTags;
		};

		/*
		 $scope.availablePts = function(selectedPoint) {console.log(1);
		 var _variables = $scope.availablePtsAndVars[selectedPoint.point];
		 $scope.availableVars = _variables;
		 $scope.selectedPt = selectedPoint.point;
		 //Set styles for selected row
		 if ($scope.lastSelected) {
		 $scope.lastSelected.selected = '';
		 }
		 this.selected = 'selected';
		 $scope.lastSelected = this;
		 };*/

		function showAnalysisSpinner(txt) {
			$scope.showSpinner = "true";
			if (txt) {
				$scope.spinnerText = txt;
			} else {
				$scope.spinnerText = "Loading...";
			}
		};

		function hideAnalysisSpinner() {
			$scope.showSpinner = "false";
			$scope.spinnerText = "";
		};

		$scope.selectionChanged = function(obj) {
			if (obj.node.enterpriseId && obj.node.id /*&& (obj.node.type === 'machine' || obj.node.type === 'machine_train')*/) {
				$scope.customerId = $scope.cId;
				$scope.nodeId = obj.node.id;
				$scope.enterpriseId = obj.node.enterpriseId;
				$scope.showSpinner = true;
				$analysis.getPtsAndVars($scope.customerId, obj.node.enterpriseId, obj.node.id).then(function(data) {
					$scope.showSpinner = false;
					
					$scope.availablePts = [];
					$scope.enterpriseType = data.response.enterpriseType;
					var formattedResponse = {};
					if (data.response.analysisNodes.length) {
						if(data.response.enterpriseType == "System1") {
							_.each(data.response.analysisNodes, function(pts, idx) {
								formattedResponse[pts.name] = pts.childNodes;
								$scope.availablePts.push(pts.name);
							});
							$scope.availablePts = _.sortBy($scope.availablePts, function(name) {
								return name;
							});
						}else{
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
					
					//Object.keys($scope.availablePtsAndVars);
					$scope.clearMessage();
				}, function() {
					$scope.showSpinner = false;
					$scope.showMessage("Unexpected error in processing the request. Please retry or contact the site administrator.", "btn-warning");
				});
			} else {
				//$scope.showMessage("Analysis is only available for trains or assets. Please select a System 1 train or asset from the hierarchy.", "btn-info");
			}
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
		/** Start old stuff **/
		$scope.init = function() {
			$scope.clearMessage();
			// Clear New Tags
			$scope.setCustomer($scope.cId);
			analysisTwoService.plotNewSelectedTags = {};
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
					hideAnalysisSpinner();
					$scope.clearMessage();
					$scope.availablePtsAndVars = data;
					$scope.availablePts = Object.keys($scope.availablePtsAndVars);
				}, function() {
					hideAnalysisSpinner();
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
			$scope.availableVars = [];
		});
	}]);

});
