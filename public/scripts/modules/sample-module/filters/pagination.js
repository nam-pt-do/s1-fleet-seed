/*global define */
define(['angular', 'filters-module'], function(angular, filters) {
    'use strict';

    /* Filters */
    //Custom filter to paginate alarms table
    filters.filter('pagination', [function () {
        return function (input, start) {
            if (input) {
                if (start > 0) {
                    start = +start;
                    return input.slice(start);
                }
                else {

                    return input;
                }
            }
        };
    }])

    return filters;
});

