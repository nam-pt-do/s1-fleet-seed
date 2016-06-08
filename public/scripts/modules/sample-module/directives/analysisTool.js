/*global define */
define(['angular', 'directives-module'], function(angular, directives) {
	'use strict';

	/* Directives  */
	directives.directive('analysisTool', ['$rootScope', 'infoShare',
	function($rootScope, infoShare) {
		return {
			restrict : 'AE',
			scope : {
				loadChart : "&",
				presetData : "=",
				createNew : "&",
				openMenu : "=",
				tagChanged : "=",
				openSave : "&",
				clearPlot : "&",
				forceLoad : "=",
			},
			templateUrl : 'assets/views/analysis/analysisTool.html',
			link : function(scope, element, attrs) {
				scope.customerData = angular.copy(infoShare);
				scope.selectedUserPreset
				scope.selectedSysPreset
				scope.selectedTemplate
				scope.canApplyFltr = true;

				scope.$watch('forceLoad', function(newVal, oldVal) {
					if (newVal == true) {
						scope.applyFilter();
					}
					;
				});
				;

				scope.$watch('presetData', function(newVal, oldVal) {
					if (newVal !== oldVal) {
						scope.presetData = newVal;

						scope.plotOptions = [{
							"label" : "Private",
							"data" : scope.presetData.USER_PRESET
						}, {
							"label" : "Public",
							"data" : scope.presetData.SYSTEM_PRESET
						}];
						scope.selectedPlotOption = scope.plotOptions[0];
					}
				});

				scope.applyFilter = function() {
					if (scope.selectedPlotOption && scope.selectedPlotOption.label) {

						if (scope.forceLoad == false) {
							scope.openSave();
						} else {

							scope.clearPlot();
							switch (scope.selectedPlotOption.label) {
							case "Private":
								scope.loadChart()(scope.selectedPlotObj, 'usr');
								break;
							case "Public":
								scope.loadChart()(scope.selectedPlotObj, 'sys');
								break;
							}
						}
					}

				};

				scope.cancelFilter = function() {
					scope.createNew();
				};

				scope.resetChildOption = function() {
					scope.customerData = angular.copy(infoShare);
					scope.selectedCustomer = scope.customerData.selectedObj.customer;
					scope.selectedSite = scope.customerData.sites[0];
					scope.selectedLineup = scope.customerData.lineups[0];

					if (scope.selectedPlotObj) {
						scope.selectedPlotObj = null;
					}
				};

				scope.templateCheck = function() {
					scope.canApplyFltr = true;
				};

				scope.checkTplFltr = function() {
					var curSite = scope.selectedSite ? scope.selectedSite.siteId : null;
					var curLineup = scope.selectedLineup ? scope.selectedLineup.lineupId : null;
					var defaultSite = scope.customerData.defaultSite;
					var defaultLineup = scope.customerData.defaultLineup;

					if (curSite && curLineup) {

						if (curSite === defaultSite && curLineup === defaultLineup) {
							scope.canApplyFltr = false;
						} else {
							scope.canApplyFltr = true;
						}
					} else {
						scope.canApplyFltr = false;
					}
				};

				scope.disableTplFltr = function() {
					scope.canApplyFltr = false;
				};

				scope.updateLineup = function() {
					scope.selectedLineup = scope.customerData.defaultLineup;
					scope.checkTplFltr();

				}
			}
		}
	}])

	return directives;
});
