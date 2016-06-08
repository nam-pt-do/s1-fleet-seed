/*global define */
define(['angular', 'filters-module'], function(angular, filters) {
    'use strict';

    /* Filters */
    filters.filter('startFrom', [function () {
        return function (input, start) {
            if ($.isArray(input)) {
                start = +start; //parse to int
                return input.slice(start);
            }
        }
    }])

    return filters;
});

