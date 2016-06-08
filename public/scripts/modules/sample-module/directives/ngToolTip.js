/*global define */
define(['angular', 'directives-module'], function (angular, directives) {
    'use strict';

    /* Directives  */
    directives.directive('onoffSwitch', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
        return {
            restrict: 'A',
            template: '<input tooltip tooltip-placement="bottom" tooltip-trigger="focus">',
            replace: true,
            link: function (scope, element, attrs) {
                attrs.$set('tooltip', attrs['placeholder']);
            }
        }
    }])
    return directives;
});