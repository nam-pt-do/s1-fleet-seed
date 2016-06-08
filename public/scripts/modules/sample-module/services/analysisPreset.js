/*global define */
define(['angular', 'services-module'], function(angular, services) {
    'use strict';

    /* Services */
    services.service('analysisPreset', ['$log', '$http', 'api', function ($log, $http, api) {
        return {
            read: function (customerId, presetId, presetType) {
                var dt = new Date();
                // var path = '/getPreset/'+ customerId +  '/' + presetId + '/' + presetType;
                //var path = api.url + 'AnalysisPresets/getPreset/' + customerId + '/' + presetId + '/' + presetType;
                var path = api.url + 'AnalysisPresets/getPreset/null/' + presetId + '/' + presetType;
                path = path.split(' ').join('');

                return $http({
                    method: 'GET',
                    url: '/api/v2/proxy' + "?ts=" + dt.getTime(),
                    headers: {
                        //'Service-End-Point' : api.url + 'enterpriseservice/user/' + escape(options.userId) + '/enterprise'
                        'Service-End-Point': path
                    }
                }).then(function (response) {
                    return response;
                });
            },
            readAll: function (customerId, userId) {
                var dt = new Date();
                /*url: '/api/v2/proxy' + "?ts=" + dt.getTime(),
                 headers: {

                 'Service-End-Point' :  api.url +  'enterpriseservice/user/' + escape(options.userId) + '/enterprise'
                 },
                 method: 'GET'*/

                //var path = '/listPresets/'+ customerId +  '/' + userId;
                //var path = api.url + 'AnalysisPresets/list/' + customerId + '/' + userId;
                var path = api.url + 'AnalysisPresets/list/null/' + userId;
                path = path.split(' ').join('');
                //var path = '/stub/analysis_demoUser.json';
                return $http({
                    method: 'GET',
                    url: '/api/v2/proxy' + "?ts=" + dt.getTime(),
                    headers: {
                        //'Service-End-Point' : api.url + 'enterpriseservice/user/' + escape(options.userId) + '/enterprise'
                        'Service-End-Point': path
                    }
                }).then(function (response) {
                    return response.data;
                });
            },
            save: function (obj) {


                var dt = new Date();

                var customerId = obj.customerId;
                var userId = obj.userId;
                var presetId = (!obj.presetId) ? null : obj.presetId;
                var presetName = obj.presetName;
                var presetType = obj.presetType;

                delete obj.customerId;
                delete obj.userId;
                delete  obj.presetId;
                delete obj.presetName;
                delete  obj.presetType;

                //var path = api.url + 'AnalysisPresets/save/' + customerId + '/' + userId + '/' + presetId + '/' + presetName + '/' + presetType;
                var path = api.url + 'AnalysisPresets/save/null/' + userId + '/' + presetId + '/' + presetName + '/' + presetType;
                path = path.split(' ').join('');
                return $http({
                    method: 'POST',
                    url: '/api/v2/proxy' + "?ts=" + dt.getTime(),
                    data: obj.charts,
                    headers: {
                        'Content-Type': 'text/plain',
                        //'Service-End-Point' : api.url + 'enterpriseservice/user/' + escape(options.userId) + '/enterprise'
                        'Service-End-Point': path
                    }
                    //url: '/assets/stub/analysispreset.json'
                }).then(function (response) {
                    return response.data;
                });
            },
            delete: function (customerId, userId, presetId, presetType) {

                var dt = new Date();
                //var path = api.url + 'AnalysisPresets/delete/' + customerId + '/' + userId + '/' + presetId + '/' + presetType;
                var path = api.url + 'AnalysisPresets/delete/null/' + userId + '/' + presetId + '/' + presetType;
                path = path.split(' ').join('');
                return $http({
                    method: 'GET',
                    url: '/api/v2/proxy' + "?ts=" + dt.getTime(),
                    headers: {
                        'Service-End-Point': path
                    }
                }).then(function (response) {
                    return response.data;
                });
            }
        };
    }])
});