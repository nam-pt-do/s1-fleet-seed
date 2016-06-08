/**
 * Renders all the widgets on the tab and triggers the datasources that are used by the widgets.
 * Customize your widgets by:
 *  - Overriding or extending widget API methods
 *  - Changing widget settings or options
 */
'use strict';

define(['angular', 'controllers-module', 'vruntime'], function(angular, controllers) {

	// Controller definition
	controllers.controller('PreferencesCtrl', ['$log', '$scope', '$modal', '$users', 'UserSelections', '$stateParams', 'DropdownMenuList', '$state', '$guid', 'ctxAlarms', '$rootScope', 'ctxGlobal',
	function($log, $scope, $modal, $users, UserSelections, $stateParams, DropdownMenuList, $state, $guid, ctxAlarms, $rootScope, ctxGlobal) {

		// ================================================
		// PRIVATE METHODS & VARS

		var fromState = ctxGlobal.getFromState();
		// inheriting from parent scope
		var goingState = '';
		var hasPerfChanged = false;
		var currentState = $state.current.name;
		var watchFucntion = null;

		// ================================================
		// PUBLIC METHODS & VARS
		$scope.tmpUser = angular.copy($scope.currentUser);
		// $scope.tmpUser.preference = UserSelections.getCurrentUserPrefs();

		$scope.ddmenuList = DropdownMenuList.getddmenuList();
		$scope.sortType = UserSelections.getSortType();

		$scope.getDefaultUserPrefs = function() {
			if (!$scope.defaultUserPreference) {
				$users.getDefaultUserPreference().then(function(data) {
					$scope.defaultUserPreference = data;
					if ( typeof ($scope.defaultUserPreference) == "string") {
						$scope.defaultUserPreference = JSON.parse($scope.defaultUserPreference);
					}
					$scope.tmpUser.preference = $scope.defaultUserPreference;
					$scope.widgetOptions = $scope.defaultUserPreference.index;
					$scope.widgetSort = $scope.tmpUser.preference.widgetSort;
					$scope.overviewTypeIcon = $scope.tmpUser.preference.overviewStyle;
					$rootScope.selectedTz = $scope.tmpUser.preference.tzOption;
					UserSelections.setCurrentUser($scope.tmpUser);
					UserSelections.setCurrentUserPrefs($scope.tmpUser.preference);
					UserSelections.setDashTab($scope.overviewTypeIcon);
					UserSelections.setSortType($scope.tmpUser.preference.widgetSort);
					UserSelections.setTimezone($scope.tmpUser.preference.tzOption);
					UserSelections.setWidgetOptions($scope.tmpUser.preference.index);
					UserSelections.setHierarchyOption($scope.tmpUser.preference.hierarchyOption);
					UserSelections.setAssetType($scope.tmpUser.preference.hierarchyOption);
				});
			} else {
				if ( typeof ($scope.defaultUserPreference) == "string") {
					$scope.defaultUserPreference = JSON.parse($scope.defaultUserPreference);
				}
				$scope.tmpUser.preference = $scope.defaultUserPreference;
				$scope.widgetOptions = $scope.defaultUserPreference.index;
				$scope.widgetSort = $scope.tmpUser.preference.widgetSort;
				$scope.overviewTypeIcon = $scope.tmpUser.preference.overviewStyle;
				$rootScope.selectedTz = $scope.tmpUser.preference.tzOption;
				UserSelections.setCurrentUser($scope.tmpUser);
				UserSelections.setCurrentUserPrefs($scope.tmpUser.preference);
				UserSelections.setDashTab($scope.overviewTypeIcon);
				UserSelections.setSortType($scope.tmpUser.preference.widgetSort);
				UserSelections.setTimezone($scope.tmpUser.preference.tzOption);
				UserSelections.setWidgetOptions($scope.defaultUserPreference.index);
				UserSelections.setHierarchyOption($scope.tmpUser.preference.hierarchyOption);
				UserSelections.setAssetType($scope.tmpUser.preference.hierarchyOption);
			}
		};

		$scope.restoreSettings = function() {
			$scope.preferenceErrorMsg = "";
			$scope.getDefaultUserPrefs();

		};

		var proceedCanel = function() {
			$scope.preferenceErrorMsg = "";
			//$scope.tmpUser = {preference: {}};;
			hasPerfChanged = false;
			if (goingState) {
				$state.go(goingState);
			} else {
				$state.go("assets.overview");
			}
		};

		$scope.dismiss = function() {
			if (hasPerfChanged) {

				$scope.modalInstanceCreateUser = $modal.open({
					templateUrl : 'assets/views/preferences/dialog.html',
					controller : createDialogCtrl,
					scope : $scope
				});
				$scope.modalInstanceCreateUser.result.then(function() {
					//console.log($scope.newUser)
				});
			} else {
				proceedCanel();
			}
		};

		var createDialogCtrl = function($scope, $modalInstance) {
			$scope.ok = function() {
				//$scope.updateOk =true;
				//console.log($scope.newUser)
				$modalInstance.close();
				proceedCanel();
			};
			$scope.cancel = function() {
				// $scope.updateOk =false;
				$modalInstance.dismiss('cancel');
			};
		};

		$scope.$watch('tmpUser.preference', function(nv, ov) {
			if (nv !== ov && ov) {
				hasPerfChanged = true;
			} else {
				hasPerfChanged = false;
			}
		}, true);

		$scope.isCheckboxSelected = function(obj) {
			//console.log(obj)
			if (obj.selected) {
				return true;
			} else
				return false;
		};

		$scope.save = function() {
			$scope.preferenceErrorMsg = "";
			$scope.overviewTypeIcon = $scope.tmpUser.preference.overviewStyle == 'viewWidget' ? 'dashboard' : 'table';
			$scope.widgetOptions = $scope.tmpUser.preference.index;
			//console.log("widgetoption",$scope.widgetOptions)
			$rootScope.selectedTz = $scope.tmpUser.preference.tzOption;
			UserSelections.setTimezone($scope.tmpUser.preference.tzOption);
			UserSelections.setSortType($scope.tmpUser.preference.widgetSort);
			UserSelections.setAssetType($scope.tmpUser.preference.hierarchyOption);
			UserSelections.setHierarchyOption($scope.tmpUser.preference.hierarchyOption);
			UserSelections.setWidgetOptions($scope.tmpUser.preference.index);
			for (var i = 0; i < $scope.ddmenuList.length; i++) {
				if ($scope.widgetOptions[$scope.ddmenuList[i].id] == 'on') {
					$scope.ddmenuList[i].selected = true;
				} else {
					$scope.ddmenuList[i].selected = false;
				}
			}
			DropdownMenuList.setddmenuList($scope.ddmenuList);
			UserSelections.setCurrentUserPrefs($scope.tmpUser.preference);
			UserSelections.setDashTab($scope.overviewTypeIcon);
			//console.log("UserSelections after preferences save",UserSelections);
			ctxAlarms.setAlarmsTableSort($scope.tmpUser.preference.alarmsGridSort, $scope.tmpUser.preference.alarmsGridSortOrder);
			ctxAlarms.setChartType($scope.tmpUser.preference.alarmChart);
			UserSelections.setGridSort($scope.tmpUser.preference.overviewGridSort, $scope.tmpUser.preference.overviewGridSortOrder);

			$guid.getGuidToken().then(
			// success
			function(data) {
				$scope.guidToken = data.response;
				$users.updateUser($scope.tmpUser, null, $scope.guidToken).then(
				// success
				function(data) {
					//$log.info(response);
					//update the current user preference object
					//console.log($scope.currentUser)
					if(typeof(data.response.preference)=="string"){
						data.response.preference = JSON.parse(data.response.preference);
					}
					$scope.tmpUser = data.response;
					hasPerfChanged = false;
					$state.go("assets.overview");
				},
				// error
				function(error) {
					//$log.error(error);
					$scope.preferenceErrorMsg = "Failed to save preference changes!";
					alert("Failed to Save Changes   " + error.statusText);
					return error;
				});
				//$state.go('assets.detail.overview');
			},
			// error
			function(error) {
				//console.log(error);
				window.history.back();
				alert("Failed to Save Changes   " + error.statusText);
				return error;
			});

		};
		// ================================================
		// INITIALIZE
		// init the default user preference
		$scope.preferenceErrorMsg = "";
		/*$users.getDefaultUserPreference().then(function (data) {
		 $scope.defaultUserPreference = data;
		 });*/

		$scope.getInitUserPrefs = function() {
			//if (!$scope.tmpUser) {
			$users.getCurrentUser().then(
			// success
			function(response) {
				if ( typeof (response) == "string") {
					// window.location.replace("http://localhost:9000/#/login");
				} else {
					$scope.tmpUser = response;
					if (!$scope.tmpUser.preference) {
						$scope.getDefaultUserPrefs();
					} else {
						$scope.widgetOptions = $scope.tmpUser.preference.index;
						$rootScope.selectedTz = $scope.tmpUser.preference.tzOption;
						UserSelections.setTimezone($scope.tmpUser.preference.tzOption);
					}
				}
			},
			// error
			function(error) {
				$log.error(error);
			});

		};

		$scope.getInitUserPrefs();
		// ================================================
		// EVENT LISTENERS

		watchFucntion = $rootScope.$on('$stateChangeStart', function(evt, toState, toParams, fromState, fromParams) {

			if (hasPerfChanged) {
				goingState = toState.name;
				evt.preventDefault();
				$scope.modalInstanceCreateUser = $modal.open({
					templateUrl : 'assets/views/preferences/dialog.html',
					controller : createDialogCtrl,
					scope : $scope
				});
				$scope.modalInstanceCreateUser.result.then(function() {
					//console.log($scope.newUser)
				});
			} else {
				watchFucntion();
				// destroy watch listener
			}
		});
	}])

});
