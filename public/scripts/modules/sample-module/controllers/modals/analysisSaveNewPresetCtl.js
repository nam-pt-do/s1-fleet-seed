/**
 * Renders all the widgets on the tab and triggers the datasources that are used by the widgets.
 * Customize your widgets by:
 *  - Overriding or extending widget API methods
 *  - Changing widget settings or options
 */
'use strict';

define(['angular', 'controllers-module', 'vruntime'], function(angular, controllers) {

	// Controller definition
	controllers.controller("analysisSaveNewPresetCtl", ["$rootScope", "$scope", "analysisTwoService", "$timeout", "infoShare", "$modal",
	function($rootScope, $scope, analysisTwoService, $timeout, infoShare, modalInfo) {
		var __scope = $scope.$parent;
		var modalData = {
			"savePreset" : {
				"header" : "Save plot session?",
				"msg" : "The changes made to your plot sessions will not be saved. Would you like to save your",
				"buttons" : [{
					"id" : "stayThere",
					"label" : "Yes"
				}, {
					"id" : "noThanks",
					"label" : "No, thank you"
				}]
			},
			"saveAsPreset" : {
				"header" : "Save new plot session",
				"msg" : "The changes made to your plot sessions will not be saved. Would you like to save your plot session?",
				"msgInput" : "All users",
				"cancelType" : "btn-danger",
				"buttons" : [{
					"id" : "saveAsPreset",
					"type" : "btn-primary",
					"label" : "Save"
				}]
			},
			"deletePreset" : {
				"header" : "Delete " + __scope.presetName + "?",
				"msg" : "Are you sure you want to delete? If you continue, you won't be able to restore this plot session.",
				"buttons" : [{
					"id" : "deletePreset",
					"type" : "btn-danger",
					"label" : "Delete"
				}]
			},
			"overWritePreset" : {
				"header" : "Overwrite " + __scope.presetName + "?",
				"msg" : "Plot session name already exists, do you want to override?",
				"buttons" : [{
					"id" : "overWritePreset",
					"type" : "btn-danger",
					"label" : "OverWrite"
				}]
			}
		};
		var validConfigName = /^([\w-\.]+)$/;
		var isDuplicate = false;
		var isSystemPreset;
		var canCreateTemplate;
		var isAdmin = __scope.isAdmin;
		var systemPresets = __scope.systemPreset;

		//$scope.modal = $modalInstance;
		//console.log($scope.modal);
		$scope.modalType = $scope.presetActionType;
		// this information is passed from modal service
		$scope.customer = analysisTwoService.selectedObj.customer;
		$scope.presetType = __scope.presetType;
		$scope.canCreateTemplate = __scope.canCreateTemplate;
		$scope.config = {
			presetType : (!isAdmin) ? "usr" : $scope.presetType,
			presetName : ''
		};
		$scope.hasPresetOpt = !($scope.modalType === 'saveAsPreset' || $scope.modalType === 'saveAsPresetWithMsg');

		// ** Check for validation and returns true or false
		$scope.isValidate = function(name, savePresetType) {

			isSystemPreset = ($scope.presetType === 'sys' && isAdmin) ? true : false;
			
			if ($scope.presetType === 'tpl') {

				isDuplicate = _.find($scope.template, function(template) {
					if (template.presetName.toUpperCase() === name.toUpperCase()) {
						return true;
					} else {
						return false;
					}
				});
			} else {
				if ($scope.config.presetType === "sys") {
					isDuplicate = _.find(systemPresets, function(presetName) {
						if (presetName.presetName.toUpperCase() === name.toUpperCase()) {
							return true;
						} else {
							return false;
						}
					});
				} else {
					isDuplicate = _.find($scope.userPreset, function(presetName) {
						if (presetName.presetName.toUpperCase() === name.toUpperCase()) {
							return true;
						} else {
							return false;
						}
					});
				}
			}/*
			 else if ($scope.presetType === 'sys' && isSystemPreset) {

			 isDuplicate = _.find(systemPresets, function(presetName) {
			 if (presetName.presetName.toUpperCase() === name.toUpperCase() && $scope.presetType == $scope.config.presetType) {
			 return true;
			 } else {
			 return false;
			 }
			 });
			 } else {
			 isDuplicate = _.find($scope.userPreset, function(presetName) {
			 if (presetName.presetName.toUpperCase() === name.toUpperCase() && $scope.presetType == $scope.config.presetType) {
			 return true;
			 }else{
			 return false;
			 }
			 });
			 }*/

			if (isDuplicate) {
				
				$scope.isDuplicate = isDuplicate;
				//$scope.dataError("Preset name might already exists or an error occurred while adding.");
				return false;
			} else if (!validConfigName.test(name)) {
				$scope.dataError("Your plot session name is not valid. Please enter a valid plot session name.");
				return false;
			} else {
				return true;
			}
		};
		// ** event handler for buttons in pop up || EVENT TYPE
		$scope.changePreset = function(instance, action, type, name) {
			switch(action) {

			case "deletePreset" :

				__scope.deletePreset();
				instance.$close();

				break;

			case "saveAsPreset" :

				var notValid = !$scope.isValidate(name, type);
				if ($scope.isDuplicate) {
					$scope.modalType = "overWritePreset";
					$scope.data = modalData[$scope.modalType];
					$("#primaryModalAction").remove();
					return;
				} else if (!name || notValid) {
					return;
				}
				instance.$close();
				__scope.savePreset(type, "", name, "", false);

				break;

			// to do, make it yes instead of savePreset
			case "savePreset" :

				if (!$scope.isValidate(name)) {
					instance.$close();
				}

				break;

			case "noThanks" :

				// __scope.navigateTo();
				if (modalInfo.callback) {
					modalInfo.callback("navigateAway");
				}
				$scope.modal.dismiss('navigating away');
				break;
			case "stayThere" :
				$scope.modal.dismiss('staying there');
				break;
			case "overWritePreset" :
				instance.$close();
				__scope.savePreset(type, $scope.isDuplicate.presetId, name, "", true);
				break;
			default :
				if ($scope.modalType == "overWritePreset") {
					$scope.modalType = "saveAsPreset";
					$scope.data = modalData[$scope.modalType];
					$("#primaryModalAction").remove();
				} else {
					instance.$close();
				}

			}
		};
		// ** display error message
		$scope.dataError = function(msg) {

			var message = msg ? msg : 'Unable to get data from server!';
			var msgObj = {
				type : 'error',
				title : 'Error:',
				content : message
			};

			$scope.clearMessage();
			$scope.message = msgObj;

		};
		// ** clear all the message
		$scope.clearMessage = function() {
			if ($scope.message) {
				$scope.message = false;
			}
		};
		// ** Provides data for all the modals
		$scope.data = (function() {

			var modalType = $scope.presetActionType;
			return modalData[modalType];

		})();

		$scope.clearMessage();
	}]);

});
