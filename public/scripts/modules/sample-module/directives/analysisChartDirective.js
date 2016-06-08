/*global define */
define(['angular', 'directives-module', 'exportchart'], function(angular, directives, exportChart) {
	'use strict';

	/* Directives  */
	directives.directive('analysisChart', ['$rootScope', 'ctxGlobal',
	function($rootScope, ctxGlobal) {
		return {
			scope : {
				taginfo : '=',
				chartobjs : '=',
				onZoom : '='
			},
			yAxisUnitList : [],
			template : '<div class="chart-content pull-left" style="width: 1024px;margin-left:50px;"></div><table id="legend" class="pull-right"></table>',
			restrict : 'AE',
			link : function($scope, element, attrs) {
				var divEle = element[0].children[0];
				var dataSeries = [];
				var xAxisMin;
				var xAxisMax;
				var yaxisList = [];
				var yAxisSeries = [];
				var computedtickInterval;
				var categories = [];
				self.yAxisUnitList = [];
				var colorSeries = ["#2f7ed8", "#8bbc21", "#910000", "#f28f43", "#77a1e5", "#c42525", "#a6c96a", "#0d233a", "#1aadce", "#492970"];
				var legend = $(divEle).next();
				$scope.loading = false;
				var zoomAxis = {
					xMin : "",
					xMax : ""
				};

				if ($rootScope.selectedTz == 'tzLocal') {
					Highcharts.setOptions({
						global : {
							useUTC : false
						}
					});
				} else {
					Highcharts.setOptions({
						global : {
							useUTC : true
						}
					});

				}

				// Add data to new series
				// oldData - data from server
				// newData - array we are going to fill with new data
				// tId - timezone
				function setupSeriesData(oldData, newData, tId) {
					_.each(oldData, function(dta, idx) {
						if ($rootScope.selectedTz == 'tzLocal') {
							var newDate = moment(dta.date).valueOf();
						} else {
							var newDate = moment(dta.date).utc(dta.date).valueOf();
						}
						newData.push([newDate, dta.actual]);
					});
				}

				function addMultipleYAxis(uom, seriesData) {
					var numOfYaxis = yAxisSeries.length;
					var oppositeSide = false;
					var yAxisOffset = 0;
					var yAxisLabelOffset = 0;
					var labelAlignment;
					var labelOffsetX = 0;
					var labelOffsetY = 0;
					var axisLabelOffset = 0;
					oppositeSide = numOfYaxis % 2 === 0 ? true : false;
					yAxisOffset = (numOfYaxis - 1) / 2 * 50;
					yAxisLabelOffset = (numOfYaxis - 1) / 2 * 10;
					labelOffsetX = 10;
					axisLabelOffset = 35;
					labelAlignment = "left";
					var blockAddYaxis = _.contains(self.yAxisUnitList, uom);
					if (!blockAddYaxis) {
						yAxisOffset = yAxisOffset + 35;
						self.yAxisUnitList.push(uom);
						yAxisSeries.push({
							id : uom,
							lineColor : seriesData.color,
							offset : yAxisOffset,
							labels : {
								formatter : function() {
									return Math.round(this.value * 100) / 100;
								}
							},
							title : {
								text : '(' + uom + ')',
								offset : yAxisLabelOffset,
								align : 'high',
								rotation : 0,
								x : 0,
								y : -10,
								margin : 10
							},
							opposite : oppositeSide
						});
					}
				}


				$scope.setPoint = function(x, y, id, e) {
					var container = $(chart.container);
					var offset = container.offset();
					var _hotSpot = {
						x : "",
						y : "",
						graphindex : null,
						element : divEle,
						id : "",
						xAxis : [],
						yAxis : []
					};
					_hotSpot.x = x;
					_hotSpot.y = y - chart.plotTop - offset.top;
					_hotSpot.id = id;
					_hotSpot.xAxis = chart.xAxis;
					_hotSpot.yAxis = chart.yAxis;
					$scope.updateCursorInfo(_hotSpot, x, e);
				};

				$scope.updateCursorInfo = function(data, x, e) {
					var norm = chart.pointer.normalize(e);

					// Make call to controller to update table
					if ($scope.chartobjs.length > 0) {
						_.each($('.chart-content'), function(chartEle, idx) {
							var charOb = Highcharts.charts[$(chartEle).attr('data-highcharts-chart')];
							var list = [];
							var xAxis;
							if (charOb.series !== null && typeof (charOb.series) !== "undefined" && charOb.series.length > 0) {
								_.each(charOb.series, function(obj, indx) {
									if (charOb.series[indx].points[e.target.index]) {
										list.push(charOb.series[indx].points[e.target.index]);
									}
								});
								charOb.tooltip.refresh(list);
								xAxis = charOb.xAxis[0];
								xAxis.removePlotLine("myPlotLineId");
								xAxis.addPlotLine({
									value : data.x,
									width : 2,
									color : 'black',
									id : "myPlotLineId"
								});
							}
						});
					}
				};
				$scope.syncExtremes = function(e) {
					var thisChart = this.chart;
					if (e.trigger !== 'syncExtremes') {// Prevent feedback loop
						_.each($scope.chartobjs, function(chart, idx) {
							if (chart !== thisChart) {
								if (chart.xAxis[0].setExtremes) {// It is null while updating
									chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, {
										trigger : 'syncExtremes'
									});
								}
							}
						});
					}
				};
				$scope.updateChartWithZoom = function(zoomAxis) {
					// Make call to controller to update table
					if ($scope.onZoom) {
						$scope.onZoom(zoomAxis);
					}
				};

				$scope.$watch('$parent.loading', function(newVal, oldVal) {
					console.log(" This is the load status: of chart " + $scope.$parent.loadingChart);
					$scope.loading = newVal;
				});

				$scope.init = function() {

					xAxisMin = moment($scope.taginfo.eventTime).format("X") * 1000;
					xAxisMax = moment($scope.taginfo.endEventTime).format("X") * 1000;

					_.each($scope.taginfo.response, function(tObj, idx) {
						// ** tagInfo object is  plotChart Object { tagsArray , tagsValues}
						var timeZoneId = 'tzLocal';
						var tagData;
						var seriesData = {
							data : [],
							name : '',
							yAxis : '',
							color : '',
							tooltip : {}
						};

						//set name of series
						var index = idx + 1;
						var selectedNode = ctxGlobal.getEnterpriseNode();
						seriesData.name = index + ". " + tObj.tagNode.name + " (" + tObj.uom + ") " + " [<i>" + selectedNode + "->" + tObj.tagNode.nodeNamePath + "</i>]";
						seriesData.type = 'line';
						//seriesData.showInLegend = false;
						seriesData.yAxis = tObj.tagNode.units;
						seriesData.color = colorSeries[idx % 10];
						seriesData.tooltip = {
							valueSuffix : '(' + tObj.tagNode.units + ')'
						};

						//the actual data for one of the series
						tagData = $scope.taginfo.response[idx].data || null;
						// tagValues is an array each contains data for series
						// if we have actual data
						if (tagData) {
							tagData.name = seriesData.name;
							tagData.type = 'spline';
							tagData.yAxis = tObj.tagNode.units;
							tagData.color = colorSeries[idx % 10];
							tagData.tooltip = {
								valueSuffix : '(' + tObj.tagNode.units + ')'
							};
							//add data to series
							setupSeriesData(tagData, seriesData.data, timeZoneId);
						}
						/** [{}] **/ //series should be an object with name and array in it

						dataSeries.push(seriesData);
						// adding multiple y axis
						addMultipleYAxis(tObj.tagNode.units, seriesData);

					});
				};

				$scope.init();
				var options = {
					chart : {
						renderTo : divEle,
						type : 'line',
						height : 400,
						zoomType : 'xy',
						resetZoomButton : {
							position : {
								align : 'right', // by default
								verticalAlign : 'top', // by default
								x : -50,
								y : -25
							},
							relativeTo : 'chart'
						},
						spacingTop : 40,
						spacingBottom : 100,
						events : {
							load : function() {
								var chart = this;
								legend.empty().removeClass('show');
							}
						}
					},
					title : {
						text : null
					},
					subtitle : {
						text : null
					},
					legend : {
						align : "center",
						verticalAlign : 'bottom',
						enabled : true,
						layout : "vertical",
						floating : true,
						borderWidth : 1,
						borderRadius : 4,
						y : 90,
						useHTML : true,
						labelFormatter : function() {
							var label = "<span style='color:" + this.color + "'>" + this.name + "</span>";
							return label;
						}
					},
					xAxis : {
						type : 'datetime',
						//categories : categories,
						labels : {
							rotation : -45,
							align : 'right',
							format : '{value:%m-%d-%y <br/> %H:%M:%S}'
						},

						tickPositioner : function() {
							var extremes = this.chart.xAxis[0].getExtremes();
							if (extremes.min != null && extremes.max != null) {
								var extremes = this.chart.xAxis[0].getExtremes();
								var positions = [];
								var maxData = Math.ceil(extremes.max);
								var minData = Math.floor(extremes.min);

								if ((maxData - minData) > 8) {
									var increment = Math.ceil((maxData - minData) / 8);
								} else {
									var increment = 1;
								}
								for (minData; minData - increment < maxData; minData += increment) {
									if (minData < maxData)
										positions.push(minData);
								}
								if (positions[positions.length - 1] !== maxData) {
									positions.push(maxData);
								}
								return positions;
							}
						},

						tickmarkPlacement : "on",
						startOnTick : true,
						endOnTick : true,
						crosshair : true,
						events : {
							setExtremes : $scope.syncExtremes
						}
					},
					yAxis : yAxisSeries,
					tooltip : {
						shared : true,
						useHTML : true,
						followPointer : true,
						crosshairs : true,
						formatter : function() {
							var sstoolTipsText = '';
							var s1toolTipsText = '';
							sstoolTipsText = sstoolTipsText + '<table>';
							s1toolTipsText = s1toolTipsText + '<table>';
							var index = this.points[0].point.index;
							var t = Highcharts.dateFormat('%a %e-%b-%Y %H:%M:%S', new Date(this.points[0].x));
							s1toolTipsText = s1toolTipsText + '<tr><td>' + ' Time :' + '</td>' + '<td>' + t + '</td></tr>';
							_.each(this.points, function(pt, idx) {
								var uom = pt.series.userOptions.uom || '';
								s1toolTipsText = s1toolTipsText + '<tr style="color:' + pt.series.color + '">' + '<td>' + (idx + 1) + '.</td>' + '<td>' + pt.y + '</td>' + '</tr>';
							});

							var formattedS1Tooltip = s1toolTipsText + '</table>';
							return formattedS1Tooltip;
						},
						style : {
							padding : 10,
							fontWeight : 'bold'
						},

					},

					plotOptions : {
						spline : {
							turboThreshold : 5000,
						}
					},

					series : dataSeries,
					exporting : {
						enabled : false
					}
				};

				// Create new chart
				if ($scope.taginfo.response.length == 1) {
					if ($scope.chartobjs.length) {
						$($scope.chartobjs).each(function(index, val) {
							val.latest = false;
						});
					}
					var chart = new Highcharts.Chart($.extend(true, {}, options));
					chart.latest = true;
					$scope.chartobjs.push(chart);
				} else {
					var chartObjIndex;
					if ($scope.chartobjs.length) {
						$($scope.chartobjs).each(function(index, val) {
							if (val.latest) {
								chartObjIndex = index;
								$scope.chartobjs.splice(chartObjIndex, 1);
								return false;
							}
						});
					}
					var chart = new Highcharts.Chart($.extend(true, {}, options));
					chart.latest = true;
					$scope.chartobjs.splice(chartObjIndex, 0, chart);
				}
				$scope.$emit('update-chartobj', {
					chartobj : $scope.chartobjs
				});
				/*
				$scope.chartobjs = [];
				_.each($('.chart-content'),function(chartElement,idx){
				console.log($(chartElement).attr('data-highcharts-chart'))
				$scope.chartobjs.push(Highcharts.charts[$(chartElement).attr('data-highcharts-chart')]);
				});
				console.log($scope.chartobjs);*/

				// Add new chart to list of viewed charts

			}
		};
	}]);
	return directives;
});
