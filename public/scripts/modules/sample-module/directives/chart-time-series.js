/* global Highcharts, moment, _ */

/**
 * Category Chart Angular Directive
 * @author : Pete Butler - pete.butler@ge.com
 * @deps: Highcharts, moment, underscore
 *
 Usage: <div chart-category data="data"></div>

 where "data" is an attribute on $scope like:
 {
   categories: ['Brains', 'Brawn', 'Looks'],
   series: [
     {name:"The Tick", data:[1,10,3]},
     {name:"Authur", data:[7,2,2]},
     {name:"Captain Liberty", data:[7,7,10]},
     {name:"Batmanuel", data:[5,6,8]}
   ]
 }

 */

/*global define */
define(['angular', 'directives-module'], function (angular, directives) {
    'use strict';

    /* Directives  */
    directives.directive('chartTimeSeries', [function () {
        return {
            scope: {
                data: '='
            },
            template: '<div></div>',
            restrict: 'AE',
            link: function postLink(scope, element, attrs) {

                function Chart(el, data, options) {
                    var self = this;

                    // =================================================
                    // CHART OPTIONS

                    Highcharts.setOptions({
                        credits: {
                            enabled: false
                        },
                        colors: ['#058DC7', '#fba13b', '#50B432', '#4B0082']
                        , chart: {
                            zoomType: 'xy'
                            , resetZoomButton: {
                                position: {
                                    x: -50,
                                    y: 2
                                },
                                relativeTo: 'chart'
                            }
                        }

                        /* ,zoomType: 'x'
                         ,resetZoomButton: {
                         position: {
                         // align: 'right', // by default
                         // verticalAlign: 'top', // by default
                         x: -10,
                         y: 10
                         },
                         relativeTo: 'chart'
                         }*/

                    });

                    options.chart = options.chart || {
                            type: 'spline'
                        };
                    options.chart.renderTo = el;
                    options.title = options.title || {text: null};


                    options.yAxis = _.extend(options.yAxis || {}, {
                        title: {
                            text: "Alarm Count"
                            , style: {
                                color: 'black'
                                , fontFamily: 'ge-inspira'
                                , fontSize: '14'
                            }
                        },
                        min: 0
                    });
                    // options.yAxis.min=0;
                    options.plotOptions = _.extend(options.plotOptions || {}, {
                        column: {
                            dataLabels: {
                                enabled: true
                            }
                        }
                    });

                    if (attrs.stacked === 'true') {
                        options.plotOptions = _.extend(options.plotOptions || {}, {
                            column: {
                                stacking: 'normal'
                            }
                        });
                    }
                    if (attrs.xAxis === 'false') {
                        options.plotOptions = _.extend(options.plotOptions || {}, {
                            xAxis: 1
                        })
                    }

                    options.legend = {
                        enabled: true
                        , align: 'center'
                        , verticalAlign: 'top'
                        , borderWidth: 0
                    };

                    // CHART OPTIONS
                    // =================================================

                    // =================================================
                    // DATA

                    // Populate the series array with empty series, each on its own axis,
                    // applying any series yAxis options
                    // options.series = data.series;

                    /* var seriesDataByEventType=[];
                     var dataLength=data.series.length;
                     seriesDataByEventType.push([
                     data.series[0],
                     data.series[1],
                     data.series[2],
                     data.series[3]
                     ]);

                     options.series = seriesDataByEventType[0];*/
                    var fleetCategories = [{
                        'id': 'assetManagement',
                        'value': 'Asset Management'
                    }, {'id': 'assetProtection', 'value': 'Asset Protection'}, {
                        'id': 'instrumentManagement',
                        'value': 'Instrument Management'
                    }, {'id': 'instrumentProtection', 'value': 'Instrument Protection'}, {
                        'id': 'smartSignal',
                        'value': 'SmartSignal'
                    }];

                    if (data !== undefined) {
                        //FORMAT Data
                        data[0].response = _.filter(data[0].response, {"filterThis": true});
                        var getData = [data];
                        var timeScale = [], eCategory = [], eType = [];


                        for (var i = 0; i < data[0].response.length; i++) {
                            //Fallback: Data cleansing should be done in controller or DB level, in case it is not done properly; this code should take care of those cases.
                            var getCategoryNameIndex = _.findWhere(fleetCategories, {id: data[0].response[i].fleetCategoryEnum});
                            if (getCategoryNameIndex) {
                                if (getCategoryNameIndex.value == '') {
                                    getCategoryNameIndex.value = "SmartSignal"
                                }
                                if (eCategory.indexOf(getCategoryNameIndex.value) < 0) {
                                    //unique value
                                    eCategory.push(
                                        getCategoryNameIndex.value
                                    )
                                }
                            }
                            else {
                                if (eCategory.indexOf(data[0].response[i].fleetCategoryEnum) < 0) {
                                    //unique value
                                    eCategory.push(
                                        data[0].response[i].fleetCategoryEnum
                                    )
                                }
                            }

                            if (eType.indexOf(data[0].response[i].dataSource) < 0) {
                                //unique value
                                eType.push(
                                    data[0].response[i].dataSource
                                )
                            }
                        }

                        var eventCount = [], eCategoryData = [], eTypeData = [], eCategoryDataOccurence = [], tempTime = [], _series = [], _xAxisCategories = [];
                        var eCountSeries;
                        var count = 0, _time, seriesName;
                        var _startTime = moment(data[0].options.startTime).format("YYYY-MM-DD");
                        var _endTime = moment(data[0].options.endTime).format("YYYY-MM-DD");
                        var _active = data[0].options.isActive;

                        //Get records for each type: System 1 or SmartSignal
                        _.forEach(eType, function (eType) {
                            eTypeData = _.filter(data[0].response, {'dataSource': eType});
                            var eventWithinRange = [];
                            //For SmartSignal enterprise, use LastOccurred Time as start time
                            if (eType == "SmartSignal") {
                                var plcDate;
                                var eCountSeriesFormatted = [];
                                //  seriesName=eType+' '+eCategory;

                                //Get unique event category for this event Type/Datasource (SmartSignal OR System1)
                                var evCategory = [];
                                evCategory = _.chain(eTypeData).pluck('fleetCategoryEnum').flatten().unique().valueOf();
                                if (evCategory == " ") {
                                    evCategory = "SmartSignal";
                                }
                                console.log("Event Category for System 1" + evCategory);

                                //Partition records based on their event category
                                var categorizedData = [];
                                var formCategories = [];
                                categorizedData.push({"category": evCategory, "data": eTypeData});


                                eCountSeries = _.chain(categorizedData[0].data).pluck('startTime').sort().flatten().valueOf();
                                _.forEach(eCountSeries, function (obj) {
                                    eCountSeriesFormatted.push(moment(obj).format("YYYY-MM-DD"));
                                });
                                var seriesName = [];
                                seriesName.push(categorizedData[0].category);

                                if (_active) {
                                    //   var now = moment();//Current date-time
                                    _startTime = moment().subtract('hour', 24).toISOString();
                                    _endTime = moment().toISOString();
                                    var formattedStartTime = moment(_startTime).format("YYYY-MM-DD");
                                    var formattedEndTime = moment(_endTime).format("YYYY-MM-DD");

                                    _.forEach(eCountSeriesFormatted, function (obj) {
                                        if (obj >= formattedStartTime && obj <= formattedEndTime) {
                                            eventWithinRange.push(obj);
                                        }
                                    });
                                }
                                else {
                                    _.forEach(eCountSeriesFormatted, function (obj) {
                                        if (obj >= _startTime && obj <= _endTime) {
                                            eventWithinRange.push(obj);
                                        }
                                    });
                                }
                                // tempTime=_.countBy(eCountSeriesFormatted);
                                tempTime = _.countBy(eventWithinRange);


                                _.forEach(eventWithinRange, function (obj) {
                                    plcDate = moment(obj).format("YYYY-MM-DD");
                                    if (formCategories.indexOf(plcDate) < 0) {
                                        formCategories.push(plcDate);
                                    }
                                });
                                var formattedSeries = [];
                                formCategories.sort();
                                for (formCategories in tempTime) {
                                    _xAxisCategories.push(formCategories);
                                    formattedSeries.push([
                                        Date.UTC(moment(formCategories).year(), moment(formCategories).month(), moment(formCategories).date()),
                                        tempTime[formCategories]
                                    ]);
                                }
                                _xAxisCategories.sort();

                                formattedSeries.sort();
                                if (formattedSeries.length > 0) {
                                    _series.push({
                                        "name": seriesName,
                                        "data": formattedSeries,
                                        "type": 'spline',
                                        marker: {enabled: false},
                                        color: '#f38779'
                                    });
                                }

                                /* tempTime=_.countBy(eCountSeries);
                                 _.forEach(eCountSeries,function(obj){
                                 plcDate=moment(obj).format("YYYY-MM-D");
                                 if(formCategories.indexOf(plcDate)<0){
                                 formCategories.push(plcDate);
                                 }
                                 });*/
                            }
                            else {
                                var eCountSeriesFormatted = [];
                                //Get unique event category for this event Type/Datasource (SmartSignal OR System1)
                                var evCategory = [];
                                evCategory = _.chain(eTypeData).pluck('fleetCategoryEnum').flatten().unique().valueOf();
                                console.log("Event Category for System 1" + evCategory);

                                //Partition records based on their event category
                                var categorizedData = [];
                                var formCategories = [];
                                _.forEach(evCategory, function (category) {
                                    // categorizedData={"category":category,"data": _.filter(eTypeData,{'fleetCategoryEnum':category})};
                                    var _data = [];
                                    _.forEach(eTypeData, function (d) {
                                        if (d.fleetCategoryEnum == category) {
                                            _data.push(d);
                                        }
                                    });
                                    categorizedData.push({"category": category, "data": _data});
                                });
                                //For each of the categorized data, get all the event occurrences
                                //TODO  - Add check to exclude cases where there is no eventOccurrences field (few nodes with no eventOccurrences OR all events have no event occurrence)
                                _.forEach(categorizedData, function (obj) {
                                    eCountSeriesFormatted = [], eventWithinRange = [], formCategories = [];
                                    eCountSeries = _.chain(obj.data).pluck('eventOccurences').sortBy('startTime').flatten().valueOf();
                                    seriesName = eType + ' ' + obj.category;
                                    _.forEach(eCountSeries, function (obj) {
                                        eCountSeriesFormatted.push(moment(obj.startTime).format("YYYY-MM-DD"));
                                    });

                                    if (_active) {
                                        _startTime = moment().subtract('hour', 24).toISOString();
                                        _endTime = moment().toISOString();
                                        formattedStartTime = moment(_startTime).format("YYYY-MM-DD");
                                        formattedEndTime = moment(_endTime).format("YYYY-MM-DD");
                                        _.forEach(eCountSeriesFormatted, function (obj) {
                                            eventWithinRange.push(obj);
                                        });
                                    }
                                    else {
                                        _.forEach(eCountSeriesFormatted, function (obj) {
                                            if (obj >= _startTime && obj <= _endTime) {
                                                eventWithinRange.push(obj);
                                            }
                                        });
                                    }
                                    tempTime = _.countBy(eventWithinRange);

                                    _.forEach(eventWithinRange, function (obj) {
                                        // plcDate=moment(obj.startTime).format("YYYY-MM-D");
                                        if (formCategories.indexOf(obj) < 0) {
                                            formCategories.push(obj);
                                        }
                                    });
                                    var formattedSeries = [];
                                    formCategories.sort();
                                    for (formCategories in tempTime) {
                                        _xAxisCategories.push(formCategories);
                                        formattedSeries.push([
                                            Date.UTC(moment(formCategories).year(), moment(formCategories).month(), moment(formCategories).date()),
                                            tempTime[formCategories]
                                        ]);
                                    }
                                    _xAxisCategories.sort();
                                    formattedSeries.sort();
                                    if (formattedSeries.length > 0) {
                                        _series.push({
                                            "name": seriesName,
                                            "data": formattedSeries,
                                            "type": 'spline',
                                            marker: {enabled: false}
                                        });
                                    }
                                });
                            }
                        });


                        var dates = _.map(_xAxisCategories, function (date) {
                            return moment(date)
                        });
                        var start = _.min(dates);

                        //Frame x Axis range
                        if (_xAxisCategories.length > 5) {
                            var interval = 4;
                        }
                        else {
                            interval = _xAxisCategories[1] - _xAxisCategories[0];
                        }

                        options.xAxis = _.extend(options.xAxis || {}, {
                            title: {
                                text: "Time (GMT)"
                                , style: {
                                    color: 'black'
                                    , fontFamily: 'ge-inspira'
                                    , fontSize: '14'
                                }
                            }
                            //  ,categories:_xAxisCategories
                            //,tickInterval:interval
                            // ,tickInterval : 7*24*3600*1000
                            , type: 'datetime'
                            , labels: {
                                align: 'right'
                                , formatter: function () {
                                    return moment(this.value).format("YYYY-MM-DD");
                                }
                            },
                            tickPixelInterval: 100
                        });


                        options.series = _series;
                    }
                    //options.series=[{"name":"Protection","data":formattedSeries}];
                    // =================================================

                    // CREATE THE CHART
                    self.chart = new Highcharts.Chart(options);

                    // Return for chaining
                    return self;
                }

                // ===============================================================================
                // INITIALIZATION
                var options = {};
                var instance = null;

                // ===============================================================================
                // WATCHERS
                scope.$watch('data', function (newData, oldData) {

                    if (newData && newData[0] && newData[0].response) {
                        // Not very efficient.
                        if (instance) {
                            instance.chart.destroy();
                        }
                        instance = new Chart(element[0], newData, options);
                    } else {
                        if (instance)
                            instance.chart.destroy();
                    }

                }, true); // true tells $watch to compare object, not reference
            }
        };
    }])
    return directives;
})
