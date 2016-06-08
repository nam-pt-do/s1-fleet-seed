/*global define */
define(['angular', 'services-module'], function (angular, services) {
    'use strict';

    /* Services */
    //Factory for global variables; includes customerId, enterpriseId, nodeId, user, fleet, state

    services.factory('ctxAlarms', ['UserSelections', function (UserSelections) {

        //Variable declaration to store context values
        var alarmsTable = {};
        var chartSelection = {};
        chartSelection.chartType = 'category';
        alarmsTable.selectedColumns = [];
        var alarmsGridSort = UserSelections.getCurrentUser().preference.alarmsGridSort;
        alarmsTable.sortOrder = 'sorting_desc';
        alarmsTable.selectedColumns.push(
            {"name": "lastOccurrenceTime", "label": "Last Occurred", "type": "string", "show": true,"sort":"desc"}
            , {"name": "firstOccurrenceTime", "label": "First Occurred", "type": "string", "show": false}
            , {"name": "dataSource", "label": "Data Source", "type": "string", "show": true}
            , {"name": "normalizedSeverityLevel", "label": "Fleet Level", "type": "segment", "show": true}
            , {"name": "severityLevel", "label": "Source Level", "type": "number", "show": false}
            , {"name": "assetNamePath", "label": "Asset Path", "type": "string", "show": true}
            , {"name": "trainMachine", "label": "Asset", "type": "string", "show": true}
            , {"name": "point", "label": "Point/Variable", "type": "string", "show": true}
            , {"name": "type", "label": "Type/Message", "type": "string", "show": true}
            , {"name": "fleetCategoryEnum", "label": "Category", "type": "string", "show": false}
            , {"name": "count", "label": "Count", "type": "number", "show": true}
            , {"name": "density", "label": "Density (%)", "type": "number", "show": true}
            , {"name": "eventStateEnum", "label": "Active", "type": "string", "show": true}
            , {"name": "acknowledged", "label": "Acknowledged", "type": "string", "show": false}
            , {"name": "acknowledgedDateTime", "label": "Time of Acknowledgement", "type": "string", "show": false}
            , {"name": "eventId", "label": "Event ID", "type": "string", "show": false}
            , {"name": "sourceId", "label": "Source ID", "type": "string", "show": false}
        );
        // set the correct column header to be sorted
        for (var i=0;  i < alarmsTable.selectedColumns.length; i++) {
            if (alarmsTable.selectedColumns[i].name == alarmsGridSort){
                alarmsTable.selectedColumns[i].sort = "desc";
                break;
            }
        }
        
        alarmsTable.filterBy = 'active';

        return {
            getAlarmsTable: function () {
                return alarmsTable;
            },

            setAlarmsTableSort: function (column, sortOrder) {
                //Apply sort on selected column; the value is the column id on which you wish to sort the table
                // alarmsTable.defaultSort=value;
                //TODO- Save user preference for sort order in db and load preferences page with this value
                _.forEach(alarmsTable.selectedColumns, function (obj) {
                    delete(obj["sort"])
                });
                _.findWhere(alarmsTable.selectedColumns, {"name": column}).sort = sortOrder;

            },

            setAlarmsTableColumns: function (value) {
                _.findWhere(alarmsTable.selectedColumns, {"name": value.name}).show = value.show;
            },

            setAlarmsTableFilterRange: function (value) {
                alarmsTable.filterBy = value;
            },


            //Context to save selected row
            setAlarmsTableSelectedRow: function (value) {
                alarmsTable.selectedRow = value;
            },

            //Context for chart selections (chart type, view by)
            getChartSelection: function () {
                return chartSelection;
            },

            //Chart Type = Bar/Line/Alarm Plot
            setChartType: function (value) {
                chartSelection.chartType = value;
            },

            //View By = Event Type/Subgroup
            setChartView: function (value) {
                chartSelection.chartView = value;
            },


            //Alarm Grid Page
            setAlarmGridSize: function (value) {
                alarmsTable.alarmGridSize = value;
            }


        };
    }])
});
