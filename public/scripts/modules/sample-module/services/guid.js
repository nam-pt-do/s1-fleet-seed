/*global define */
define(['angular', 'services-module'], function(angular, services) {
    'use strict';

    /* Services */
    services.factory('$guid', ['$log', '$http', 'api', function ($log, $http, api) {
        // todo: factories names should not contain a $ prefix
        return {

            /**
             * GET the current user
             * @return {object}      Response
             */
            getGuidToken: function (options) {
                var dt = new Date();
                return $http({
                    // url: 'stub/currentUser.json',
                    url: '/api/v2/proxy' + "?ts=" + dt.getTime(),
                    headers: {
                        'Service-End-Point': api.url + 'guidservice/getGUID'
                        //'Service-End-Point': 'http://3.39.74.136:9090/service/guidservice/getGUID'
                    },
                    method: 'GET'
                }).then(function (response) {
                    return response.data;
                });
            }
            // todo: there is no error handling in this function...there should be a catch in case something fails
        }

    }])
});
