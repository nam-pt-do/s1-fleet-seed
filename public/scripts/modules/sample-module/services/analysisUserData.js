/*global define */
define(['angular', 'services-module'], function(angular, services) {
    'use strict';

    /* Services */
    services.service('userData', ['$http', function($http) {
        return {
            read: function () {
                return $http({
                    method: 'GET',
                    url: '/stub/analysis_userData.json'
                }).then(function (response) {
                    return response.data;
                });
            }
        };
    }])
});