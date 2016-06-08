/**
 * Renders all the widgets on the tab and triggers the datasources that are used by the widgets.
 * Customize your widgets by:
 *  - Overriding or extending widget API methods
 *  - Changing widget settings or options
 */
'use strict';

define(['angular', 'controllers-module', 'vruntime'], function(angular, controllers) {

	// Controller definition
	controllers.controller('DashboardCtrl', ['$log', '$http', '$q', '$timeout', '$scope', '$rootScope', '$state', '$stateParams', '$assets', 'assetsService', '$customer', 'UserSelections', '$users', 'ctxGlobal', '$compile',
	function($log, $http, $q, $timeout, $scope, $rootScope, $state, $stateParams, $assets, assetsService, $customer, UserSelections, $users, ctxGlobal, $compile) {

		//Declarations
		var options = {};
		var updateNodeValue = function(node) {
			if (node) {
				/****
				 * updating node value across overview / alarms / analysis
				 * ****/
				$scope.selectedNodeName = node.name;
				if (node.severity != undefined) {
					$scope.nodeSeverity = node.severity;
				} else {
					$scope.nodeSeverity = node.highestNormalizedSevLevel;
				}
				$scope.nodeType = node.nodeType || node.type;
				$scope.nodeSelected = node;
				$scope.nodeNoDatapoints = node.ipNoData;
			} else {
				delete $scope.selectedNodeName;
				delete $scope.nodeSeverity;
				delete $scope.nodeType;
				delete $scope.nodeSelected;
				delete $scope.nodeNoDatapoints;
				$scope.setCustomer($scope.customerId);
			}
		};

		$scope.enterpriseList
		$scope.smartSignalAssetList = [];
		$scope.selectedEnterprise = '';
		$scope.selectedCustomer = '';
		$scope.hideFeatures = UserSelections.getCurrentUserPrefs().hideFeatures;
		$scope.customerId = ctxGlobal.getCustomerId();
		$scope.assetType = '';
		$scope.overviewTypeIcon = '';
		$scope.refreshInterval = '';
		$scope.autoRefresh = '';
		$scope.resetToCustomer = false;
		$scope.nodeSelected = ctxGlobal.getSelectedNode();
		$scope.enterpriseId = ctxGlobal.getEnterpriseId();
		$scope.current = $state.current;
		$scope.breadCrumb = ctxGlobal.getSelectedNode() ? ctxGlobal.getAssetNameTreePath() : [];

		console.log('hidden or not' + $scope.hideFeatures);

		//New code for hierarchy
		$rootScope.findCustomer = function(newVal) {

			if (!$scope.customerId) {
				if (newVal.preference && newVal.preference.customerId) {
					$scope.customerId = newVal.preference.customerId;
					$scope.overviewTypeIcon = UserSelections.getDashTab() == undefined || null ? newVal.preference.overviewStyle : UserSelections.getDashTab();
					$scope.assetType = newVal.preference.hierarchyOption != "SmartSignal" ? "System1" : "SmartSignal";
					if (!$rootScope.selectedTz || $rootScope.selectedTz == '') {
						$rootScope.selectedTz = newVal.preference.tzOption;
						UserSelections.setTimezone(newVal.preference.tzOption);
					}

					UserSelections.setDashTab($scope.overviewTypeIcon);
					UserSelections.setAssetType($scope.assetType);

					if (!newVal.preference.autoRefresh || !newVal.preference.autoRefresh == 'on') {
						$scope.refreshInterval = 1000;
						$scope.autoRefresh = "off";
					} else {
						$scope.refreshInterval = newVal.preference.refreshInterval;
						$scope.autoRefresh = newVal.preference.autoRefresh;
					}
				} else {
					//added for seed demo
					newVal.customers = [{"key":"GE","name":"GE"}];
					if (newVal.customers.length) {
						$scope.customerId = newVal.customers[0].key;
					}
					$scope.assetType = newVal.preference.hierarchyOption != "SmartSignal" ? "System1" : "SmartSignal";
					$scope.overviewTypeIcon = !UserSelections.getDashTab() ? 'table' : UserSelections.getDashTab();
					//temp condition
					if ($scope.hideFeatures == 'true')
						$scope.overviewTypeIcon = 'table';
					UserSelections.setDashTab($scope.overviewTypeIcon);
					// $rootScope.getInitUser();
				}

			}

			//toastr.success('Hello world! This pop-up will timeout in 5 seconds', 'Toastr fun!',{"timeOut" : 5000, "position" : "top"});
			if ($scope.customerId) {
				UserSelections.setSelectedCustomer($scope.customerId);
				ctxGlobal.setCustomerId($scope.customerId);
				$scope.setCustomer($scope.customerId);
			}
		};

		/*$rootScope.matchStatePartial = function (partial) {
		 console.log('matchStatePartial called');
		 var match = $location.path().indexOf(partial) > -1 ? true : false;
		 return match;
		 }*/

		$scope.setCustomer = function(customerId) {
			$scope.customerId = customerId || UserSelections.getSelectedCustomer();
			ctxGlobal.setCustomerId($scope.customerId);
			$scope.resetCustomerSelection($scope.customerId);
			$("#fleet").addClass('active');
			//$rootScope.setFleet($scope.customerId + 'Fleet');
		};

		$scope.resetCustomerSelection = function(customerId) {

			$scope.resetToCustomer = true;
			$scope.customerId = customerId;
			UserSelections.setSelectedCustomer(customerId);

			$scope.nodeSeverity = -1;
			$scope.nodeNoDatapoints = 0;
			$scope.selectedNodeName = customerId;
			// not cleaning it as unaware where it is being used
			$scope.nodeSelected = customerId;
			$scope.nodeType = undefined;

			// not cleaning it as unaware where it is being used
			// In tandem with the new declaration
			delete $scope.enterpriseId;
			delete $scope.nodeId;
			delete $scope.selectedNodePath;
			delete $scope.selectedNode;
			$scope.nodeSelectedType = ''

			ctxGlobal.setEnterpriseId(undefined);
			ctxGlobal.setNodeId(undefined);
			ctxGlobal.setAssetTree();

		};

		$scope.getEnterpriseNodes = function(nodeId) {
			var options = {};
			var assetList;
			var nodeList;

			options.enterpriseId = nodeId;
			options.customerId = $scope.customerId;
			return assetsService.getEnterpriseNodes(options);
		};

		$scope.getSeverityValue = function(label) {
			var sev;
			switch (label) {
			case "3":
				sev = "Alarm Severity : High";
				break;
			case "2":
				sev = "Alarm Severity : Medium";
				break;
			case "1":
				sev = "Alarm Severity : Low";
				break;
			}
			return sev;
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
			options.customerId = $scope.customerId;
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
		$scope.init = (function() {
			if ($scope.nodeSelected) {
				updateNodeValue($scope.nodeSelected);
			} else {
				$rootScope.findCustomer($rootScope.currentUser);
			}
			/*
			$("#spinnerContent").spin({
			"length" : 7,
			"width" : 4,
			"lines" : 8,
			"corners" : 1,
			"color" : "#CCC",
			"width" : 8,
			"opacity" : 0.5,
			"scale" : 0
			});*/

			//$scope.getEnterprises();
		})();
		$scope.appendChildNodes = function(nodes, el) {
			var parentNode = el.parentNode;

			//var newEl = document.createElement('div');
			//newEl.setAttribute('asset-model', '{{nodes}}');

		};
		$scope.$on("update-selected-node", function(evt, obj) {
			var tree;
			updateNodeValue(obj.node);
			ctxGlobal.setSelectedNode(obj.node);
			if (obj.node) {
				ctxGlobal.setAssetTree(obj.node.path.split('->'), obj.node.name_path.split('->'));
				if (obj.node.nodeType == 'Enterprise' || obj.node.type == 'enterprise') {
					$scope.enterpriseId = obj.node.id;
					ctxGlobal.setEnterpriseId($scope.enterpriseId);
				} else {
					ctxGlobal.setNodeId($scope.nodeSelected.id);
				}
			}
			tree = ctxGlobal.getAssetNameTreePath();
			$scope.breadCrumb = tree;
		});

		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
			$scope.current = toState;
		});

	}]);

});
