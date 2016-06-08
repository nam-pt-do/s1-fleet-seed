/* global angular */
'use strict';

/**
 * Asset Hierarchy Service Connector
 * @author: Pete Butler - pete.butler@ge.com
 * @deps: Angular.js (v1.2+)
 *
 * This service provides methods for retrieving the node status 
 */

/*global define */
define(['angular', 'services-module'], function(angular, services) {
    'use strict';

    /* Services */
    services.factory('$details', ['$log', '$http', 'api', function ($log, $http, api) {

    return {

    
     //this call is not used at the moment
      getHeaders : function(options){

         return $http.get('stub/headerMetaData.json');
      },
        
      getNodeStatus: function(options,isEnterprise,isNode,overviewType){
    	
        var dt = new Date();
    	  var queryParams;
        if(options.customerId.length>0){
          queryParams = '/customer/' + escape(options.customerId);
          } else return;
          if((typeof(options.enterpriseId)!=="undefined") && (options.enterpriseId.length>0)){
          queryParams += '/enterprise/' + escape(options.enterpriseId);
          }
          //Logic: If there is no Node ID then remove it from the URL
          if(typeof(options.nodeId)=="undefined" || options.nodeId.length == 0) queryParams += '/node/none';
          else if(options.nodeId && (typeof(options.nodeId)!=="undefined") && (options.nodeId.length>0)){
            queryParams += '/node/' + escape(options.nodeId);
          }
          
    	
        if(!isNode && !isEnterprise) {
           return $http({
             //url : '/api/v2/proxy' + "?ts=" + dt.getTime(),
             url: 'stub/detailsTableData.json',
             /*
             headers: {
                          'Service-End-Point' : api.url + 'nodeservice/customer/' + escape(options.customerId) + '/getEnterpriseHealthDetails'
                          },*/
             
            method: 'GET'
          }).then(function(response){
               //return '/../stub/EnterpriseWithHealth.json';
               return response.data.response;
          });
        }
        if(isEnterprise && !isNode) {
          return $http({

           url : '/api/v2/proxy' + "?ts=" + dt.getTime(),
           headers: {
              'Service-End-Point' : api.url + 'nodeservice'+ queryParams + '/getNodeHealthDetails'
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
        	 'Service-End-Point' : api.url + 'nodeservice'+queryParams + '/getNodeHealthDetails'
           },
          method: 'GET'
        }).then(function(response){
            return response.data.response;
        });
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


  }; 
  }])
});

