/**
 * Asset Hierarchy Service Connector
 * @author: Pete Butler - pete.butler@ge.com
 * @deps: Angular.js (v1.2+)
 *
 * This service provides methods for retrieving the asset hierarchy and
 * the statuses for that hierarchy.
 */

/*global define */
define(['angular', 'services-module'], function(angular, services) {
	'use strict';

	/* Services */
	services.factory('assetsService', ['$log', '$http', 'api', '$timeout',
		function($log, $http, api, $timeout) {

			return {

				/**
				 * GET the asset hierarchy
				 * @return {object} Response
				 */
				getEnterprise : function(options) {
					var dt = new Date();
					console.log('getEnterprise called');
					return $http({
						//url : '/api/v2/proxy' + "?ts=" + dt.getTime(),
						url: 'stub/enterprises.json',
						/*
						headers : {
													///service/groupservice/customer/CD/groupWithHierarchy/fleet?includeMapping=true
													'Service-End-Point' : api.url + 'nodeservice/customer/' + escape(options.customerId) + '/getEnterprisesWithHealth'
													//'Service-End-Point' : api.url + 'groupservice/customer/' + escape(options.customerId) + '/groupWithHierarchy/fleet'
													//'Service-End-Point' : api.url + 'groupservice/customer/GE/groupEnterprises/fleet'
						
												},*/
						
						method : 'GET'
					}).then(function(response) {
						console.log('getEnterprise fetched');
						return response.data.response;
					});
				},

				getEnterpriseNodes : function(options) {
					console.log('getEnterprise nodes called');
					var dt = new Date();
					var enterpriseId = options.enterpriseId;
					var customerId = options.customerId;
					return $http({
						//url : '/api/v2/proxy' + "?ts=" + dt.getTime(),
						url: 'stub/assets.json',
						/*
						headers : {
													///service/groupservice/customer/CD/groupWithHierarchy/fleet?includeMapping=true
													'Service-End-Point' : api.url + 'nodeservice/customer/'+customerId+'/enterprise/' + options.enterpriseId + '/getEnterpriseNodesWithHealth'
													//'Service-End-Point' : api.url + 'groupservice/customer/' + escape(options.customerId) + '/groupWithHierarchy/fleet'
													//'Service-End-Point' : api.url + 'enterpriseservice/customer/GE/enterprise/' + enterpriseId + '/getNodesWithHealth'
												},*/
						
						method : 'GET'
					}).then(function(response) {
						console.log('getEnterprise nodes  fetched');
						return response.data.response;
					});
				}
			};

		}]);

});

