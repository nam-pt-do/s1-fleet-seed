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
    services.factory('$analysis', ['$log', '$http', 'api', function ($log, $http, api) {
        // todo: do not prefix the factory names with a $
        // todo: need to address error handling in functions
        return {
            //getPointsAndVariables: function (customerId, options, sourceID) {
            //    // Query Params will change depending on the node type and whether
            //    // we've got start/end times, so let's build that string here.
            //    //http://3.39.74.125:9090/service/machineservice/enterprise/{enterpriseId}/machine/{machineId}
            //
            //    $log.info("Get Machine Service: " + options + " Source ID: " + sourceID);
            //
            //    var queryParams = sourceID;
            //    return $http({
            //        //   url: 'stub/analysis.json',
            //        url: '/api/v2/proxy',
            //        headers: {
            //            'Service-End-Point': api.url +
            //            'machineservice/customer/' + escape(customerId) + '/enterprise/' + escape(options) +
            //            '/machine/' + queryParams + '/variables'
            //        },
            //        method: 'GET'
            //    }).then(function (response) {
            //        //debugger;
            //        console.log("Analysis Service Call: " + api.url + queryParams + '/variables');
            //        return response.data;
            //    });
            //}

        }

    }])
});
