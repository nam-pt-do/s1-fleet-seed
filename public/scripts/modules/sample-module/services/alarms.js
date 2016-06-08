/**
 * Alarms & Events Service Connector
 * @author: Pete Butler - pete.butler@ge.com
 * @deps: Angular.js (v1.2+)
 *
 * This service provides methods for retrieving alarms and events info.
 *
 */

/*global define */
define(['angular', 'services-module'], function(angular, services) {
	'use strict';

	/* Services */
	services.factory('$alarms', ['$log', '$http', 'api',
	function($log, $http, api) {
		return {
			// todo: do not prefix the factory names with a $
			// todo: need to address error handling in functions

			// This comes from static JSON
			// TODO: this is pretty fragile--probably ought to be a real service
			// which actually checks to see which fields exist in the database -pb
			getAlarmFields : function() {
				return $http({
					url : 'stub/alarmFields.json',
					method : 'GET'
				}).then(function(response) {
					return response.data;
				});
			},

			getAlarmList : function(options) {

				// Query Params will change depending on the node type and whether
				// we've got start/end times, so let's build that string here.
				/* var queryParams = '?consolidate=' + options.consolidate +
				 '&onlyActive=' + options.isActive;*/
				var enterpriseID;
				/*var queryParams = '?onlyActive=' + options.isActive;

				 if(options.nodeId !== options.customerId && (options.nodeId)){
				 queryParams += '&nodeId=' + options.nodeId;
				 }
				 if(options.startTime){
				 queryParams += '&startTime=' + options.startTime;
				 }
				 if(options.endTime){
				 queryParams += '&endTime=' + options.endTime;
				 } */
				var restUrl = api.url + 'activealarmsservice/active-alarms/customer/' + escape(options.customerId);
				if (options.enterpriseId) {
					restUrl += '/enterprise/' + escape(options.enterpriseId);
				}
				if (options.nodeId) {
					restUrl += '/nodeId/' + escape(options.nodeId);
				}
				//restUrl += '/event' + queryParams;
				var dt = new Date();
				return $http({
					// url: 'stub/alarms.json' + queryParams,
					url : '/api/v2/proxy' + "?ts=" + dt.getTime(),
					headers : {
						'Service-End-Point' : restUrl
					},
					method : 'GET'
				}).then(function(response) {
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
					var _eventCategory;
					var getCategoryNameIndex;
					_.forEach(response.data.response, function(obj) {
						_eventCategory = obj.fleetCategoryEnum;
						getCategoryNameIndex = _.findWhere(fleetCategories, {
							id : _eventCategory
						});
						if (getCategoryNameIndex) {
							obj.fleetCategoryEnum = getCategoryNameIndex.value;
						}
					});
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

			getAlarmsForExport : function(options) {

				// Query Params will change depending on the node type and whether
				// we've got start/end times, so let's build that string here.
				/* var queryParams = '?consolidate=' + options.consolidate +
				'&onlyActive=' + options.isActive;*/

				//  service/eventservice/customer/{customerid}/enterprise/{enterpriseid}/export?onlyActive=true&format=csv&nodeId={nodeid}&startTime={startTime}&endTime={endTime}
				var queryParams = '?onlyActive=' + options.isActive + '&format=csv';
				if (options.nodeId) {
					queryParams += '&nodeId=' + options.nodeId;
				}
				if (options.startTime) {
					queryParams += '&startTime=' + options.startTime;
				}
				if (options.endTime) {
					queryParams += '&endTime=' + options.endTime;
				}
				// Route to play . Service expects /customer/cid/enterprise/eid/export as path even if eid is null
				var restUrl = '/customer/' + escape(options.customerId) + '/enterprise/' + escape(options.enterpriseId) + '/export' + queryParams;

				var dt = new Date();
				return restUrl;

			},

			getAlarmPlot : function(plotType, options, sourceID) {

				// Query Params will change depending on the node type and whether
				// we've got start/end times, so let's build that string here.
				var queryParams = sourceID;

				if (options.startTime) {
					queryParams += '&start=' + options.startTime;
				}
				var dt = new Date();
				if (options.endTime) {
					queryParams += '&end=' + options.endTime;
				}

				return $http({
					// url: 'stub/alarms.json' + queryParams,
					url : '/api/v2/proxy' + "?ts=" + dt.getTime(),
					headers : {
						'Service-End-Point' : api.url + 'eventservice/customer/' + escape(options.customerId) + '/enterprise/' + escape(options.enterpriseId) + '/plottrend?sourceId=' + queryParams
					},

					method : 'GET'
				}).then(function(response) {
					return response.data;
				});
			},

			getMachineService : function(customerId, options, sourceID) {

				// Query Params will change depending on the node type and whether
				// we've got start/end times, so let's build that string here.
				//http://3.39.74.125:9090/service/machineservice/enterprise/{enterpriseId}/machine/{machineId}

				$log.info("Get Machine Service: " + options + " Source ID: " + sourceID);

				var queryParams = sourceID;

				return $http({
					// url: 'stub/alarms.json' + queryParams,
					url : '/api/v2/proxy',
					headers : {
						'Service-End-Point' : api.url + 'machineservice/customer/' + escape(customerId) + '/enterprise/' + escape(options) + '/machine/' + queryParams
					},
					method : 'GET'
				}).then(function(response) {
					//debugger;
					return response.data;
				});
			},

			getMachineForEventSource : function(customerId, enterpriseId, sourceID, assetId) {

				// Query Params will change depending on the node type and whether
				// we've got start/end times, so let's build that string here.
				//http://3.39.74.125:9090/service/machineservice/enterprise/{enterpriseId}/machine/{machineId}

				//$log.info("Get Machine Service: "+options+ " Source ID: "+sourceID);
				//   http://localhost:9090/service/machineservice/customer/QA/enterprise/BayStation_3043493b-0b5d-4fa2-9fc1-1e64431de3f2/machineForEventSource/1318
				var queryParams = sourceID;
				return $http({
					// url: 'stub/alarms.json' + queryParams,
					url : '/api/v2/proxy',
					headers : {

						'Service-End-Point' : api.url + 'machineservice/customer/' + escape(customerId) + '/enterprise/' + escape(enterpriseId) + '/asset/' + assetId + '/machineForEventSource/' + queryParams
					},
					method : 'GET'
				}).then(function(response) {
					if ( typeof (response.data.response) != "string") {
						return response.data;
					} else {
						return 0;
					}

				});
			},

			getWaveform : function(plotType, options, eventTime, sourceID) {
				if (plotType == "alarm-plot") {
					return $http({
						url : '/api/v2/proxy',
						headers : {
							'Service-End-Point' : api.url + 'eventservice/customer/' + escape(options.customerId) + '/enterprise/' + escape(options.enterpriseId) + '/plotwaveform?sourceId=' + sourceID + '&eventTime=' + eventTime
						},

						method : 'GET'
					}).then(function(response) {
						return response.data;
					});
				}
			},
			getWaveformSS : function(options, sourceID, tags) {

				var queryParams = '&tagIds=[' + tags + ']';

				if (options.startTime) {
					queryParams += '&start=' + options.startTime;
				}
				var dt = new Date();
				if (options.endTime) {
					queryParams += '&end=' + options.endTime;
				}

				return $http({
					// url:'stub/smartsignalWaveform.json',
					url : '/api/v2/proxy',
					headers : {
						'Service-End-Point' : api.url + 'eventservice/customer/' + escape(options.customerId) + '/enterprise/' + escape(options.enterpriseId) + '/plottrend?sourceId=' + sourceID + queryParams

						//  'Service-End-Point':'http://3.39.74.136:9090/service/eventservice/customer/CD/enterprise/Fleet_5d5dd94e-a5d4-4cca-a019-e9ab38f25fc0/plottrend?sourceId=0f1a36fa-4a87-4cbc-896d-ed01ddd7e956&tagIds=[728e618c-d16e-4040-9e2b-557fbc028839,4d2e0392-cb7a-46ba-a624-7a4f4618f1c1]&start=06-18-14%2016:31&end=07-02-14%2016:31'
					},
					method : 'GET'
				}).then(function(response) {
					return response;
				});
			},

			getAlarmCategoryData : function(options, getChartJSON) {

				if (options == "category") {
					return $http({
						url : 'stub/alarmCategoryData.json',
						method : 'GET'
					}).then(function(response) {
						return response.data;
					});
				} else {
					if (options == "time-series") {
						return $http({
							url : 'stub/alarmLineChartData.json',
							method : 'GET'
						}).then(function(response) {
							return response.data;
						});
					} else {
						if (options == "time-series") {
							return $http({
								url : 'stub/alarmLineChartDataSubgroup2.json',
								method : 'GET'
							}).then(function(response) {
								return response.data;
							});
						} else {
							if (options == "alarm-plot") {
								console.log("Reading alarm Data in service");
								return $http({
									url : 'stub/SETrend.json',
									method : 'GET'
								}).then(function(response) {
									return response.data;
								});
							}

						}
					}
				}
			},

	    updateStatus : function(options,isEnterprise,isNode){

		    var dt = new Date();
		    var queryParams;
		      
		    if(options.customerId.length>0){
		        queryParams = '/customer/' + escape(options.customerId);
		    } else return;
		    if((typeof(options.enterpriseId)!=="undefined") && (options.enterpriseId.length>0)){
		        queryParams += '/enterprise/' + escape(options.enterpriseId);
		    }
		    if(options.nodeId && (typeof(options.nodeId)!=="undefined") && (options.nodeId.length>0)){
		        queryParams += '/node/' + escape(options.nodeId);
		    }

		    if(isEnterprise && !isNode) {
		          return $http({

		           url : '/api/v2/proxy' + "?ts=" + dt.getTime(),
		           headers: {
		              'Service-End-Point' : api.url + 'nodeservice'+ queryParams + '/getEnterpriseWithHealth'
		            },
		            method: 'GET'
		          }).then(function(response){
		            return response.data.response;
		          });
		    } 
		    if(isNode) {
		        return $http({
		           url : '/api/v2/proxy' + "?ts=" + dt.getTime(),
		           headers: {
		           'Service-End-Point' : api.url + 'nodeservice'+queryParams + '/getNodeWithHealth'
		           },
		          method: 'GET'
		        }).then(function(response){
		            return response.data.response;
		        });
		    }
		}
		}

	}])

});
