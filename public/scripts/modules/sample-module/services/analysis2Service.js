/*global define */
define(['angular', 'services-module'], function(angular, services) {
    'use strict';

    /* Services */
    services.service('analysisService',
        [
            '$rootScope',
            '$timeout',
            'tagsService',
            'tagsValueService',
            'tagsRawValueService',
            'infoShare',

            function ($rootScope,
                   $timeout,
                   tagsService,
                   tagsValueService,
                   tagsRawValueService,
                   infoShare) {
            var __RS = $rootScope;
            var analysisGblInfo = angular.copy(infoShare);
            var self = {
                // Initial Sort Settings
                sortByPlotNew: 'centralTagName',
                sortOrderPlotNew: '', // values are '' or 'reverse'
                searchTextPlotNew: '',

                pageSize: 10,
                currentPage: 1,

                customerListArray: analysisGblInfo.customers,
                siteListArray: analysisGblInfo.sites,
                lineupListArray: analysisGblInfo.lineups,
                machineListArray: analysisGblInfo.machines,
                selectedObj: analysisGblInfo.selectedObj,

                plottedCharts: [],
                chartobjs: [],
                plotNewSelectedTags: {},
                editChartSelectedTags: {},
                //staticData:'',
                analysisContext: '',
                selectedPlottedChartForDetails: 0,
                selectedPlottedChartForEdit: 0,

                areTagsAvailable: false,
                availableTagsForCurrentContext: [],
                editChartAvailableTags: [],

                isAdmin: __RS.geAdmin || __RS.geSuper || __RS.geOper,
                sysPresetUser: __RS.geAdmin || __RS.geSuper,

                loading: false,
                isZoomApplied: false,
                showSaveAsOnly: true

            };

            self.analysisContext = {
                selectedTimeIndex: 0,
                selectedTimeZoneIndex: 1,
                selectedCustomTimeStartDt: "",
                selectedCustomTimeEndDt: ""
            };

            self.updateCtrl = function (obj) {
                $rootScope.$broadcast('service:update', obj);
            };

            self.staticData = {

                "buttons": {
                    "plotNew": {
                        "label": "analysis.button.plotnew",
                        "tooltips": "analysis.button.plotnew",
                        "actualTxt": "plot new"
                    },
                    "viewChartDetails": {
                        "label": "analysis.model.chartdetail.title",
                        "tooltips": "analysis.model.chartdetail.title"
                    },
                    "editChart": {
                        "label": "analysis.button.editchart",
                        "tooltips": "analysis.button.editchart"
                    },
                    "exportOptions": [
                        {"label": "analysis.button.saveasxls", "tooltips": "Save as XLSt"}
                    ],
                    "timeRangeOptions": [
                        {"label": "1h", "route": "oneHour", "selected": true},
                        {"label": "4h", "route": "fourHours"},
                        {"label": "12h", "route": "twelveHours"},
                        {"label": "24h", "route": "twentyFourHours"},
                        {"label": "48h", "route": "fortyEightHours"},
                        {"label": "3m", "route": "threeMonths"},
                        {"label": "6m", "route": "sixMonths"},
                        {"label": "9m", "route": "nineMonths"},
                        {"label": "1y", "route": "oneYear"},
                        {"label": "Custom", "startData": "", "endDate": "", route: "custom"}
                    ],
                    "timeZoneBtns": [
                        {
                            label: "Local Time",
                            type: "localTimeZone"
                        },
                        {
                            label: 'UTC Time',
                            type: "utcTimeZone"
                        }
                    ]
                },
                "tableHeader": [
                    {
                        "id": "Name",
                        "label": "analysis.tableheader.name"
                    }
                ]
            };

            self.updatePageSize = function (val) {
                self.pageSize = val;
                self.currentPage = 1;
            };

            // Simple toggle sort function
            self.toggleSortPlotNew = function (column) {

                if (self.sortByPlotNew === column) {

                    self.sortOrderPlotNew = self.sortOrderPlotNew === '' ? 'reverse' : '';

                } else {

                    self.sortByPlotNew = column;
                    self.sortOrderPlotNew = ''; // default for new is desc
                }
            };

            self.numberOfPagesInPlotNew = function () {

                return Math.ceil(self.availableTagsForCurrentContext.length / self.pageSize);
            };

            self.currPageEndIndexPlotNew = function () {

                var idx = (self.currentPage + 1) * self.pageSize;

                return (idx > self.availableTagsForCurrentContext.length) ? self.availableTagsForCurrentContext.length : idx;
            };

            // click on the check box from the table of plot new modal
            self.onSelectionOfTagInPlotNewChart = function (tag, idx) {

                var name = tag.siteId + tag.lineupId + tag.centralTagName;

                if (self.plotNewSelectedTags[name]) {

                    self.plotNewSelectedTags[name] = '';
                }
                else {

                    self.plotNewSelectedTags[name] = tag;
                }
            };

            self.onSelectionOfTagInEditChart = function (tag) {

                var name = tag.siteId + tag.lineupId + tag.centralTagName;

                if (self.editChartSelectedTags[name]) {

                    self.editChartSelectedTags[name] = '';
                }
                else {
                    self.editChartSelectedTags[name] = tag;
                }
            };

            // Getting selected options for the charts
            self.computeEditChartAvailableTags = function (chartIdx) {

                var editChartAvailableTags = [];
                var selectedChart = self.plottedCharts[chartIdx];
                var i, j, k;
                var temp;
                var found;

                if (selectedChart) {
                    //go through the settings for the selected chart
                    for (i in selectedChart.tags) {
                        // create object to hold current settings
                        temp = {
                            "tag": self.plottedCharts[chartIdx].tags[i],
                            "selected": true
                        };
                        // Add current settings to the list of settings to be edited
                        editChartAvailableTags.push(temp);
                    }
                    // Go through data from server and find info we need.
                    for (j in self.availableTagsForCurrentContext) {

                        found = false;
                        // Go through the settings for the selected chart
                        for (k in selectedChart.tags) {
                            // if we found a tag for our selected chart then wave flag
                            if (self.availableTagsForCurrentContext[j].centralTagName === selectedChart.tags[k].centralTagName
                                && self.availableTagsForCurrentContext[j].siteId === selectedChart.tags[k].siteId
                                && self.availableTagsForCurrentContext[j].lineupId === selectedChart.tags[k].lineupId) {

                                found = true;
                                break;
                            }
                        }
                        // if we didn't find any tags for our chart

                        if (!found) {
                            // create object with no selections to be displayed.
                            temp = {
                                "tag": self.availableTagsForCurrentContext[j],
                                "selected": false
                            };
                            // Add to list of tags to be edited.
                            editChartAvailableTags.push(temp)
                        }
                    }
                    self.editChartAvailableTags = editChartAvailableTags;
                }
            };

            self.updateCustomer = function (customerObj) {
                //update seletedObject customer
                self.selectedObj.customer = customerObj;
                self.selectedObj.site = self.siteListArray[0];
                self.selectedObj.lineup = self.lineupListArray[0];
                self.selectedObj.machine = self.machineListArray[0];

                //populate site data
                self.siteListArray.splice(1);
                self.siteListArray = self.siteListArray.concat(customerObj.sites);

                //clear the tags on change of customer
                self.availableTags = false;
                self.availableTagsForCurrentContext = [];
            };

            self.updateSite = function (siteObj) {

                self.selectedObj.site = siteObj;
                self.selectedObj.lineup = self.lineupListArray[0];
                self.selectedObj.machine = self.machineListArray[0];

                //populate lineup data
                self.lineupListArray.splice(1);
                self.lineupListArray = self.lineupListArray.concat(siteObj.lineups);

                //clear the tags on change of site
                self.availableTags = false;
                self.availableTagsForCurrentContext = [];
            };

            self.updateLineup = function (lineupObj) {

                //** update seletedObject lineup
                self.selectedObj.lineup = lineupObj;
                self.selectedObj.machine = self.machineListArray[0];

                //** populate machine data
                self.machineListArray.splice(1);
                self.machineListArray = self.machineListArray.concat(lineupObj.machines);

                //** inform root scope
                //infoShare.selectedObj.customer = self.selectedObj.customer;
                //infoShare.selectedObj.site = self.selectedObj.site;
                //infoShare.selectedObj.lineup = self.selectedObj.lineup;
                //infoShare.selectedObj.machine = self.selectedObj.machine;

                //infoShare.sites = self.siteListArray;
                //infoShare.lineups = self.lineupListArray;
                //infoShare.machines = self.machineListArray;

            };

            self.getlineupListArray = function () {
                return self.lineupListArray;
            };

            self.getsiteListArray = function () {
                return self.siteListArray;
            };

            //** request to get tags for table
            //** table specific not chart specific
            self.getTags = function (callback) {

                //self.filterApplied = true;  taken care by global filter
                self.availableTagsForCurrentContext = [];

                // ** preventing unnecessary service call
                if (!self.areTagsAvailable) {

                    tagsService.getTags(
                        self.selectedObj.customer.customerId,
                        self.selectedObj.site.siteId,
                        self.selectedObj.lineup.lineupId
                    ).then(function (response) {

                            self.areTagsAvailable = true;
                            self.availableTagsForCurrentContext = response;

                            // ** callback will assign response to scope to render table
                            callback(response);

                            // ** this is called only when this service is called from editing chart
                            // ** this is to display selected tag and adding true false for checkbox

                            //self.computeEditChartAvailableTags(self.selectedPlottedChartForEdit);
                        },
                        function (error) {
                            self.availableTags = false;
                            self.dataError(error);
                            callback(response);
                        }
                    );
                }
            };
            // *** for individual chart
            self.getTagValues = function (tags, actionType, updateType, rawData) {
                //tags = "L0659.CC0659.CR_AAKR_Etapol_1_Rec";
                var plottedChartTags = [];
                var tmRange, stDt, endDt;
                var customer = self.selectedObj.customer.customerId;
                var action = actionType;
                var opt;
                var chartDataType = updateType ? updateType : "sampling";
                var requestObj = null;
                var chartStatus = {};

                chartStatus.loading = true;
                self.updateCtrl(chartStatus);

                //tags either from plotNewSelectedTags or editChartSelectedTags
                for (opt in tags) {
                    if (tags[opt]) {
                        plottedChartTags.push(tags[opt]);
                    }
                }

                // if(plottedChartTags.length > 0) {

                //     // ** set the Time Range
                //     if (self.isZoomApplied) {
                //         tmRange = self.staticData.buttons.timeRangeOptions[self.analysisContext.selectedTimeIndex].route;
                //         stDt = self.getStartDt(tmRange, self.analysisContext.selectedCustomTimeStartDt);
                //         endDt = self.getEndDt(tmRange, self.analysisContext.selectedCustomTimeEndDt);
                //     }
                //     else {
                //         tmRange = self.staticData.buttons.timeRangeOptions[self.analysisContext.selectedTimeIndex].route;
                //         stDt = self.getStartDt(tmRange, self.analysisContext.selectedCustomTimeStartDt);
                //         endDt = self.getEndDt(tmRange, self.analysisContext.selectedCustomTimeEndDt);
                //     }

                //     requestObj = {
                //         customer : customer,
                //         tags : plottedChartTags,
                //         timeRange : tmRange,
                //         startDate : stDt,
                //         endDate : endDt,
                //         seriesType : chartDataType,
                //         isRawData : rawData ? rawData : false,
                //         templateObj : null
                //     };


                // calling service to get tags
                //tagsValueService.getTagsValues(customer, plottedChartTags, tmRange, stDt, endDt)

                tagsValueService.getTagsValues(requestObj)
                    .then(function (response) {
                        // ** returns an array of objects which have data and tag ** //
                        /********* Sample JSON Response *******
                         [
                         {
                             "tag": {
                                 "customerId": "APLCANA", "siteId": "FAIRM","lineupId": "L0039","serialNo": "C11634","centralTagName": "L0039.C11634.Base_Pressure","centralTagDesc": "-","centralTagUom": "-","stdTagName": "Base_Pressure","stdTagDesc": "-","stdTagUom": "-","dataType": "REAL","technology": "CC","dataSource": "TNWI010867hq1"
                             },
                             "data": [
                                 {
                                     "timeInMills": 1400099818251,
                                     "value": "14.73"
                                 },.......
                             ]
                         }
                         ]
                         *******************/

                        var allTagsArray = response.tagValues;
                        var plottedChart;                   // this is the MAIN OBJECT that will be passed to directive
                        var tagsInfo = [];
                        var tagValues = [];                       // value of tag
                        var chartStatus = {
                            loading: false,
                            hasTagChanged: true,
                            chart: null
                        };

                        _.each(allTagsArray, function (tObj, idx) {

                            var tagObjDataArray = tObj.data;
                            var newTagDataArray = [];
                            var tagName = tObj.tag.centralTagName;

                            _.each(tagObjDataArray, function (tagObjData, i) {

                                var t, v;
                                t = tagObjData.timeInMills * 1;  // time
                                v = tagObjData.value * 1         // value
                                newTagDataArray.push({'t': t, 'v': v});
                            });

                            tagsInfo[idx] = tObj.tag;
                            tagValues[idx] = {
                                name: tagName,
                                data: newTagDataArray
                            };
                        });

                        // ** tags and tagsValues both are arrays
                        // ** goal is to create two arrays for each tag
                        // ** one array hold the info of tag other hold info on plotting of chart

                        // plottedChart = {
                        //     "tags": tagsInfo,
                        //     "tagsValues": tagValues,
                        //     "tagNameDisplayOption": "Customer",
                        //     "rawData" : response.rawValues,
                        //     "type" : chartDataType,
                        //     "isRaw" : requestObj.isRawData
                        // };

                        plottedChart = {
                            "tags": tagsInfo,
                            "tagsValues": tagValues,
                            "tagNameDisplayOption": "Customer",
                            "rawData": response.rawValues,
                            "type": chartDataType,
                            "isRaw": false
                        };
                        // Setting the timezone offset in root scope
                        var timezone = "UTC";
                        if (plottedChart.tags[0].timezoneId) {
                            timezone = plottedChart.tags[0].timezoneId;
                        }
                        $rootScope.siteTimezone = timezone;

                        // ** plottedCharts, a list of Charts which are at displayed
                        if (action === 'updateChart') {
                            self.plottedCharts[self.selectedPlottedChartForEdit] = plottedChart;
                            chartStatus.chartIdx = self.selectedPlottedChartForEdit;
                        }
                        else {
                            self.plottedCharts.push(plottedChart);
                            __RS.$broadcast('event:plottedCharts', self.plottedCharts);
                        }

                        chartStatus.loading = false;
                        chartStatus.hasTagChanged = true;
                        chartStatus.chart = plottedChart;

                        self.updateCtrl(chartStatus); // this is required also for multiple customer validation
                    },
                    function (error) {
                        var errCode = error.data.errorCode;
                        chartStatus.loading = false;
                        if (errCode && errCode.indexOf("-111") === 0) {
                            chartStatus.error = 'Unable to get time series data from server!';
                            self.updateCtrl(chartStatus);
                        } else {
                            chartStatus.error = 'Unable to get data from server!';
                            self.updateCtrl(chartStatus);
                        }
                    }
                );
                // }

                // else{
                //     self.plottedCharts.splice(self.selectedPlottedChartForEdit, 1);
                // }
            };

            self.getavailableTagsForCurrentContext = function () {
                return self.availableTagsForCurrentContext;
            };

            self.updateAllChart = function (tObj, templateObj) {

                var tmRange = self.staticData.buttons.timeRangeOptions[tObj.tmIdx].route;
                var stDt = tObj.stDt;
                var endDt = tObj.endDt;
                var allPlottedTags = [];
                var plottedChart;
                var isTemplate = (templateObj ? true : false);
                var requestObj = null;
                var chartStatus = {};

                chartStatus.loading = true;
                self.updateCtrl(chartStatus);

                // ** get all tags' info to make request for tag values.
                _.each(self.plottedCharts, function (chart, idx) {
                    plottedChart = chart;

                    _.each(plottedChart.tags, function (tag, i) {
                        allPlottedTags.push(tag);
                    });
                });
                if (allPlottedTags.length > 0) {

                    requestObj = {
                        customer: self.selectedObj.customer.customerId,
                        tags: allPlottedTags,
                        timeRange: tmRange,
                        startDate: stDt,
                        endDate: endDt,
                        seriesType: 'sampling',
                        isRawData: false,
                        templateObj: templateObj
                    };

                    tagsValueService.getTagsValues(requestObj)

                        .then(function (response) {

                            var allTagsArray = response.tagValues;
                            var tagValuesFromServer = {};       // holds latest tag values with corrections
                            var tagInfoFromServer = {};       // holds latest tag info with all data
                            var newPlottedCharts = [];                   // this is the MAIN OBJECT that will be passed to directive

                            chartStatus.loading = false;
                            self.updateCtrl(chartStatus);

                            _.each(allTagsArray, function (tObj, idx) {

                                var tagObjDataArray = tObj.data;
                                var newTagDataArray = [];
                                var tagName = tObj.tag.centralTagName;
                                var tagInfoName = tObj.tag.centralTagName;
                                if (isTemplate) {
                                    tagInfoName = tObj.tag.stdTagName;
                                }
                                var timezone = "UTC";
                                if (tObj.tag.timezoneId) {
                                    timezone = tObj.tag.timezoneId;
                                }
                                $rootScope.siteTimezone = timezone;

                                _.each(tagObjDataArray, function (tagObjData, i) {

                                    var t, v;
                                    t = tagObjData.timeInMills * 1;  // time
                                    v = tagObjData.value * 1;        // value
                                    newTagDataArray.push({'t': t, 'v': v});
                                });
                                if (!tagValuesFromServer[tagInfoName]) {
                                    tagValuesFromServer[tagInfoName] = [];
                                }
                                tagValuesFromServer[tagInfoName].push({
                                    name: tagName,
                                    data: newTagDataArray
                                });
                                if (!tagInfoFromServer[tagInfoName]) {
                                    tagInfoFromServer[tagInfoName] = [];
                                }
                                tagInfoFromServer[tagInfoName].push({
                                    name: tagName,
                                    tagInfo: tObj.tag
                                });
                            });

                            _.each(self.plottedCharts, function (chart, cIdx) {

                                var newTagValues = [];
                                var newTagInfo = [];
                                var newPlottedChart;

                                _.each(chart.tags, function (tag, tIdx) {

                                    var tName = tag.centralTagName;
                                    if (isTemplate) {
                                        tName = tag.stdTagName;
                                    }
                                    newTagValues.push.apply(newTagValues, tagValuesFromServer[tName]);
                                    _.each(tagInfoFromServer[tName], function (tagInfoObj, j) {
                                        newTagInfo.push(tagInfoObj.tagInfo);
                                    });
                                });

                                newPlottedChart = {
                                    "tags": newTagInfo,
                                    "tagsValues": newTagValues,
                                    "tagNameDisplayOption": "Customer"
                                };

                                newPlottedCharts.push(newPlottedChart);
                            });

                            self.chartobjs = [];
                            self.plottedCharts = newPlottedCharts;
                            $rootScope.$broadcast('event:plottedCharts', self.plottedCharts);
                        },

                        function (error) {

                            var erMsg = error.data.errorMessage;
                            var errCode = error.data.errorCode;
                            chartStatus.loading = false;

                            if (erMsg && erMsg.indexOf("INVALID_TEMPLATE") === 0) {
                                chartStatus.error = 'Template can not be applied as the standard tags ' + erMsg.substring("INVALID_TEMPLATE".length) + ' are not available for the selected lineup.';
                                self.updateCtrl(chartStatus);
                            } else if (errCode && errCode.indexOf("-111") === 0) {
                                chartStatus.error = 'Unable to get time series data from server!';
                                self.updateCtrl(chartStatus);
                            }
                            else {
                                chartStatus.error = 'Unable to get data from server!';
                                self.updateCtrl(chartStatus);
                            }
                        }
                    );
                }

//                if(self.chartobjs.length > 0 && action === "zoom"){
//
//                    var xAxis;
//
//                    self.chartobjs.forEach(function(charOb){
//
//                        xAxis = charOb.xAxis[0];
//                        xAxis.setExtremes();
//                    });
//                }
            };

            self.getPlottedCharts = function () {
                return self.plottedCharts;
            };

            self.analysisPlotNewChart = function () {

                var action = 'newChart'; // telling what action needs to be taken
                self.getTagValues(self.plotNewSelectedTags, action);
            };

            self.updateAnalysisChart = function () {
                var action = 'updateChart'; // telling what action needs to be taken
                self.getTagValues(self.editChartSelectedTags, action);
            };

            self.changeChartSeries = function (tags, updateType, hasRawData) {
                var action = 'updateChart'; // telling what action needs to be taken
                self.getTagValues(tags, action, updateType, hasRawData);
            };

            self.getStartDt = function (tRange, stDt) {

                var dt = new Date();

                if (tRange === "custom") {
                    if (stDt) {
                        return stDt;
                    }
                    else if (self.startDatePic) {
                        return self.startDatePic;
                    }
                    else {
                        return dt.toISOString();
                    }
                }

                if (tRange === "oneHour") {
                    dt.setUTCHours(dt.getUTCHours() - 1);
                } else if (tRange === "fourHours") {
                    dt.setUTCHours(dt.getUTCHours() - 4);
                }
                else if (tRange === "twelveHours") {
                    dt.setUTCHours(dt.getUTCHours() - 12);
                }
                else if (tRange === "twentyFourHours") {
                    dt.setUTCHours(dt.getUTCHours() - 24);
                }
                else if (tRange === "fortyEightHours") {
                    dt.setUTCHours(dt.getUTCHours() - 48);
                }
                else if (tRange === "threeMonths") {
                    dt.setUTCMonth(dt.getUTCMonth() - 3);
                }
                else if (tRange === "sixMonths") {
                    dt.setUTCMonth(dt.getUTCMonth() - 6);
                }
                else if (tRange === "nineMonths") {
                    dt.setUTCMonth(dt.getUTCMonth() - 9);
                }
                else if (tRange === "oneYear") {
                    dt.setUTCMonth(dt.getUTCMonth() - 12);
                }
                return dt.toISOString();
            };

            self.getEndDt = function (tRange, endDt) {

                var dt = new Date();

                if (tRange === "custom") {

                    if (endDt) {
                        return endDt;
                    }
                    else if (self.endDatePic) {
                        return self.endDatePic;
                    }
                    else {
                        return dt.toISOString();
                    }

                }
                dt.setUTCHours(dt.getUTCHours());
                return dt.toISOString();
            };

            self.cancelAnalysisPlotNewChart = function (instance) {
                self.plotNewSelectedTags = {};
                instance.$dismiss('cancel');
            };

            return self;
        }])

});