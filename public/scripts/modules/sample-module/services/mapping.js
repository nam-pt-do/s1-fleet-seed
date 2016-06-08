
/*global define */
define(['angular', 'services-module'], function(angular, services) {
    'use strict';
//http://3.39.65.107:9090/service/mappingservice/customer/GE/mapping/file?primarySystem=SYSTEM1
    services.factory('$mapping', ['$log', '$http', 'api', function ($log, $http, api) {
        return {

            uploadFile: function (fd, customerID, pSystem, token) {
                var dt = new Date();
                var uploadUrl = '/customer/' + escape(customerID) + '/mapping/upload?primarySystem=' + pSystem + '&token=' + token + '&ts=' + dt.getTime();
                return $http({
                    url: uploadUrl,
                    headers: {
                        'Content-Type': undefined
                    },
                    data: fd,
                    cache: false,
                    transformRequest: function (data) {
                        return data;
                    },
                    method: 'POST'
                }).then(function (upresponse) {
                    return upresponse;
                    //TODO: Remove-Never hit code
                    //console.log("Services Mapping: ",response);
                });

            },
            getMappingHierarchy: function (customerID, pSystem) {
                var dt = new Date();
                var mapUrl = 'mappingservice/customer/' + escape(customerID) + '/mapping?primarySystem=' + pSystem;
                return $http({
                    url: '/api/v2/proxy' + "?ts=" + dt.getTime(),
                    // url: 'stub/mapping.json', use this to test
                    headers: {
                        'Service-End-Point': api.url + mapUrl
                    },
                    method: 'GET'
                }).then(function (response) {
                    return response.data;
                });
            },
            downloadFile: function (customerID, pSystem) {
                var dt = new Date();
                return $http({
                    url: '/customer/' + escape(customerID) + '/mapping/download?primarySystem=' + pSystem + '&ts=' + dt.getTime(),
                    headers: {},
                    method: 'GET'
                }).then(function (response) {
                    console.log("Download Link:" + response);
                    return (api.url + 'customer/' + escape(customerID) + '/mapping/download?primarySystem=System1');
                })

            }
        };
    }])
});
