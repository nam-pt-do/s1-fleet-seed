/* global angular */
'use strict';

/**
 * Asset Hierarchy Service Connector
 * @author: Pete Butler - pete.butler@ge.com
 * @deps: Angular.js (v1.2+)
 *
 * This service provides methods for retrieving the asset hierarchy and
 * the statuses for that hierarchy.
 */
//////////////////////THIS FILE IS NO LONGER USED ///////////////
/*global define */
define(['angular', 'services-module'], function(angular, services) {
    'use strict';

    /* Services */
    services.factory('$assets', ['$log', '$http', 'api', '$timeout', function ($log, $http, api, $timeout) {
        return {

            /**
             * GET the asset hierarchy
             * @return {object} Response
             */
            getHierarchy: function (options) {
                console.log('getHierarchy called from assets.js',options);
                var dt = new Date();
                return $http({

                url: '/dataController/proxy'+ "?ts=" + dt.getTime(),
                headers: {
                 //  //'Service-End-Point' : 'http://3.39.79.2:9090/service/healthInfoservice/healthInfo/customer/QA?includeChildNodes=all'
                'Service-End-Point' : api.url + 'groupservice/customer/' + escape(options.customerId) + '/groupEnterprises/fleet'
                },
                method: 'GET'
                }).then(function(response){
                return response.data;
                });
            },
            getHeaders : function(options){
              return $http.get('stub/headerMetaData.json');
            },
            getStatus: function (options) {
               
                var dt = new Date();
                var isEnterprise;
                var isNode;
                var queryParams;
                if(options.customerId.length>0){
                queryParams = '/customer/' + escape(options.customerId);
                } else return;
                //options.enterpriseId = "Platform_H_fae93dce-875b-4d57-80b3-7505a151f71d";
                if((typeof(options.enterpriseId)!=="undefined") && (options.enterpriseId.length>0)){
                isEnterprise = true;
                queryParams += '/enterprise/' + escape(options.enterpriseId);
                }
                queryParams +='/getNodesWithHealth'
                  //Logic: If there is no Node ID then remove it from the URL
                if(options.nodeId && (typeof(options.nodeId)!=="undefined") && (options.nodeId.length>0)){
                isNode = true;
                queryParams += '/' + escape(options.nodeId);
                }
                if(isEnterprise) {
                      return $http({

                       url: '/dataController/proxy'+ "?ts=" + dt.getTime(),
                       headers: {
                       //  //'Service-End-Point' : 'http://3.39.79.2:9090/service/healthInfoservice/healthInfo/customer/QA?includeChildNodes=all'
                          'Service-End-Point' : api.url + 'enterpriseservice'+queryParams
                        },
                        method: 'GET'
                      }).then(function(response){
                        return response.data;
                      });
                }
                if(isNode) {
                return $http({

                  
                   url: '/dataController/proxy'+ "?ts=" + dt.getTime(),
                   headers: {
                     //  //'Service-End-Point' : 'http://3.39.79.2:9090/service/healthInfoservice/healthInfo/customer/QA?includeChildNodes=all'
                     'Service-End-Point' : api.url + 'nodeservice'+queryParams
                   },
                  method: 'GET'
                }).then(function(response){
                    return response.data;
                });
                }
            }
        }
    }])
});