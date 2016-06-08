/*global define */
define(['angular', 'filters-module'], function(angular, filters) {
    'use strict';

    /* Filters */
    filters.filter('moment', [function() {
        return function(dateString, format){
            return moment(dateString).format(format);
        };
    }])

    return filters;
});

