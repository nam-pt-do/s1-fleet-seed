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
    directives.directive('chartTimeSeriesSubgroup', [function () {
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
                        chart: {
                            zoomType: 'x'
                            , resetZoomButton: {
                                position: {
                                    x: -50,
                                    y: 2
                                },
                                relativeTo: 'chart'
                            }
                        },
                        //  colors: ['#e31d26','#ffed45','#ff9821'] // [high, med, low] From Justine's mocks
                        colors: ['#14a3e6',
                            '#7bb900',
                            '#eb8300',
                            '#6f1775',
                            '#0a5f86',
                            '#eb3b19',
                            '#c85100',
                            '#f3b559',
                            '#b0d553',
                            '#f38779']

                    });

                    options.chart = options.chart || {
                            type: 'spline'
                        };
                    options.chart.renderTo = el;
                    options.title = options.title || {text: null};


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
                    function getSevLevelMatrix(data) {
                        var formMatrix = [];
                        if (data.normalizedSeverityLevel == 1) {
                            countLow = data.count;
                            countMedium = 0;
                            countHigh = 0;

                        }
                        else if (data.normalizedSeverityLevel == 2) {
                            countMedium = data.count;
                            countLow = 0;
                            countHigh = 0;

                        }
                        else if (data.normalizedSeverityLevel == 3) {
                            countHigh = data.count;
                            countLow = 0;
                            countMedium = 0;

                        }
                        formMatrix.push(countHigh, countMedium, countLow);

                        return formMatrix;
                    }

                    var getEventCount = function (events) {
                        // events= _.chain(subgroupData).pluck('eventOccurences').flatten().valueOf();
                        eventStartTime = _.chain(events).pluck('startTime').flatten().valueOf();
                        eventCount = _.countBy(eventStartTime, function (obj) {
                            var plcTime = moment(obj).format("YYYY-MM-DD");
                            /*  if(formCategories.indexOf(plcTime)<0){
                             formCategories.push(plcTime);
                             }*/
                            return plcTime
                        });
                        var tempKeys = _.keys(eventCount);
                        tempKeys.sort();
                        var arr = [];
                        _.forEach(tempKeys, function (_key) {
                            arr.push([Date.UTC(moment(_key).year(), moment(_key).month(), moment(_key).date()), eventCount[_key]]);
                        });
                        arr.sort();
                        return arr;
                    };

                    if (data !== undefined) {
                        var countLow, countMedium, countHigh, getCategories, cHigh, cMed, cLow;
                        var sevMatrix = [], formattedCategory = [], _series = [], eCategory = [], eType = [], eventCount = [], eCategoryData = [], eTypeData = [], subgroupEvents = [];
                        var formCategories = [], tempTime = [], mapTimeLevel = [], enterpriseList = [], dataSourceList = [], datasourceData = [], timeData, timeSeries;
                        var eCountSeries, subgroup;
                        var count = 0, _time, seriesName, eventStartTime, formattedXAxis;


                        var formattedSeries = [];
                        if (data !== undefined) {
                            data[0].response = _.filter(data[0].response, {"filterThis": true});
                            var dataLength = data[0].response.length;

                            //Get list of Enterprise(eType)and datasource
                            for (var i = 0; i < dataLength; i++) {
                                if (enterpriseList.indexOf(data[0].response[i].enterpriseName) < 0) {
                                    //unique value
                                    enterpriseList.push(
                                        data[0].response[i].enterpriseName
                                    )
                                }
                                if (dataSourceList.indexOf(data[0].response[i].dataSource) < 0) {
                                    //unique value
                                    dataSourceList.push(
                                        data[0].response[i].dataSource
                                    )
                                }
                            }

                            var dataSource = _.chain(data[0].response).pluck('dataSource').flatten().unique().valueOf();
                            var system1Events = _.filter(data[0].response, {"dataSource": "System 1"});
                            var smartsignalEvents = _.filter(data[0].response, {"dataSource": "SmartSignal"});

                            //Get subgroups for System1
                            var temp_system1EnterpriseList = _.map(
                                _.where(system1Events),
                                function (obj) {
                                    return {"id": obj.enterpriseId, "name": obj.enterpriseName};
                                }
                            );

                            var _startTime = data[0].options.startTime;
                            var _endTime = data[0].options.endTime;
                            var _active = data[0].options.isActive;

                            var system1EnterpriseList = _.chain(temp_system1EnterpriseList).unique("id").flatten().valueOf();
                            var eventWithinRange = [];
                            _.forEach(system1EnterpriseList, function (obj) {
                                var eventsForEnterprise = _.filter(system1Events, {"enterpriseId": obj.id});
                                var eventOccurrences = _.chain(eventsForEnterprise).pluck('eventOccurences').flatten().valueOf();

                                //Filter event occurrences within selected time range (start and end time in options)
                                if (_active) {
                                    _.forEach(eventOccurrences, function (obj) {
                                        /* if(obj.startTime >=_startTime && obj.endTime <=_endTime || obj.startTime >=_startTime && obj.endTime==null){
                                         eventWithinRange.push(obj);
                                         }*/
                                        eventWithinRange.push(obj);
                                    })
                                }
                                else {
                                    _.forEach(eventOccurrences, function (obj) {
                                        /*  if(obj.startTime>=formattedStartTime && obj.endTime<=formattedEndTime){
                                         eventWithinRange.push(obj);
                                         }*/
                                        if (obj.startTime >= _startTime && obj.endTime <= _endTime || obj.startTime >= _startTime && obj.endTime == null) {
                                            eventWithinRange.push(obj);
                                        }
                                    });
                                }
                                var eventCount = getEventCount(eventWithinRange);

                                subgroupEvents.push({"subgroup": obj.name, "events": eventCount});
                                formattedXAxis = _.chain(eventCount).pluck(0).valueOf();
                                formattedSeries.push({
                                    type: 'spline',
                                    name: obj.name,
                                    data: eventCount, //[[x,y],[x,y]]
                                    marker: {enabled: false}
                                    , yAxis: 1
                                });
                            });


                            //Get subgroups for SmartSignal
                            var temp_smartSignalEnterpriseList = _.map(
                                _.where(smartsignalEvents),
                                function (obj) {
                                    return {"id": obj.enterpriseId, "name": obj.enterpriseName};
                                }
                            );
                            var smartSignalEnterpriseList = _.chain(temp_smartSignalEnterpriseList).unique("id").flatten().valueOf();
                            var eventWithinRangeSS = [];
                            _.forEach(smartSignalEnterpriseList, function (obj) {
                                _startTime = data[0].options.startTime;
                                _endTime = data[0].options.endTime;

                                var eventsForEnterprise = _.filter(smartsignalEvents, {"enterpriseId": obj.id});
                                //   var eventOccurrences= _.chain(eventsForEnterprise).pluck('eventOccurences').flatten().valueOf();
                                if (_active) {
                                    _.forEach(eventsForEnterprise, function (obj) {
                                        eventWithinRangeSS.push(obj);
                                    });
                                }
                                else {
                                    //  formattedStartTime = moment(_startTime).format("YYYY-MM-DD");
                                    //  formattedEndTime= moment(_endTime).format("YYYY-MM-DD");
                                    _.forEach(eventsForEnterprise, function (obj) {
                                        if (obj.startTime > _startTime && obj.endTime <= _endTime || obj.startTime > _startTime && obj.endTime == null) {
                                            eventWithinRangeSS.push(obj);
                                        }
                                    });
                                }

                                //var eventCount=getEventCount(eventsForEnterprise);
                                var eventCount = getEventCount(eventWithinRangeSS);

                                subgroupEvents.push({"subgroup": obj.name, "events": eventCount});
                                //formattedXAxis=_.chain(eventCount).pluck(0).valueOf();
                                formattedSeries.push({
                                    type: 'spline',
                                    name: obj.name,
                                    data: eventCount, //[[x,y],[x,y]]
                                    marker: {enabled: false}
                                    , yAxis: 0
                                });
                            });

                            if (formattedSeries.length > 0) {
                                options.yAxis = [{
                                    /*title: {
                                     text: 'SmartSignal'
                                     ,style: {
                                     color: 'black'
                                     ,fontFamily:'ge-inspira'
                                     ,fontSize:'14'
                                     }
                                     },*/
                                    title: {
                                        text: 'SmartSignal <br/>Alarm Count',
                                        useHTML: true,
                                        offset: 55,
                                        style: {
                                            /*
                                             whiteSpace: 'normal',
                                             */
                                            color: 'black'
                                            , fontFamily: 'ge-inspira'
                                            , fontSize: '16'
                                        }
                                    },
                                    height: 130,
                                    lineWidth: 2
                                }, {
                                    title: {
                                        text: 'System 1 <br/>Alarm Count',
                                        useHTML: true,
                                        offset: 55,
                                        style: {
                                            /*
                                             whiteSpace: 'normal',
                                             */
                                            color: 'black'
                                            , fontFamily: 'ge-inspira'
                                            , fontSize: '14'
                                        }
                                    },
                                    top: 205,
                                    height: 138,
                                    offset: 0,
                                    lineWidth: 2,
                                    startOnTick: true,
                                    min: 0
                                }];
                                options.xAxis = _.extend(options.xAxis || {}, {
                                        title: {
                                            text: "Time (GMT)"
                                            , style: {
                                                color: 'black'
                                                , fontFamily: 'ge-inspira'
                                                , fontSize: '16'
                                            }
                                        },
                                        labels: {
                                            align: 'right'
                                            , formatter: function () {
                                                return moment(this.value).format("YYYY-MM-DD");
                                            }
                                        },
                                        tickPixelInterval: 100,
                                        type: 'datetime'
                                        /*,dateTimeLabelFormats: {
                                         //  second: '%Y-%m-%d<br/>%H:%M:%S',
                                         //  minute: '%Y-%m-%d<br/>%H:%M',
                                         //  hour: '%Y-%m-%d<br/>%H:%M',
                                         day: '%Y-%m-%d'
                                         //  week: '%Y<br/>%m-%d',
                                         //  month: '%Y-%m',
                                         //  year: '%Y'
                                         }*/
                                        , offset: 10
                                    }
                                );
                                options.series = formattedSeries;
                            }
                            var getCategory = [];
                        }
                        // =================================================

                        // DATA
                        // =================================================

                        // CREATE THE CHART
                        self.chart = new Highcharts.Chart(options);

                        // Return for chaining
                        return self;
                    }
                };
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
                        if (instance) {
                            instance.chart.destroy();
                        }
                    }


                }, true); // true tells $watch to compare object, not reference
            }
        };
    }])

    return directives;
});
