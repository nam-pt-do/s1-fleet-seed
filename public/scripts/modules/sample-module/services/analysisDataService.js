/*global define */
define(['angular', 'services-module'], function(angular, services) {
    'use strict';

    /* Services */
    services.factory('tagsService', ['$http', function ($http) {
        return {
            getTags: function (customerId, siteId, lineupId) {
                var path = "tags/" + customerId + "/" + siteId + "/" + lineupId;
                path = path.split(' ').join('');
                
                return $http({
                    method: 'GET',
                    //url: path
                    url: '/stub/analysisTag.json',
                }).then(function (response) {
                        return response.data;
                    });
            }
        };

    }])
    services.factory('tagsValueService', ['$http', 'api', function ($http, api) {
        return {
           // getTagsValues: function (custId, tags, timeRange, startTime, endTime, templateObj, algorithm, needRawData) {
            getTagsValues: function (obj) {

                    // TODO: change object back..
                     var postObject = {
                        "customerId" : "",
                        "siteId":"",
                        "lineupId":"",
                        "tags"      : "",
                        "timeRange" : "",
                        "startTime" : "",
                        "endTime"   : ""
                    };

                    var path = "/api/v2/proxy";
                    //var path = "/stub/tagVals.json";
                    return $http({
                        method: 'POST',
                        //method: 'GET',
                        url: '/api/v2/proxy',
                        // headers: {
                        //     'Service-End-Point' : api.url + '/tagsValues'
                        // },
                        data : postObject
                    }).then(function (response) {
                            return response.data;
                        });
            //     }

            }
        }
    }])
    services.factory('tagsRawValueService', ['$http', function ($http) {
        return {
            getTagsRawValues: function (path) {
                return $http({
                    method: 'GET',
                    url: path
//                    url: '/assets/stub/analysisRawData.json'
                }).then(function (response) {
                        return response.data;
                });
            }

        };
    }])
    });