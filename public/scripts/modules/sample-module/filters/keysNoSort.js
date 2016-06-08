/*global define */
define(['angular', 'filters-module'], function(angular, filters) {
    'use strict';

    /* Filters */
    //Custom filter to paginate alarms table
    filters.filter('keysNoSort', [function () {
        return function (input) {
            if (!input) {
                return [];
            }
            return Object.keys(input);
        }
    }])
    return filters;
});

