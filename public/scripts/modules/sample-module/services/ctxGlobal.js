/*global define */
define(['angular', 'services-module'], function (angular, services) {
    'use strict';

    /* Services */
    //Factory for global variables; includes customerId, enterpriseId, nodeId, user, fleet, state

    services.factory('ctxGlobal', ['$rootScope', function ($rootScope) {
        var customerId = '';
        var enterpriseId = '';
        var enterpriseNode = '';
        var nodeId = '';
        var selectedNodeObj = null;
        var user;
        var fleet = '';
        var state;
        var authMode;
        var plotSelections = {};
        var childNodeIds = [];
        var transitioningState = '';
        var previousState = ''
        var assetTreePath = [];
        var assetTreeNamePath = [];

        $rootScope.$on('$stateChangeStart', function (evt, toState, toParams, fromState, fromParams) {
            transitioningState = toState.name;
            previousState = fromState.name;

            /*if(toState != fromState){
             if(toParams == fromParams)  return;
             if(toParams.customerId) customerId = toParams.customerId
             else customerId = '';
             if(toParams.enterpriseId) enterpriseId = toParams.enterpriseId;
             else enterpriseId = '';
             if(toParams.nodeId) nodeId = toParams.nodeId;
             else nodeId = '';

             }*/
        });
        return {
            getCustomerId: function () {
                return customerId;
            },
            getEnterpriseId: function () {
                return enterpriseId;
            },
            getEnterpriseNode: function () {
                return enterpriseNode;
            },
            getNodeId: function () {
                return nodeId;
            },
            getSelectedNode: function () {
                return selectedNodeObj;
            },
            getUser: function () {
                return user;
            },
            getAuthMode: function () {
                return authMode;
            },
            getFleet: function () {
                return fleet;
            },
            getState: function () {
                return state;
            },
            getFromState: function () {
                return previousState
            },
            getTransitioningState: function () {
                return transitioningState
            },
            getPlotSelections: function () {
                return plotSelections;
            },
            getChildNodeIds: function () {
                return childNodeIds;
            },
            getBrowser: function () {
                var sAgent = window.navigator.userAgent;
                var Idx = sAgent.indexOf("MSIE");
                // If IE, return version number.
                if (Idx > 0)
                    return parseInt(sAgent.substring(Idx + 5, sAgent.indexOf(".", Idx)));
                // If IE 11 then look for Updated user agent string.
                else if (!!navigator.userAgent.match(/Trident\/7\./))
                    return 11;
                else
                    return 0; //It is not IE
            },
            getAssetTreePath: function (value) {
                return assetTreePath;
            },
            getAssetNameTreePath: function (value) {
                return assetTreeNamePath;
            },
            setCustomerId: function (value) {
                customerId = value;
            },
            setEnterpriseId: function (value) {
                enterpriseId = value;
            },
            setEnterpriseNode: function (value) {
                enterpriseNode = value;
            },
            setNodeId: function (value) {
                nodeId = value;
            },
            setSelectedNode: function (value) {
                selectedNodeObj = value;
            },
            setUser: function (value) {
                user = value;
            },
            setFleet: function (value) {
                fleet = value;
            },
            setState: function (value) {
                state = value;
            },
            setAuthMode: function (value) {
                authMode = value;
            },
            setPlotSelections: function (value) {
                plotSelections = value;
            },
            setChildNodeIds: function (value) {
                childNodeIds = value;
            },
            setAssetTree: function(pathArray, pathNameArray){   
                if(!pathArray){
                    assetTreePath.length = 0;
                    assetTreeNamePath.length = 0;
                }
                else{
                    assetTreePath.length = 0;
                    assetTreePath = pathArray;
                    assetTreeNamePath = pathNameArray;
                }
            }
        }
    }])
});
