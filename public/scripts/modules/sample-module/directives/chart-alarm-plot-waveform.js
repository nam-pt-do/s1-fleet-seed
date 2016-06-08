/* global Highcharts, moment, _ */

/**
 * Category Chart Angular Directive
 * @author : Deepika Singh - deepika.singh@ge.com
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
    directives.directive('chartAlarmPlotWaveform', [function () {
        return {
            scope: {
                data: '='
            },
            template: '<div></div>',
            restrict: 'AE',
            link: function postLink(scope, element, attrs) {

                function Chart(el, data, options) {
                    var self = this;
                    //console.log("View Alarm plot");
                    // =================================================
                    // CHART OPTIONS

                    Highcharts.setOptions({
                        credits: {
                            enabled: false
                        }
                        , chart: {
                            zoomType: 'xy'
                            , resetZoomButton: {
                                position: {
                                    x: -50,
                                    y: 2
                                },
                                relativeTo: 'chart'
                            },
                            events: {
                                load: function () {
                                    $('#tooltipWaveform').html('');
                                    $('#tooltipWaveform').addClass('customLegend-hide').removeClass('customLegend-show');
                                }
                            }
                        }
                        , colors: ['#000000', '#058DC7', '#fba13b', '#50B432', '#4B0082']

                    });

                    options.chart = options.chart || {
                            type: 'spline',
                            navigation: {
                                buttonOptions: {
                                    align: 'right'
                                }
                            }
                        };
                    options.chart.renderTo = el;
                    options.title = options.title || {text: null};

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
                    if (attrs.height) {
                        options.chart.height = attrs.height;
                        options.chart.marginTop = 50;
                    }

                    options.legend = {
                        enabled: false
                        , align: 'center'
                        , verticalAlign: 'top'
                    };

                    options.navigation = {
                        buttonOptions: {
                            align: 'right'
                        }
                    };
					options.exporting = {
						buttons: {
				            contextButton: {
				                align: 'right',
				                x: -5,
				                y: 10
				            }
				        },
				        enabled: true
				   };

                    // CHART OPTIONS
                    // =================================================

                    // =================================================
                    // DATA

                    // Populate the series array with empty series, each on its own axis,
                    // applying any series yAxis options
                    // options.series = data.series;


                    //FORMAT Data
                    // var getData=data;
                    var timeScale = [], eCategory = [], eType = [], minX, maxX;

                    function roundToFour(num) {
						return +(Math.round(num * 1e+4) / 1e+4);
					}

					function roundToTwo(num) {
						return +(Math.round(num * 1e+2) / 1e-2);
					}

                    var dataSet, _series = [], _timeline = [];
                    if (data && data.response && data.response[0] && data.response[0].waveformFFT !== undefined && data.response.indexOf(Error) < 0) {
                        $('#chartLoadDisplay').html("<i class='icon-spinner icon-spin' style='font-size: 30px;margin-left: 40%;'></i> Loading...");

                        //1. Waveform filters selected in view (waveform type=Frequency/Time, waveform criteria = Asynchronous/Synchronous variable)
                        var waveformType = data.filterType;
                        var waveformCriteria = data.filterCriteria;

                        //2. Waveform response from the service calls
                        var getData = data.response[0];

                        //3. Check the filters and decide which chart (Time/Frequency by Asynchronous/Synchronous)to display
                        var _timelineCal = [];
                        var dataObject = {};

                        if (waveformType == "Frequency") {
                            /*  if(getData.waveformModeEnum="asynchronous"){
                             //Format the data to generate frequency values for xAxis ((max-min)/# of dataPoints)*index value
                             _timelineCal=[]; dataObject={};
                             for(var i=0; i<getData.waveformFFT.length;i++){
                             // _timelineCal.push(Math.floor(((getData.maxFrequencyScale-getData.minFrequencyScale)/getData.waveformFFT.length)*(i+1)))
                             _timelineCal.push((getData.frequencyBucket)*(i+1));
                             }
                             var max=Math.round(getData.waveformFFT.length * getData.frequencyBucket);

                             dataObject={
                             "data":getData.waveformFFT,
                             "formattedCategories":_timelineCal,
                             "uom":"Hz",
                             "tickInterval":_timelineCal.length/16,
                             "yAxisLabel":"mill pp",
                             "xAxisMax":max
                             };
                             options.tooltip={
                             crosshairs:true
                             ,formatter:function(){
                             $('#tooltipWaveform').html(Math.round(this.y*100)/100+' mil pp @'+Math.round(this.x*100)/100+'Hz '+getData.speed+' RPM');
                             },
                             backgroundColor: 'none',
                             borderWidth: 0,
                             shadow: false,
                             useHTML: true,
                             padding: 0
                             };
                             }
                             else {
                             if(getData.waveformModeEnum="synchronous"){
                             //Format the data to generate frequency values for xAxis ((max-min)/# of dataPoints)*index value
                             _timelineCal=[]; dataObject={};
                             */
                            /*for(i=0; i<data.waveformFFT.length;i++){
                             _timelineCal.push(Math.floor(((getData.maxFrequencyScale-getData.minFrequencyScale)/data.waveformFFT.length)*(i+1)))
                             }*/
                            /*
                             _timelineCal=[]; dataObject={};
                             for(i=0; i<getData.waveformFFT.length;i++){
                             // _timelineCal.push(Math.floor(((getData.maxFrequencyScale-getData.minFrequencyScale)/getData.waveformFFT.length)*(i+1)))
                             _timelineCal.push((getData.frequencyBucket)*(i));
                             }

                             var max=Math.round(getData.waveformFFT.length * getData.frequencyBucket);

                             dataObject={
                             "data":getData.waveformFFT,
                             "formattedCategories":_timelineCal,
                             "uom":"nX",
                             "tickInterval":_timelineCal.length/5,
                             "yAxisLabel":"mill pp",
                             "xAxisMax":max

                             };
                             }
                             options.tooltip={
                             crosshairs:true
                             ,formatter:function(){
                             // $('#tooltipWaveform').html(Math.round(this.y*100)/100+' mil pp @'+Math.round(this.x)+'X '+getData.speed+' RPM');
                             $('#tooltipWaveform').html(Math.round(this.y*100)/100+' mil pp @'+Math.round(this.x*100)/100+'X '+getData.speed+' RPM');
                             },
                             backgroundColor: 'none',
                             borderWidth: 0,
                             shadow: false,
                             useHTML: true,
                             padding: 0
                             };
                             }*/
                            if (getData.waveformModeEnum == "synchronous") {
                                _timelineCal = [];
                                dataObject = {};
                                var waveformTotalFrequency = getData.waveformFFT.length * getData.frequencyBucket;

                                for (i = 0; i < getData.waveformFFT.length; i++) {
                                    //This is critical as we saw instances where the data array was empty
                                    if (getData.waveformFFT[i] == 0 || getData.waveformFFT[i] == undefined) {
                                        temp = 0;
                                    }
                                    else {
                                        // temp=roundToTwo(getData.waveformFFT[i])
                                        temp = getData.waveformFFT[i];
                                    }
                                    //   _timelineCal.push([Math.round(getData.frequencyBucket*i),temp]);
                                    _timelineCal.push([(getData.frequencyBucket * i), temp]);
                                }

                                dataObject = {
                                    "data": _timelineCal,
                                    "uom": "nX",
                                    "yAxisLabel": getData.uom + ' ' + getData.subunits,
                                    "xAxisMax": waveformTotalFrequency
                                };

                                options.tooltip = {
                                    crosshairs: true
                                    , formatter: function () {
                                        // $('#tooltipWaveform').html(Math.round(this.y*100)/100+' mil pp @'+Math.round(this.x)+'X '+getData.speed+' RPM');
                                        ;
                                        $('#tooltipWaveform').html('<b>' + roundToFour(this.y).toFixed(4) + '</b>' + '&nbsp;' + getData.uom + '&nbsp; ' + getData.subunits + ' @' + roundToFour(this.x).toFixed(4) + 'X &nbsp;&nbsp;&nbsp;' + (getData.speed !== "" && getData.speed > 0 ? getData.speed + ' RPM' : ""));
                                        $('#tooltipWaveform').removeClass('customLegend-hide').addClass('customLegend-show');
                                    },
                                    backgroundColor: 'none',
                                    borderWidth: 0,
                                    shadow: false,
                                    useHTML: true,
                                    padding: 0
                                };
                            }
                            else {
                                if (getData.waveformModeEnum == "asynchronous") {
                                    _timelineCal = [];
                                    dataObject = {};
                                    var waveformTotalFrequency = getData.waveformFFT.length * getData.frequencyBucket;

                                    for (i = 0; i < getData.waveformFFT.length; i++) {
                                        if (getData.waveformFFT[i] == 0 || getData.waveformFFT[i] == undefined) {
                                            temp = 0;
                                        }
                                        else {
                                            // temp=roundToTwo(getData.waveformFFT[i])
                                            temp = (getData.waveformFFT[i])
                                        }
                                        //  _timelineCal.push([Math.round(getData.frequencyBucket*i),temp]);
                                        _timelineCal.push([getData.frequencyBucket * i, temp]);
                                    }

                                    dataObject = {
                                        "data": _timelineCal,
                                        "uom": "Hz",
                                        "yAxisLabel": getData.uom + ' ' + getData.subunits,
                                        "xAxisMax": waveformTotalFrequency
                                    };

                                    options.tooltip = {
                                        crosshairs: true
                                        , formatter: function () {
                                        	;
                                            $('#tooltipWaveform').html('<b>' + roundToFour(this.y).toFixed(4) + '</b>' + '&nbsp;' + getData.uom + '&nbsp;' + getData.subunits + ' @ ' + roundToFour(this.x).toFixed(4) + 'Hz &nbsp;&nbsp;&nbsp;' + (getData.speed !== "" && getData.speed > 0 ? getData.speed + ' RPM' : ""));
                                            $('#tooltipWaveform').removeClass('customLegend-hide').addClass('customLegend-show');
                                        },
                                        backgroundColor: 'none',
                                        borderWidth: 0,
                                        shadow: false,
                                        useHTML: true,
                                        padding: 0
                                    };
                                }
                            }

                            options.series = [
                                {
                                    "name": "Waveform"
                                    , "data": dataObject.data
                                    , "type": 'spline'
                                    , "marker": {enabled: false}

                                }];
                            options.xAxis = _.extend(options.xAxis || {}, {
                                title: {
                                    text: dataObject.uom || ""
                                    , style: {
                                        color: 'black'
                                        , fontFamily: 'ge-inspira'
                                        , fontSize: '14'
                                    }
                                },
								labels : {
									align : 'right',
									style : {
										"fontsize" : "12px"
									}
								},
								 startOnTick: true
                                , min: 0
                                , max: dataObject.xAxisMax
                                , endOnTick: true
                                , allowDecimals: false
                            });
                            options.yAxis = _.extend(options.yAxis || {}, {
                                title: {
                                    text: dataObject.yAxisLabel
                                    , style: {
                                        color: 'black'
                                        , fontFamily: 'ge-inspira'
                                        , fontSize: '14'
                                    }
                                }
                                , startOnTick: true
                                , offset: 0
                            });

                        }
                        else {
                            if (waveformType == "Time") {
                                /* Get the max time duration of the waveform = waveform length * timestep
                                 *  Create [x,y] mapping where x = xAxis value = x axis index * timestep, y = raw time series array
                                 * */
                                var waveformTotalTime = getData.rawTimeSeries.length * getData.timeStep;

                                _timelineCal = [];
                                dataObject = {};
                                //var maxSeries=Math.round(getData.timeStep *getData.rawTimeSeries.length);
                                var maxSeries = getData.rawTimeSeries.length;
                                var temp;

                                _timelineCal = [];
                                dataObject = {};
                                for (var i = 0; i < getData.rawTimeSeries.length; i++) {
                                    //  _timelineCal.push(Highcharts.numberFormat(getData.timeStep*(i),0));
                                    if (getData.rawTimeSeries[i] == 0 || getData.rawTimeSeries[i] == undefined) {
                                        temp = 0;
                                    }
                                    else {
                                        temp = roundToFour(getData.rawTimeSeries[i])
                                    }
                                    //_timelineCal.push([Math.round(getData.timeStep*i),temp]);
                                    _timelineCal.push([getData.timeStep * i, getData.rawTimeSeries[i]]);
                                }

                                var max = getData.rawTimeSeries.length;
                                dataObject = {
                                    "data": _timelineCal,
                                    "uom": "ms",
                                    "min": 0,
                                    "tickInterval": 100,
                                    "yAxisLabel": getData.uom
                                    , "formattedCategories": _timelineCal
                                    , "max": waveformTotalTime
                                };

                                /* else {
                                 if(getData.waveformModeEnum="synchronous"){
                                 //Format the data to generate frequency values for xAxis ((max-min)/# of dataPoints)*index value
                                 // var maxRange=Math.round((60000/ (getData.speed * getData.sampleRate))*getData.rawTimeSeries.length);
                                 //  var max=Math.round(getData.timeStep *getData.rawTimeSeries.length);

                                 _timelineCal=[]; dataObject={};
                                 for(i=0; i<getData.rawTimeSeries.length;i++){
                                 //_timelineCal.push(Math.round(getData.timeStep*100)/100*(i+1));
                                 //  _timelineCal.push(Highcharts.numberFormat(getData.timeStep*(i),0));
                                 _timelineCal.push(roundToTwo(getData.timeStep*i));

                                 }
                                 dataObject={
                                 "data":getData.rawTimeSeries,
                                 "uom":"ms",
                                 "min":0,
                                 "formattedCategories":_timelineCal,
                                 "max":max,
                                 "tickInterval":_timelineCal/60,
                                 "yAxisLabel":"mil"
                                 };
                                 }
                                 }*/
                                options.series = [
                                    {
                                        "name": "Waveform"
                                        , "data": dataObject.data
                                        , "type": 'spline'
                                        , "marker": {enabled: false}
                                    }];

                                options.xAxis = _.extend(options.xAxis || {}, {
                                    title: {
                                        text: dataObject.uom || ""
                                        , style: {
                                            color: 'black'
                                            , fontFamily: 'ge-inspira'
                                            , fontSize: '14'
                                        }
                                    }
                                    , max: dataObject.max
                                    //,categories:dataObject.formattedCategories
                                    //  ,tickInterval:dataObject.tickInterval
                                });

                                options.yAxis = _.extend(options.yAxis || {}, {
                                    title: {
                                        text: dataObject.yAxisLabel
                                        , style: {
                                            color: 'black'
                                            , fontFamily: 'ge-inspira'
                                            , fontSize: '14'
                                        }
                                    }
                                    , startOnTick: true
                                    , offset: 0
                                });

                                options.tooltip = {
                                    crosshairs: true
                                    , formatter: function () {
                                        // $('#tooltipWaveform').html('Wf Amp: '+Math.round(this.y*100)/100+' mil pp '+Math.round(this.x)+'RPM');
                                        ;
                                        $('#tooltipWaveform').html('Wf Amp: ' + '<b>' + roundToFour(getData.peakToPeak) + '</b>' + '&nbsp' + getData.uom + '&nbsp; pp &nbsp;&nbsp;&nbsp;' + (getData.speed !== "" && getData.speed > 0 ? getData.speed + ' RPM' : "") + '; &nbsp;' + roundToFour(this.y) + '&nbsp' + getData.uom + '@ ' + roundToFour(this.x) + ' ms');
                                        $('#tooltipWaveform').removeClass('customLegend-hide').addClass('customLegend-show');
                                    },
                                    backgroundColor: 'none',
                                    borderWidth: 0,
                                    shadow: false,
                                    useHTML: true,
                                    padding: 0
                                };

                            }
                        }
                    }
                    else {
                        $("#errorWaveform").removeClass('hideLoadingIcon');
                        $("#errorWaveform").html("<div class='placeholderForCharts span12'>" +
                            "<div>" +
                            "<h3 class='centerText'>No Data Available </h3>" +
                            "</div> </div>");

                        // $('#errorWaveform').html("<h3 class='empty-chart' style='margin-left: 40%; margin-top: 10%; border:1px solid red' >No data available for selected options</h3>");
                        //instance.chart.destroy();
                        //instance = new Chart(element[0], options);

                        /* // $("#errorWaveform").removeClass('hideLoadingIcon');
                         $('#chartErrorDisplay').html("<h3 class='empty-chart' style='margin-left: 40%; margin-top: 10%; border:1px solid red' >No data available for selected options</h3>");
                         /// options.chart.showLoading();
                         $("#chartLoadDisplay").addClass('hideLoadingIcon');
                         //options.chart.hideLoading();*/
                    }
                    // options.exporting=true;

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
                    if (newData && newData.response) {
                        // Not very efficient.
                        if (instance) {
                            instance.chart.destroy();
                        }
                        instance = new Chart(element[0], newData, options);
                    }
                    else {
                        //  options.showLoading('No data to display');
                        if (instance) {
                            instance.chart.destroy();
                        }
                        //  instance = new Chart(element[0], newData, options);

                    }
                }, true);


            }
        };
    }])
    return directives;
});
