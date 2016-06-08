/* global angular */
'use strict';

/**
 * Analysis Connector
 * @author: Deepika Singh - deepika.singh@ge.com
 * @deps: Angular.js (v1.2+)
 *
 * This service provides methods for retrieving points, variables and corresponding waveform for Analysis tab.
 *
 */

/*global define */
define(['angular', 'services-module'], function(angular, services) {
	'use strict';

	/* Services */
	services.factory('$analysis', ['$log', '$http', 'api',
	function($log, $http, api) {
		var plotSelections = [];

		function addDays(days) {
			var dat = new Date();

			var hour1 = dat.getHours();
			dat.setTime(dat.getTime() + days * 86400000)// 24*60*60*1000 = 24 hours
			var hour2 = dat.getHours();

			if (hour1 != hour2) {// summertime occured +/- a WHOLE number of hours thank god!
				dat.setTime(dat.getTime() + (hour1 - hour2) * 3600000) // 60*60*1000 = 1 hour
			}
			return dat;

			//this.setTime( dat.getTime() ) // to modify the object directly
		};
		var fromDt = addDays(-7);
		var toDt = new Date();
		return {
			getPlotSelections : plotSelections,
			getFromDt : fromDt,
			getToDt : toDt,
			getPtsAndVars : function(customerId, enterpriseId, nodeId) {

				if (!customerId || !enterpriseId || !nodeId) {
					return;
				}
				return $http({
					//   url: 'stub/analysis.json',
					url : '/api/v2/proxy',
					headers : {

						//'Service-End-Point' : api.url + 'machineservice/customer/' + escape(customerId) + '/enterprise/' + escape(enterpriseId) + '/machine/' + escape(nodeId) + '/variables'
						'Service-End-Point' : api.url + 'nodeservice/customer/' + escape(customerId) + '/enterprise/' + escape(enterpriseId) + '/node/' + escape(nodeId) + '/getAnalysisObjects'
					},
					method : 'GET'
				}).then(function(response) {
					return response.data;
				});
			},

			getEnterpriseConnectionStatus : function(options) {
				var dt = new Date();
				return $http({
					// url: 'stub/enterprises.json',
					url : '/api/v2/proxy' + "?ts=" + dt.getTime(),
					headers : {
						//'Service-End-Point' : api.url + 'enterpriseservice/user/' + escape(options.userId) + '/enterprise'
						'Service-End-Point' : api.url + 'enterpriseservice/customer/' + escape(options.customerId) + '/enterprise/' + escape(options.enterpriseId) + '/getEnterpriseConnectionStatus'
					},
					method : 'GET'
				}).then(function(response) {
					return response.data;
				});
			},

			getAnalysisData : function(customerId, enterpriseId, sourceID, startTime, endTime) {

				// Query Params will change depending on the node type and whether
				// we've got start/end times, so let's build that string here.
				if (!customerId || !enterpriseId || !sourceID || !startTime || !endTime) {
					return;
				}
				var dt = new Date();
				var queryParams = sourceID;
				queryParams += '&start=' + startTime;
				queryParams += '&end=' + endTime;

				return $http({
					// url: 'stub/alarms.json' + queryParams,
					url : '/api/v2/proxy' + "?ts=" + dt.getTime(),
					headers : {
						'Service-End-Point' : api.url + 'eventservice/customer/' + escape(customerId) + '/enterprise/' + escape(enterpriseId) + '/plottrend?sourceId=' + queryParams
					},

					method : 'GET'
				}).then(function(response) {

					response.data.cId = customerId;
					response.data.eId = enterpriseId;
					response.data.vId = sourceID;
					response.data.sDt = startTime;
					response.data.eDt = endTime;
					return response.data;
				});
			}
		}
	}])

});
