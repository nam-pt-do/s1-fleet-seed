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
    directives.directive('chartCategory', ['ctxGlobal', function (ctxGlobal) {
        return {
            scope: {
                data: '='
            },
            template: '<div id="categoryChart" style="height: 400px;display: block;">' +
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
                                svg.replace(/>\s+/g, ">").replace(/\s+</g, "<");

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


                                // Save locally
                                /*  var canvasdata = canvas.toDataURL("image/png");
                                 var a = document.createElement("a");
                                 a.download = "sample.png";
                                 a.href = canvasdata;
                                 a.click();*/


                            } else {
                                alert("Your browser doesn't support this feature, please use a modern browser");
                            }

                        }
                    }(Highcharts));

                    var self = this;

                    //FORMAT Data
                    //===============================================
                    var countHigh = 0, countMedium = 0, countLow = 0;

                    if (data[0] !== undefined) {
                        var eCategory = [], eType = [], dataSource = [], subgroup = [];
                        for (var i = 0; i < data[0].response.length; i++) {
                            if (eCategory.indexOf(data[0].response[i].eventConditionCategoryEnum) < 0) {
                                //unique value
                                eCategory.push(
                                    data[0].response[i].eventConditionCategoryEnum
                                )
                            }
                            if (eType.indexOf(data[0].response[i].enterpriseName) < 0) {
                                //unique value
                                eType.push(
                                    data[0].response[i].enterpriseName
                                )
                            }
                            if (eType.indexOf(data[0].response[i].dataSource) < 0) {
                                //unique value
                                dataSource.push(
                                    data[0].response[i].dataSource
                                )
                            }
                        }
                        data[0].response = _.filter(data[0].response, {"filterThis": true});


                        var system1Events = _.filter(data[0].response, {"dataSource": "System 1"});
                        var smartSignaEvents = _.filter(data[0].response, {"dataSource": "SmartSignal"});
                        var _subgroups = [];
                        if (data[0].options.selectedChildren) {
                            _.forEach(data[0].options.selectedChildren, function (obj) {
                                if (obj.childNodes) {
                                    if (subgroup.indexOf(obj.id) < 0) {
                                        //unique trainMachine value
                                        subgroup.push(
                                            obj.name
                                            //{"id":obj.id,"name":obj.name}
                                        );
                                    }
                                } else {
                                    if (subgroup.indexOf(obj) < 0) {
                                        //unique trainMachine value
                                        subgroup.push(
                                            obj.name
                                            //{"id":obj.id,"name":obj.name}
                                        );
                                    }
                                }
                            });
                        }
                        else {
                            //Case: Enterprise Id is null
                            //_subgroups= _.chain(system1Events).pluck('enterpriseId').flatten().unique().valueOf();
                            _subgroups = _.map(
                                _.where(system1Events),
                                function (obj) {
                                    return {"id": obj.enterpriseId, "name": obj.enterpriseName};
                                }
                            );
                        }

                        //Format data as per stub/alarmCategoryData.json
                        var formattedCategory = [], formattedEntNameDataSource = [], sevMatrix;
                        //var title="Alarm Count";
                        var cHigh = [], cMed = [], cLow = [];
                        var cHighShow = 0, cMedShow = 0, cLowShow = 0;
                        var totalHigh = 0, totalMedium = 0, totalLow = 0;

                        var sevMatrix = getSevLevelMatrix(data[0]);

                        //formattedCategory.push(data.enterpriseName);
                        formattedCategory.push(_.chain(sevMatrix).pluck('subgroup').unique().valueOf());
                        formattedEntNameDataSource.push(_.chain(sevMatrix).pluck('sourcetype').unique().valueOf());

                        var totalLength = sevMatrix.length;
                        //var totalCat=sevMatrix[0].length;

                        //Transpose Matrix
                        for (var l = 0; l < formattedCategory[0].length; l++) {
                            for (var j = 0; j < totalLength; j++) {
                                if (formattedCategory[0][l] == sevMatrix[j].subgroup) {
                                    if (sevMatrix[j].severityMatrix[0] > 0) totalHigh++;
                                    if (sevMatrix[j].severityMatrix[1] > 0) totalMedium++;
                                    if (sevMatrix[j].severityMatrix[2] > 0) totalLow++;
                                }
                            }
                            if (totalHigh != 0) cHighShow = -1;
                            if (totalMedium != 0) cMedShow = -1;
                            if (totalLow != 0) cLowShow = -1;

                            cHigh.push(totalHigh);
                            cMed.push(totalMedium);
                            cLow.push(totalLow);
                            totalHigh = 0;
                            totalMedium = 0;
                            totalLow = 0;
                        }

                        //formattedCategory.push(data.enterpriseName);
                        /*   var _data=[data[0].response];*/


                        /* while(i<_data.length){
                         formattedCategory.push([_data[i].enterpriseName]);
                         i++;
                         }*/
                        options.xAxis = _.extend(options.xAxis || {}, {
                            //categories: data.categories
                            // categories:[data.enterpriseName]
                            categories: formattedEntNameDataSource[0],

                            labels: {
                                formatter: function () {
                                    return '<span>' + this.value + '</span>';
                                }
                            }
                            /* ,title:{text: _.unique(dataSource)
                             ,style: {
                             color: 'black'
                             ,fontFamily:'ge-inspira'
                             ,fontSize:'14'
                             }
                             }*/


                        });
                    }

                    //Function to group subgroup and severity mapping
                    function getSubgroup(selectedChildren, _assetPath) {
                        //data=data[0].options.selectedChildren
                        var objName;
                        _.forEach(selectedChildren, function (obj) {
                            if (_assetPath.indexOf(obj.id) > -1) {
                                objName = obj.name
                            }
                        });
                        return objName;
                    }

                    //Function to group subgroup and severity mapping
                    function getSubgroup1(selectedChildren, _assetPath) {
                        //data=data[0].options.selectedChildren
                        var objName;
                        _.forEach(selectedChildren, function (obj) {
                            if (_assetPath.indexOf(obj.nodeId) > -1) {
                                objName = obj.nodeName
                            }
                            /*else{
                             if(_assetPath.indexOf(obj.enterpriseId)>-1){
                             objName=obj.nodeName;
                             }
                             }*/
                        });
                        return objName;
                    }

                    function getSevLevelMatrix(data) {
                        var formMatrix = [];
                        // var subgroup=data.options.selectedChildren[0];
                        var subgroup = ctxGlobal.getChildNodeIds();

                        for (var i = 0; i < data.response.length; i++) {
                            //Get Subgroup Name
                            if (subgroup) {
                                var subgroupName = getSubgroup1(subgroup, data.response[i].assetPath);
                            }
                            else {
                                subgroupName = getSubgroup(_subgroups[0], data.response[i].assetPath);
                            }

                            //Get Severity Matrix
                            if (data.response[i].normalizedSeverityLevel == 1) {
                                countLow = data.response[i].count;
                                countMedium = 0;
                                countHigh = 0;
                            }
                            else if (data.response[i].normalizedSeverityLevel == 2) {
                                countMedium = data.response[i].count;
                                countLow = 0;
                                countHigh = 0;
                            }
                            else if (data.response[i].normalizedSeverityLevel == 3) {
                                countHigh = data.response[i].count;
                                countLow = 0;
                                countMedium = 0;
                            }
                            //formMatrix.push([countHigh,countMedium,countLow]);
                            if (subgroupName) {
                                formMatrix.push({
                                    "subgroup": subgroupName,
                                    "sourcetype": subgroupName,
                                    "severityMatrix": [countHigh, countMedium, countLow]
                                });
                            }
                            else {
                                var entNameDataSource = data.response[i].enterpriseName + ' <br> ' + data.response[i].dataSource;
                                formMatrix.push({
                                    "subgroup": data.response[i].enterpriseName,
                                    "sourcetype": entNameDataSource,
                                    "severityMatrix": [countHigh, countMedium, countLow]
                                });
                            }
                        }
                        return formMatrix;
                    }

                    // =================================================
                    // CHART OPTIONS

                    Highcharts.setOptions({
                        credits: {
                            enabled: false
                        },
                        colors: ['#e31d26', '#ffed45', '#ff9821'] // [high, med, low] From Justine's mocks
                        , exporting: {
                            buttons: {
                                contextButton: {
                                    menuItems: [{
                                        text: 'Print',
                                        onclick: function () {
                                            this.print();
                                        }
                                    }, {
                                        text: 'Save as PNG',
                                        onclick: function () {
                                            this.createCanvas();
                                        },
                                        separator: false
                                    }]
                                }
                            }
                        }

                    });

                    options.chart = options.chart || {
                            type: 'column',
                            zoomType: 'xy',
                            marginTop: 50
                        };
                    options.chart.renderTo = el;
                    options.title = options.title || {text: null};

                    options.tooltip = {
                        pointFormat: '{series.name}: <b>{point.y}</b><br/>'

                    };

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
                            enabled: true,
                            verticalAlign: "top"
                            //,
                            /*formatter: function() {
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

                    // CHART OPTIONS
                    // =================================================
                    // =================================================
                    // DATA

                    // Populate the series array with empty series, each on its own axis,
                    // applying any series yAxis options
                    //options.series = data.series;

                    /*   var formatSeries=[
                     {"name":"High","data":[countHigh],"stack":"System 1"},
                     {"name":"Medium","data":[countMedium],"stack":"System 1"},
                     {"name":"Low","data":[countLow],"stack":"System 1"}
                     ];*/
                    //options.series=formatSeries;
                    options.series = [
                        {"name": "High", "data": cHigh}
                        , {"name": "Medium", "data": cMed}
                        , {"name": "Low", "data": cLow}
                    ];


                    // DATA
                    // =================================================

                    // CREATE THE CHART
                    self.chart = new Highcharts.Chart(options);

                    if (cHighShow == 0) {
                        $(self.chart.series[0].legendItem.element).trigger('click');
                    }
                    if (cMedShow == 0) {
                        $(self.chart.series[1].legendItem.element).trigger('click');
                    }
                    if (cLowShow == 0) {
                        $(self.chart.series[2].legendItem.element).trigger('click');
                    }

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
                        /*  if(newData[0].response){
                         instance = new Chart(element[0], newData, options);
                         }*/
                        instance = new Chart(element[0], newData, options);
                    }
                    else {
                        if (instance) {
                            instance.chart.destroy();
                        }
                    }


                }); // true tells $watch to compare object, not reference
            }
        };
    }])
    return directives;
})
