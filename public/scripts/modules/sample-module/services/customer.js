/* global angular */
'use strict';

/**
 * This service contains methods for managing customers.
 */

/*global define */
define(['angular', 'services-module'], function(angular, services) {
  'use strict';

  /* Services */
  services.factory('$customer', ['$log', '$http', 'api', function ($log, $http, api) {

    return {

      /**
       * Given a customer, get the available fleets
       * @return {object}      Response
       */
      getFleets: function (options) {
        return $http({
          url: 'stub/fleets.json?customer=' + escape(options.customerId),
          //url: '/api/v2/proxy',
          //  'Service-End-Point' : api.url +
          //                        options.customer +
          //                        '/fleets'
          //},
          method: 'GET'
        }).then(function (response) {
          return response.data;
        });
      }

    };

  }])
});
