/*global define */
define(['angular', 'services-module'], function(angular, services) {
	'use strict';

	/* Services */
	//Factory for global variables; includes customerId, enterpriseId, nodeId, user, fleet, state

	services.factory('UserSelections', ['$rootScope',
	function($rootScope) {

		var currentUser = {};
		var selectedCustomer = '';
		var dashboardTab = '';
		var sortType = '';
		var widgetOptions = {};
		var assetArray = [],
		    savedAssets = [];
		var assetType = '';
		var mappingHierarchy;
		var alarmValues = {};
		var message = {};
		message.text = '';
		message.type = '';
		var gridSort = {};
		gridSort.gridSortVal = '';
		gridSort.gridSortOrder = '';
		var selectedTz = '';
		var alarmParams = {};
		var tmpA = [];
		var tmpB = [];
        //Bad dead code
		function IsJsonString(str) {
			try {
				JSON.parse(str);
			} catch (e) {
				return true;
			}
			return false;
		}

		return {
			setWidgetOptions : function(value) {
				widgetOptions = value
			},

			getWidgetOptions : function() {
				return widgetOptions
			},
			setGotoAlarmParams : function(value) {
				alarmParams = value
			},

			getGotoAlarmParams : function() {
				return alarmParams;
			},

			setAlarmValues : function(value) {
				alarmValues = value
			},

			getAlarmValues : function() {
				return alarmValues
			},

			setAssetArray : function(value) {
				assetArray = value
			},

			getAssetArray : function() {
				return assetArray
			},

			setTimezone : function(value) {
				selectedTz = value
			},

			getTimezone : function() {
				return selectedTz
			},

			getHierarchyOption : function() {
				return mappingHierarchy
			},

			setHierarchyOption : function(val) {
				switch (val) {
				case 'System1':
				case 'siHierarchy':
					mappingHierarchy = 'System1';
					break;
				case 'SmartSignal':
				case 'ssHierarchy':
					mappingHierarchy = 'SmartSignal';
				}
			},

			setCurrentUser : function(value) {
				currentUser = value;
			},

			setCurrentUserPrefs : function(value) {
				if (currentUser && currentUser.preference) {
					if (typeof(currentUser.preference)!="string") {
						currentUser.preference = value;
					} else {
						currentUser.preference = JSON.parse(value);
					}
					dashboardTab = currentUser.preference.overviewStyle == 'viewWidget' ? 'dashboard' : 'table';
					this.setWidgetOptions(currentUser.preference.index)
				} else {
					this.setWidgetOptions({
						"name" : "on",
						"s1MachinePIndex" : "on",
						"s1MachineCMIndex" : "on",
						"s1MachineCIndex" : "off",
						"s1InstProtectionIndex" : "on",
						"s1InstCMIndex" : "on",
						"s1InstCIndex" : "off",
						"ssPIndex" : "on",
						"tpIndex" : "on"
					})
				}
			},

			setDashTab : function(value) {
				dashboardTab = value;
			},

			setSortType : function(value) {
				sortType = value;
			},

			setSelectedCustomer : function(value, k) {
				selectedCustomer = value;
			},

			setGridSort : function(sort, order) {
				gridSort.overviewGridSort = sort;
				gridSort.overviewGridSortOrder = order;
			},

			getGridSort : function() {
				return gridSort;
			},

			setEULA : function(value) {
				currentUser.uala = value;
			},

			getEULA : function() {
				return currentUser.uala;
			},

			getCurrentUser : function() {
				return currentUser;
			},

			setAssetType : function(value) {
				assetType = value;
			},

			getAssetType : function() {
				return assetType;
			},
			setUploadMessage : function(value, type) {
				message.text = value;
				message.type = type;

			},

			getUploadMessage : function() {
				return message;
			},

			getCurrentUserPrefs : function() {
				return currentUser.preference;
			},

			getDashTab : function() {
				return dashboardTab;
			},

			getSortType : function() {
				return sortType;
			},

			getSelectedCustomer : function() {
				return selectedCustomer;
			},
			saveAssetArr : function(val) {
				savedAssets.length = 0;
				var tmp;
				tmpA.length = 0;
				_.forEach(val, function(obj) {
					tmp = _.pick(obj, 'id', 'nodePathName');
					tmpA.push(tmp)
				});
				savedAssets = _.sortBy(tmpA, function(o) {
					return o.nodePathName;
				});
			},

			compareAssetArr : function(val) {
				var tmp;
				tmpA.length = 0;
				tmpB.length = 0;
				_.forEach(val, function(obj) {
					tmp = _.pick(obj, 'id', 'nodePathName');
					tmpA.push(tmp)
				});
				tmpB = _.sortBy(tmpA, function(o) {
					return o.nodePathName;
				});

				if (savedAssets && savedAssets.length > 0 && tmpB && tmpB.length > 0)
					return _.isEqual(savedAssets, tmpB);
				else
					return true;
			}
		}
	}])

});
