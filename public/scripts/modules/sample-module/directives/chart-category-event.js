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
    directives.directive('chartCategoryEvent', ['ctxGlobal', function (ctxGlobal) {
        return {
            scope: {
                data: '='
            },
            template: '<div style="height: 400px;display: block;">' +
            '<div><i class="icon-spinner icon-spin" style="font-size: 30px;margin-left: 30%;margin-top: 15%;"></i> <span>Loading...</span></div></div>',
            restrict: 'AE',
            link: function postLink(scope, element, attrs) {

                function Chart(el, data, options) {
                    (function (H) {
                        H.Chart.prototype.createCanvas = function (divId) {
                           
                            var svg = this.getSVG(),
                                width = parseInt(svg.match(/width="([0-9]+)"/)[1]),
                                height = parseInt(svg.match(/height="([0-9]+)"/)[1]),
                                canvas = document.createElement('canvas');

                            canvas.setAttribute('width', width);
                            canvas.setAttribute('height', height);

                            if (canvas.getContext && canvas.getContext('2d')) {
                                canvg(canvas, svg);
                                if (ctxGlobal.getBrowser() > 0) {
                                    //IE Browser
                                    var image = canvas.msToBlob();
                                    if (navigator.msSaveBlob) {
                                        return navigator.msSaveBlob(new Blob([image], {type: "image/png"}), "download.png");
                                    }
                                }
                                else {
                                    canvg(canvas, svg, {
                                        renderCallback: function () {
                                            var image = canvas.toDataURL("image/png")
                                                .replace("image/png", "image/octet-stream");
                                            open(image);
                                        }
                                    })
                                }
                            } else {
                                alert("Your browser doesn't support this feature, please use a modern browser");
                            }

                        }
                    }(Highcharts));
                    var self = this;

                    // =================================================
                    // CHART OPTIONS

                    Highcharts.setOptions({
                        credits: {
                            enabled: false
                        },
                        colors: ['#e31d26', '#ffed45', '#ff9821'] // [high, med, low] From Justine's mocks
                        , navigation: {
                            buttonOptions: {
                                enabled: true
                            }
                        }
                    });

                    options.chart = options.chart || {
                            type: 'column',
                            marginTop: 50
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
                        }
                        , stackLabels: {
                            enabled: true
                            /*, verticalAlign:"bottom",
                             formatter: function() {
                             return  this.stack;
                             }*/
                        }
                    });

                    options.plotOptions = _.extend(options.plotOptions || {}, {
                        column: {
                            dataLabels: {
                                enabled: true
                            }
                        },
                        series: {
                            pointWidth: 80//width of the column bars irrespective of the chart size
                        }
                    });

                    if (attrs.stacked === 'true') {
                        options.plotOptions = _.extend(options.plotOptions || {}, {
                            column: {
                                stacking: 'normal'
                            }
                        });
                    }

                    options.legend = {
                        enabled: true
                        , align: 'center'
                        , verticalAlign: 'top'
                        , borderWidth: 0
                    };
                    options.tooltip = {
                        pointFormat: '{series.name}: <b>{point.y}</b><br/>'

                    };

                    // CHART OPTIONS
                    // =================================================

                    // =================================================
                    // DATA

                    // Populate the series array with empty series, each on its own axis,
                    // applying any series yAxis options
                    // options.series = data.series;

                    var enterpriseList = [], dataSourceList = [], dataSourceData = [], eventCategory = [];
                    var enterpriseListData, countHigh = 0, countMedium = 0, countLow = 0, _series = [];

                    function getSevLevelMatrix(data) {
                        var formMatrix = [];
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].normalizedSeverityLevel == 1) {
                                countLow = data[i].count;
                                countMedium = 0;
                                countHigh = 0;
                            }
                            else if (data[i].normalizedSeverityLevel == 2) {
                                countMedium = data[i].count;
                                countLow = 0;
                                countHigh = 0;
                            }
                            else if (data[i].normalizedSeverityLevel == 3) {
                                countHigh = data[i].count;
                                countLow = 0;
                                countMedium = 0;
                            }
                            formMatrix.push([countHigh, countMedium, countLow]);
                        }
                        return formMatrix;
                    }

                    var _categories = [];
                    if (data[0] !== undefined) {
                        data[0].response = _.filter(data[0].response, {"filterThis": true});

                        var dataLength = data[0].response.length;

                        //get Enterprise List
                        for (var i = 0; i < dataLength; i++) {
                            if (enterpriseList.indexOf(data[0].response[i].enterpriseId) < 0) {
                                //unique value
                                enterpriseList.push(
                                    data[0].response[i].enterpriseId
                                )
                            }
                            if (_categories.indexOf(data[0].response[i].dataSource + ' ' + data[0].response[i].fleetCategoryEnum) < 0) {
                                //unique value
                                _categories.push(
                                    data[0].response[i].dataSource + ' ' + data[0].response[i].fleetCategoryEnum
                                )
                            }
                            if (dataSourceList.indexOf(data[0].response[i].dataSource) < 0) {
                                //unique value
                                dataSourceList.push(
                                    data[0].response[i].dataSource
                                )
                            }
                        }
                        var tempHigh = [], tempMed = [], tempLow = [];
                        var _seriesObject = {};
                        _.forEach(dataSourceList, function (obj) {
                            dataSourceData = _.filter(data[0].response, {'dataSource': obj});
                            eventCategory = _.chain(dataSourceData).pluck('fleetCategoryEnum').flatten().unique().valueOf();

                            _.forEach(eventCategory, function (eventCategory) {
                                var getObj = _.filter(dataSourceData, {'fleetCategoryEnum': eventCategory});
                                var categoryData = [];
                                categoryData.push({
                                    "name": eventCategory
                                    , "data": getSevLevelMatrix(getObj)
                                    , "stack": dataSourceList
                                });
                                var cLow = 0, cHigh = 0, cMed = 0;
                                for (var l = 0; l < categoryData.length; l++) {
                                    for (var j = 0; j < categoryData[l].data.length; j++) {
                                        cHigh = cHigh + categoryData[l].data[j][0];
                                        cMed = cMed + categoryData[l].data[j][1];
                                        cLow = cLow + categoryData[l].data[j][2];
                                    }
                                }
                                _seriesObject.eventCategory = eventCategory;
                                tempHigh.push([obj, cHigh]);
                                tempMed.push([obj, cMed]);
                                tempLow.push([obj, cLow]);
                            })
                        });

                        /*

                         var  tempHigh=[],tempMed=[], tempLow=[] ;
                         _.forEach(enterpriseList,function(enterpriseList){
                         enterpriseListData= _.filter(data[0].response,{'enterpriseId':enterpriseList});
                         _.forEach(dataSourceList,function(dataSourceList){
                         dataSourceData= _.filter(enterpriseListData,{'dataSource':dataSourceList});
                         _.forEach(eventCategory,function(eventCategory){
                         var getObj= _.filter(dataSourceData,{'fleetCategoryEnum':eventCategory});
                         var categoryData=[];
                         categoryData.push({
                         "name":eventCategory
                         ,"data":getSevLevelMatrix(getObj)
                         ,"stack":dataSourceList
                         });
                         var cLow=0,cHigh=0,cMed=0;
                         for(var l=0;l<categoryData.length;l++){
                         for(var j=0;j<categoryData[l].data.length;j++){
                         cHigh=cHigh+categoryData[l].data[j][0];
                         cMed=cMed+categoryData[l].data[j][1];
                         cLow=cLow+categoryData[l].data[j][2];
                         }
                         }
                         tempHigh.push(cHigh);
                         tempMed.push(cMed);
                         tempLow.push(cLow);

                         */
                        /* _series.push({
                         "name":eventCategory+"High",
                         "stack":eventCategory,
                         //"data":[cHigh]
                         data: [5,2]

                         },
                         {
                         "name":eventCategory+"Medium",
                         "stack":eventCategory,
                         // "data":[cMed]
                         data: [6,2]
                         },
                         {
                         "name":eventCategory+"Low",
                         "stack":eventCategory,
                         //  "data":[cLow]
                         data: [7,2]
                         });*/
                        /*

                         })
                         });
                         });

                         */
                        _series.push({
                                "name": "High",
                                //  "stack":_seriesObject.eventCategory,
                                //"data":[cHigh]
                                data: tempHigh

                            },
                            {
                                "name": "Medium",
                                //  "stack":_seriesObject.eventCategory,
                                // "data":[cMed]
                                data: tempMed
                            },
                            {
                                "name": "Low",
                                //    "stack":_seriesObject.eventCategory,
                                //  "data":[cLow]
                                data: tempLow
                            });


                        options.xAxis = _.extend(options.xAxis || {}, {
                            categories: _categories
                            , labels: {
                                y: 12,
                                paddingBottom: '20px',
                                marginBottom: '80px'
                            }
                            //  categories: ['Smart Signal','Asset Management','Instrument Protection']
                            /*   ,
                             labels: {
                             formatter: function() {
                             return  '<span>'+this.value+'</span>';
                             }

                             },
                             stack:'normal'
                             ,startOnTick:true
                             ,min:0
                             ,offset:0
                             ,title:{
                             text:dataSourceList
                             ,style: {
                             color: 'black'
                             ,fontFamily:'ge-inspira'
                             ,fontSize:'14'
                             }
                             }*/
                        });
                    }

                    options.series = _series;

                    // DATA
                    // =================================================

                    // CREATE THE CHART
                    self.chart = new Highcharts.Chart(options
                        /*, function(chart){
                         $('.highcharts-axis:first > text').each(function() {
                         this.setAttribute('y', parseInt(this.getAttribute('y')) - 80)
                         });

                         if(dataSourceList.length>0){
                         var text1 = chart.renderer.text(dataSourceList[0], 205, 395).add();
                         var text2 = chart.renderer.text(dataSourceList[1], 750, 395).add();
                         }
                         }*/
                    );
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
                    if (newData) {
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

                });
            }

        };
    }])
    return directives;
})
