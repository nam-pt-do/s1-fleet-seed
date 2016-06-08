/* global angular, _, moment */
'use strict';

/**
 * A simple directive to format a table cell and its contents.
 *
 * Usage:
 *
 * <td ng-repeat="field in fieldsToShow" format data="{{alarm[field.name]}}" type="{{field.type}}">{{alarm[field.name]}}</td>
 */

/*global define */
define(['angular', 'directives-module'], function (angular, directives) {
    'use strict';

    /* Directives  */
    directives.directive('format', [function () {
        return {
            replace: true,
            template: '<td class="{{type}}" ng-bind-html="html"></td>',
            link: function (scope, element, attrs) {
                var html = '';

                switch (attrs.type) {
                    case 'dateTime':
                        html = moment(attrs.data).format('YYYY-MM-DD HH:mm:ss');
                        break;
                    case 'boolean':
                        //  html = attrs.data ? 'Yes' : 'No';
                        html = attrs.data;
                        break;
                    case 'number':
                        html = attrs.data;
                        break;
                    case 'segment':
                        html += '<div class="segmentedBar status_' + attrs.data + '">';
                        for (var i = 1; i < 6; i++) {
                            html += '<div class="bar s' + i + '"></div>';
                        }
                        html += '</div>';
                        break;
                    default:
                        html = attrs.data;
                        break;
                }

                scope.type = attrs.type;
                scope.html = html;
            }
        };
    }])
    return directives;
});
