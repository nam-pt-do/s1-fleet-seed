/*global define */
define(['angular', 'directives-module'], function (angular, directives) {
    'use strict';

    /* Directives  */
    directives.directive('onoffSwitch', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
        return {
            restrict: 'A',
            scope: {
                switchOn: '=',
                isDisabled: '='
            },
            templateUrl: 'assets/views/analysis/onoffSwitch.html',
            link: function ($scope, element, attr) {

                var switchElem = $('.switch');

                switchElem.click(function () {
                    if ($scope.isDisabled) {
                        return;
                    }
                    else {
                        $(this).removeClass('disabled');
                        $(this).toggleClass('off').toggleClass('on');
                        $timeout(function () {
                            $scope.switchOn.turnOn = !$scope.switchOn.turnOn;
                        }, 0);

                    }
                });

                $scope.$watch('switchOn', function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        $scope.switchOn.turnOn = newVal.turnOn;
                    }
                    if ($scope.switchOn.turnOn === false) {
                        switchElem.addClass('off').removeClass('on');
                    }
                    else {
                        switchElem.addClass('on').removeClass('off');
                    }
                }, true);

                $scope.$watch('isDisabled', function (newVal, oldVal) {

                    if (newVal !== oldVal) {
                        $scope.isDisabled = newVal;
                    }
                    if ($scope.isDisabled) {
                        switchElem.addClass('disabled');
                        $scope.switchOn.turnOn = false;
                    }
                    else {
                        switchElem.removeClass('disabled');
                    }
                });

            }
        }
    }])
    return directives;
});