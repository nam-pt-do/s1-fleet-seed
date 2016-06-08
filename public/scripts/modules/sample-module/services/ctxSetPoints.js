/*global define */
define(['angular', 'services-module'], function (angular, services) {
    'use strict';

    /* Services */
    //Factory for global variables; includes customerId, enterpriseId, nodeId, user, fleet, state

    services.factory('ctxSetpoints', ['UserSelections', function (UserSelections) {

        var setpointCollection = [];
        var setValues = function (sev, value) {
            setpointCollection.push({type: sev, value: value});
        };
        return {
            getPlotSetpoints: function () {
                return setpointCollection;
            },
            setPlotSetpoints: function (sev, type, value, color, symbol) {
                setpointCollection.push({level: sev, type: type, value: value, color: color, symbol: symbol});
            },
            resetPlotSetpoints: function () {
                setpointCollection.length = 0;
            }
        };
    }])
});
