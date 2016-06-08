/*global define */
define(['angular', 'services-module'], function (angular, services) {
    'use strict';

    /* Services */
    //Factory for global variables; includes customerId, enterpriseId, nodeId, user, fleet, state

    services.factory('DropdownMenuList', ['UserSelections', function (UserSelections) {

        var widgetOptions = UserSelections.getWidgetOptions();
        var items = [
            {
                name: 'Name', val: 'name', default: false, selected: false, id: 'name'
            },
            {
                name: 'Asset Protection', val: 'system1AP', default: false, selected: false, id: 's1MachinePIndex'
            },
            {
                name: 'Asset Management', val: 'system1AM', default: false, selected: false, id: 's1MachineCMIndex'
            },
            {
                name: 'Asset Combined', val: 'system1AC', default: false, selected: false, id: 's1MachineCIndex'
            },
            {
                name: 'Instrumentation Protection',
                val: 'system1IP',
                default: false,
                selected: false,
                id: 's1InstProtectionIndex'
            },
            {
                name: 'Instrumentation Management', val: 'system1IM', default: false, selected: false, id: 's1InstCMIndex'
            },
            {
                name: 'Instrumentation Combined', val: 'system1IC', default: false, selected: false, id: 's1InstCIndex'
            },
            {
                name: 'SmartSignal', val: 'smartsignal', default: false, selected: false, id: 'ssPIndex'
            },
            {
                name: 'Performance', val: 'performance', default: false, selected: false, id: 'tpIndex'
            }
        ];
        var sortType = UserSelections.getSortType();
        var setOptions = function () {
            for (var j = 0; j < items.length; j++) {
                widgetOptions[items[j].id] == 'off' ? items[j].selected = false : items[j].selected = true;
            }

            if (sortType) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].val == sortType) {
                        items[i].default = true;
                    }
                }
            } else {
                sortType = items[0].val;
                items[0].default = true;
            }
        }

        setOptions();
        return {
            setddmenuList: function (value) {
                items = value;
            },
            getddmenuList: function () {
                return items;
            }
        }
    }])
});
