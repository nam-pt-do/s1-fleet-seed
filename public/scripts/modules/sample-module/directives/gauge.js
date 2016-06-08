/*global define */
define(['angular', 'directives-module'], function (angular, directives) {
    'use strict';

    /* Directives  */
    directives.directive('iidxNgGauge', [function () {
        return {
            restrict: 'AE',
            scope: {
                min: '=min',
                max: '=max',
                value: '=value',
                t1: '=',
                t2: '=',
                color: '=',
                high: '=',
                low: '=',
                med: '=',
                total: '=',
                item: '=',
                gotoAlarms: '&'
            },
            link: function (scope, elem, attr) {
                //scope.totalAlarms = scope.high+scope.low+scope.med;
                scope.diffAlarms = "";

                elem.on("click", function () {
                    scope.gotoAlarms(scope.item, 'All', scope.total); // fires alert
                });
            },
            template: '' +
            '<div>' +
            '<svg viewBox="0 0 200 170" preserveAspectRatio="xMidYMid meet" height="150" width="160">' +
            '<g transform="translate(100, 100)"> ' +
            '<title>Index: {{value +' % ' || "NA"}}</title>' +
            '<path d="M -90,0 A 90,90 0 1,1 90,0 L 54,0 A 54,54 0 1,0 -54,0 Z" fill="{{color}}"></path> ' +
            '<path d="M 0,-5 A 5,5 0 1,1 0,5 L -80,1 A 1,1 0 1,1 -80,-1 Z" fill="black" ng-attr-transform="rotate({{(value - min) / (max - min) * 180}})">' +
            '</path> ' +
            '<g ng-attr-transform="rotate({{(t2 - min) / (max - min) * 180}})"> ' +
            '<title>Max Threshold: {{t2 +' % ' || "NA"}}</title>' +
            '<line x1="-90" y1="0" x2="-81" y2="0"  stroke="black" stroke-width="2"></line> ' +
            '<path d="M -100,5 L -100,-5 L -91,0 Z" fill="black"></path> ' +
            '</g>' +
            '<g ng-attr-transform="rotate({{(t1 - min) / (max - min) * 180}})"> ' +
            '<title>Min Threshold: {{t1+' % ' || "NA"}}</title>' +
            '<line x1="-90" y1="0" x2="-81" y2="0"  stroke="black" stroke-width="2"></line> ' +
            '<path d="M -100,5 L -100,-5 L -91,0 Z" fill="black"></path> ' +
            '</g>' +
            '<a ng-if="total!=\'NA\'"><text x="-90" y="10" text-anchor="start" font-size="16">' +
            '<tspan x="-90" y="25">{{total}}</tspan>' +
            '<tspan x="-90" y="47">TOTAL</tspan>' +
            '<tspan x="-90" y="67">ALARMS</tspan>' +
            '</text></a>' +
            '<text x="-90" y="10" text-anchor="middle" font-size="16">' +
            '<tspan x="0" y="25">{{value}} %</tspan>' +
            '</text>' +
            '<text ng-if="high!=\'NA\'" x="95" y="25" text-anchor="end" font-size="16">' +
            '<tspan x="95" y="25">HIGH {{high}}</tspan>' +
                /*'<a><tspan x="95" y="25">HIGH {{high}}</tspan></a>'+
                 '<a><tspan x="95" y="47">MED {{med}}</tspan></a>'+
                 '<a><tspan x="95" y="67">LOW {{low}}</tspan></a>'+*/
            '</text>' +
            '<text ng-if="med!=\'NA\'" x="95" y="47" text-anchor="end" font-size="16">' +
            '<tspan x="95" y="47">MED {{med}}</tspan>' +
                /*'<a><tspan x="95" y="25">HIGH {{high}}</tspan></a>'+
                 '<a><tspan x="95" y="47">MED {{med}}</tspan></a>'+
                 '<a><tspan x="95" y="67">LOW {{low}}</tspan></a>'+*/
            '</text>' +
            '<text ng-if="low!=\'NA\'" x="95" y="67" text-anchor="end" font-size="16">' +
            '<tspan x="95" y="67">LOW {{low}}</tspan>' +
                /*'<a><tspan x="95" y="25">HIGH {{high}}</tspan></a>'+
                 '<a><tspan x="95" y="47">MED {{med}}</tspan></a>'+
                 '<a><tspan x="95" y="67">LOW {{low}}</tspan></a>'+*/
            '</text>' +
            '</g>' +
            '</svg>' +
            '</div>'
        };
    }])
    return directives;
});
