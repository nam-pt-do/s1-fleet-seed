/* global angular */
'use strict';

/**
 * This service contains methods for managing enterprises.
 */

/*global define */
define(['angular', 'services-module'], function(angular, services) {
  'use strict';

  /* Services */
  services.factory('$enterprises', ['$log', '$http', 'api', function ($log, $http, api) {

    return {

      /**
       * GET the list of enterprises
       * @param  {object} options
       * @return {response}      The service response.
       */
      getEnterprises: function (options) {
        var dt = new Date();
        return $http({
          // url: 'stub/enterprises.json',
          url: '/api/v2/proxy' + "?ts=" + dt.getTime(),
          headers: {
            //'Service-End-Point' : api.url + 'enterpriseservice/user/' + escape(options.userId) + '/enterprise'
            'Service-End-Point': api.url + 'enterpriseservice/user/' + escape(options.userId) + '/enterprise'
          },
          method: 'GET'
        }).then(function (response) {
          return response.data;
        });
      },

      /**
       * Update an existing enterprise
       * @param  {object} options
       * @return {object}      Response
       */
      updateEnterprise: function (enterprise, token) {
        var dt = new Date();
        delete enterprise.disableEdit;
        delete enterprise.disableDelete;
        return $http({
          url: '/api/v2/proxy' + "?ts=" + dt.getTime(),
          headers: {
            'Service-End-Point': api.url + 'enterpriseservice/customer/' + escape(enterprise.customerId) +
            '/enterprise/' + escape(enterprise.enterpriseId) + '/token/' + token
            /*'Service-End-Point' : 'http://3.39.74.136:9090/service/enterpriseservice/customer/' + escape(enterprise.customerId) +
             '/enterprise/' + escape(enterprise.enterpriseId)*/
          },
          data: enterprise,
          method: 'PUT'
        }).then(function (response) {
          return response.data;
        });
      },

      deleteEnterprise: function (enterprise, token) {
        var dt = new Date();
        delete enterprise.disableEdit;
        return $http({
          url: '/api/v2/proxy' + "?ts=" + dt.getTime(),
          headers: {
            'Service-End-Point': api.url + 'enterpriseservice/customer/' + escape(enterprise.customerId) +
            '/enterprise/' + escape(enterprise.enterpriseId) + '/token/' + token
            /*'Service-End-Point' : 'http://3.39.74.136:9090/service/enterpriseservice/customer/' + escape(enterprise.customerId) +
             '/enterprise/' + escape(enterprise.enterpriseId)*/
          },
          data: enterprise,
          method: 'DELETE'
        }).then(function (response) {
          return response.data;
        });
      }

    };

  }])
});
