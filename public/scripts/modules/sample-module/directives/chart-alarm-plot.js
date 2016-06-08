/* global Highcharts, moment, _ */

/**
 * Category Chart Angular Directive
 * @author : Deepika singh - deepika.singh@ge.com
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
define(['angular', 'directives-module', 'exportchart'], function(angular, directives, exportchart) {
	'use strict';

	/* Directives  */
	directives.directive('chartAlarmPlot', ['dateFormatter', 'ctxGlobal', 'UserSelections', 'ctxSetpoints',
	function(dateFormatter, ctxGlobal, UserSelections, ctxSetpoints) {
		return {
			scope : {
				data : '='
			},
			template : '<div style="height: 100px;">' + '<div id="chartLoadDisplay">' + '<div id="loadIcon">' + '<i class="icon-spinner icon-spin" style="font-size: 30px;margin-left: 30%;margin-top: 15%;"></i>' + ' <span>Loading...</span>' + '</div></div></div>',
			restrict : 'AE',
			link : function postLink(scope, element, attrs) {
				function Chart(el, data, options) {/*
				( function(H) {
											H.Chart.prototype.createCanvas = function(divId) {
												var svg = this.getSVG(),
													width = parseInt(svg.match(/width="([0-9]+)"/)[1]),
													height = parseInt(svg.match(/height="([0-9]+)"/)[1]),
													canvas = document.createElement('canvas');
				
												canvas.setAttribute('width', width);
												canvas.setAttribute('height', height);
				
												if (canvas.getContext && canvas.getContext('2d')) {
				
													
				
													if (ctxGlobal.getBrowser() > 0) {
														//IE Browser
														canvg(canvas, svg, {
															renderCallback : function() {
																var image = canvas.msToBlob();
																if (navigator.msSaveBlob) {
																	return navigator.msSaveBlob(new Blob([image], {
																		type : "image/png"
																	}), "download.png");
																}
															}
														})
				
													} else {
														canvg(canvas, svg, {
															renderCallback : function() {
																var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
																//  open(image);
																window.location.href = image;
															}
														})
													}
				
													// var chart_img = canvas.toDataURL('image/png');
													// window.location.href=chart_img;
				
												} else {
													alert("Your browser doesn't support this feature, please use a modern browser");
												}
				
											}
										}(Highcharts))*/
				;

					var self = this;
					var _useUTC,
					    xAxisLabelTimeZone;
					// =================================================
					// CHART OPTIONS
					// var preferredTimeZone=UserSelections.getTimezone()||'tzLocal';

					function roundToFour(num) {
						return +(Math.round(num + "e+4") + "e-4");
					}

					function roundToTwo(num) {
						return +(Math.round(num + "e+2") + "e-2");
					}

					if (data.preferredTimeZone == 'tzLocal') {
						_useUTC = false;
						xAxisLabelTimeZone = 'Time (Local)';
					} else {
						_useUTC = true;
						xAxisLabelTimeZone = 'Time (GMT)';
					}
					Highcharts.setOptions({
						credits : {
							enabled : false
						},
						chart : {
							zoomType : 'xy',
							resetZoomButton : {
								position : {
									x : -50,
									y : 2
								},
								relativeTo : 'chart'
							}
						},

						//  useUTC: false,
						//  useUTC: _useUTC,
						global : {
							useUTC : _useUTC
						},
						colors : ['#000000', '#058DC7', '#fba13b', '#50B432', '#4B0082'],
						loading : {
							labelStyle : {
								top : '45%',
								formatter : '<i class="loading">Loading chart</i> '
							}
						},
						backgroundColor : 'none',
						borderWidth : 0,
						shadow : false,
						useHTML : true,
						renderTo : element,
						padding : 5,
						exporting : {
							buttons : {
								contextButton : {
									y : -10,
									align : 'right'/*
									,
																		menuItems : [{
																			text : 'Print',
																			onclick : function() {
																				this.print();
																			}
																		}, {
																			text : 'Save as PNG',
																			onclick : function() {
																				this.createCanvas();
																			},
																			separator : false
																		}]*/
									
								}

							},
							enabled : true
						},
						events : {
							load : function() {
								var chart = this;
							}
						}
					});
					options.chart = options.chart || {
						type : 'spline'
					};

					options.chart.renderTo = el;
					options.title = options.title || {
						text : null
					};

					if (attrs.stacked === 'true') {
						options.plotOptions = _.extend(options.plotOptions || {}, {
							column : {
								stacking : 'normal'
							}
						});
					}
					if (attrs.xAxis === 'false') {
						options.plotOptions = _.extend(options.plotOptions || {}, {
							xAxis : 1
						})
					}
					if (attrs.height) {
						options.chart.height = attrs.height;
						options.chart.marginTop = 50;
					}
					options.legend = {
						enabled : true,
						align : 'center',
						verticalAlign : 'top',
						layout : 'horizontal',
						y : 30,
						navigation : {
							activeColor : '#3E576F',
							animation : true,
							arrowSize : 12,
							inactiveColor : '#CCC',
							style : {
								fontWeight : 'bold',
								color : '#333',
								fontSize : '12px'
							}
						},
						borderWidth : 0
					};
					options.navigation = {
						buttonOptions : {
							align : 'right',

						}
					};
					options.exporting = {
						buttons : {
							contextButton : {
								align : 'right',
								x : -5,
								y : 10
							}
						}
					};

					// CHART OPTIONS
					// =================================================
					// =================================================
					// DATA

					// Populate the series array with empty series, each on its own axis,
					// applying any series yAxis options
					// options.series = data.series;

					//FORMAT Data

					var convert_argbToHex = function argbToRGB(color) {
						return '#' + ('000000' + (color & 0xFFFFFF).toString(16)).slice(-6);

						//   return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
						//Assumption: Background = white = 255,255,255 in RGB

					};

					var ssRuleColor,
					    ssDiagRuleColor;
					var checkAdvisoryType = function(advisories, testId) {
						var nodeType;
						var node = _.filter(advisories, {"nodeId": testId})[0];
						if (node !== undefined) {
							nodeType = node.nodeTypeEnum;
							if (node.nodeTypeEnum == "ss_rule") {
								ssRuleColor = convert_argbToHex(node.ssExtra.color);
							} else {
								if (node.nodeTypeEnum == "ss_diagnostic_rule") {
									ssDiagRuleColor = convert_argbToHex(node.ssExtra.color);
								}
							}
						} else {
							nodeType = false
						}
						return nodeType;
					};

					//CHECK 1: Identify if the call is for System 1 or SmartSignal Alarm Plot
					var plotType;
					if (data !== undefined || data.length !== undefined) {
						// if(data[0].response[0]!==undefined){
						if (data.response !== undefined) {
							plotType = "system1";
						} else {
							if (data.data !== undefined) {
								plotType = "smartSignal";
							}
						}
					}

					var setPoints = {};
					if (plotType == "system1") {
						var dataSet,
						    _series = [],
						    _timeline = [],
						    _setpoints = [],
						    _uom,
							_subunits,
						    _additionalRangeforAcceptanceRegion;
						var setpointSev1 = [],
						    setpointSev2 = [],
						    setpointSev3 = [],
						    setpointSev4 = [];

						var seriesArr = [],
						    setPointSymbolSeries = {};
						if (data !== undefined) {
							if (data.response.indexOf('Error 500') > -1) {
								$('#chartLoadDisplay').html("<div class='placeholderForCharts span12'>" + "<div>" + "<h3 class='centerText'>No Data Available</h3>" + "</div> </div>");
								$("#loadIcon").addClass('hideLoadingIcon');
							} else {
								var getData = data;

								//  var lastOccurred = moment(data.eventTime).valueOf();
								//Get evenTime for static Vertical Line
								if (data.preferredTimeZone == 'tzLocal') {
									//  var lastOccurred=Date.UTC(moment(data.eventTime).year(),moment(data.eventTime).month(),moment(data.eventTime).date(),moment(data.eventTime).hour(),moment(data.eventTime).minute(),moment(data.eventTime).second());
									var lastOccurred = moment(data.eventTime).valueOf();
								} else {
									var lt = moment(data.eventTime).format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
									lastOccurred = moment(lt).valueOf();
								}

								// var lastOccurred = moment(data.eventTime).valueOf();
								_uom = data.response[0].uom;
								if(data.response[0].subunits) {
									_subunits = data.response[0].subunits;
								} else {
									_subunits = "";
								}
								
								_.forEach(data.response, function(data) {
									//Map time(X-axis) and value(Y-axis)
									_.forEach(data.data, function(obj) {
										if (data.preferredTimeZone == 'tzLocal') {
											_timeline.push(moment(obj.date).valueOf());
											_series.push([moment(obj.date).valueOf(), obj.actual]);
										} else {
											_timeline.push((moment(obj.date).utc(obj.date)).valueOf());

											_series.push([(moment(obj.date).utc(obj.date)).valueOf(), obj.actual, obj.speed]);
										}
										//  _timeline.push(Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()));
										//  _series.push([Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()),  obj.actual]);
									});

									seriesArr.push({
										"name" : "System 1 Trend Plot",
										"data" : _series,
										"type" : 'spline',
										"marker" : {
											enabled : false
										},
										"color" : 'black',
										"showInLegend" : false

									});

									//Get series for plotting the setpoints
									setpointSev1 = [],
									setpointSev2 = [],
									setpointSev3 = [],
									setpointSev4 = [];

									//Get data for Setpoints
									//Logic: If "setpointTypeEnum":"levelover" then consider min as the value, else if "setpointTypeEnum"!="levelover", then min and level B defines the band values
									var setPointArray = data.tagNode.setpoints;
									ctxSetpoints.resetPlotSetpoints();

									_.forEach(setPointArray, function(point) {
										var tempSeries = [];
										var baseData = data.data;
										var len = baseData.length - 1;
										setPoints.sev1 = tempSeries;
										setPointSymbolSeries.x = _series[len][0];
										var setpointOverImage = [];
										var setpointUnderImage = [];
										//when variable = Gap in System 1 the arrows are in reverse
										if (data.tagNode.name == "Gap" || data.tagNode.name == "Bias Voltage"){
											setpointUnderImage[0] = 'url(../images/Sev1-Over-Icon.png)';
											setpointUnderImage[1] = 'url(../images/Sev2-Over-Icon.png)';
											setpointUnderImage[2] = 'url(../images/Sev3-Over-Icon.png)';
											setpointUnderImage[3] = 'url(../images/Sev4-Over-Icon.png)';
											setpointOverImage[0]  = 'url(../images/Sev1-Under-Icon.png)';
											setpointOverImage[1]  = 'url(../images/Sev2-Under-Icon.png)';
											setpointOverImage[2]  = 'url(../images/Sev3-Under-Icon.png)';
											setpointOverImage[3]  = 'url(../images/Sev4-Under-Icon.png)';											
										}
										else {
											setpointUnderImage[0] = 'url(../images/Sev1-Under-Icon.png)';
											setpointUnderImage[1] = 'url(../images/Sev2-Under-Icon.png)';
											setpointUnderImage[2] = 'url(../images/Sev3-Under-Icon.png)';
											setpointUnderImage[3] = 'url(../images/Sev4-Under-Icon.png)';
											setpointOverImage[0]  = 'url(../images/Sev1-Over-Icon.png)';
											setpointOverImage[1]  = 'url(../images/Sev2-Over-Icon.png)';
											setpointOverImage[2]  = 'url(../images/Sev3-Over-Icon.png)';
											setpointOverImage[3]  = 'url(../images/Sev4-Over-Icon.png)';							
										}
										switch (point.severity) {
										case 1: {
											switch (point.setpointTypeEnum) {

											case 'over' : {
												//console.log("LevelOver - only 1 line for sev 1");
												_setpoints.push({
													color : '#1EC2EC',
													value : point.min,
													width : 2
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.min
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointOverImage[0]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 10
												});

												ctxSetpoints.setPlotSetpoints("Sev1 over", point.setpointTypeEnum, roundToTwo(point.min), '#1EC2EC', setpointOverImage[0]);
												break;
											}
											case 'under' : {
												_setpoints.push({
													color : '#1EC2EC',
													value : point.max,
													width : 2
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.max
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointUnderImage[0]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 10
												});

												ctxSetpoints.setPlotSetpoints("Sev1 under", point.setpointTypeEnum, roundToTwo(point.max), '#1EC2EC', setpointUnderImage[0]);
												break;
											}
											case 'acceptance_region' : {
												_setpoints.push({
													color : '#1EC2EC',
													value : point.min,
													width : 2
												});
												_setpoints.push({
													color : '#1EC2EC',
													value : point.max,
													width : 2
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.min
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointOverImage[0]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 10
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.max
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointUnderImage[0]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 10
												});
												ctxSetpoints.setPlotSetpoints("Sev1 acceptance-region", point.setpointTypeEnum, roundToTwo(point.min) + ',' + roundToTwo(point.max), '#1EC2EC', 'url(../images/Sev1-Acceptance-Region-Icon.png)');
												_additionalRangeforAcceptanceRegion = (point.begin != 0 || point.end != 0) ? roundToTwo(point.begin) + ',' + roundToTwo(point.end) + ' deg' : undefined;
												break;
											}
											case 'in_band': {
												_setpoints.push({
													color : '#1EC2EC',
													value : point.min,
													width : 2
												});
												_setpoints.push({
													color : '#1EC2EC',
													value : point.max,
													width : 2
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.min
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointOverImage[0]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 10
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.max
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointUnderImage[0]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 10
												});
												ctxSetpoints.setPlotSetpoints("Sev1 in-band", point.setpointTypeEnum, roundToTwo(point.min) + ',' + roundToTwo(point.max), '#1EC2EC', 'url(../images/Sev1-In-Band-Icon.png)');
												break;
											}
											case 'out_of_band':
												{
													_setpoints.push({
														color : '#1EC2EC',
														value : point.min,
														width : 2
													});
													_setpoints.push({
														color : '#1EC2EC',
														value : point.max,
														width : 2
													});
													seriesArr.push({
														"name" : "Setpoint Symbol",
														"data" : [{
															'x' : setPointSymbolSeries.x,
															'y' : point.min
														}],
														"type" : 'scatter',
														"marker" : {
															enabled : true,
															symbol : setpointUnderImage[0]
														},
														"size" : 0,
														"showInLegend" : false,
														"zIndex" : 6
													});
													seriesArr.push({
														"name" : "Setpoint Symbol",
														"data" : [{
															'x' : setPointSymbolSeries.x,
															'y' : point.max
														}],
														"type" : 'scatter',
														"marker" : {
															enabled : true,
															symbol : setpointOverImage[0]
														},
														"size" : 0,
														"showInLegend" : false,
														"zIndex" : 6
													});
													ctxSetpoints.setPlotSetpoints("Sev1 out-of-band", point.setpointTypeEnum, roundToTwo(point.min) + ',' + roundToTwo(point.max), '#1EC2EC', 'url(../images/Sev1-Out-of-Band-Icon.png)');
													break;
												}
												return;
											}
											return;
										}
										case 2: {
											switch (point.setpointTypeEnum) {

											case 'over' : {
												//console.log("LevelOver - only 1 line for sev 1");
												_setpoints.push({
													color : '#FF9801',
													value : point.min,
													width : 2
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.min
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointOverImage[1]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 6
												});

												ctxSetpoints.setPlotSetpoints("Sev2 over", point.setpointTypeEnum, roundToTwo(point.min), '#FF9801', setpointOverImage[1]);
												break;
											}
											case 'under' : {
												//console.log("LevelOver - only 1 line for sev 1");
												_setpoints.push({
													color : '#FF9801',
													value : point.max,
													width : 2
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.max
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointUnderImage[1]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 6
												});

												ctxSetpoints.setPlotSetpoints("Sev2 under", point.setpointTypeEnum, roundToTwo(point.max), '#FF9801', setpointUnderImage[1]);
												break;
											}
											case 'acceptance_region' : {
												_setpoints.push({
													color : '#FF9801',
													value : point.min,
													width : 2
												});
												_setpoints.push({
													color : '#FF9801',
													value : point.max,
													width : 2
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.min
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointOverImage[1]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 6
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.max
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointUnderImage[1]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 6
												});
												ctxSetpoints.setPlotSetpoints("Sev2 acceptance-region", point.setpointTypeEnum, roundToTwo(point.min) + ',' + roundToTwo(point.max), '#FF9801', 'url(../images/Sev2-Acceptance-Region-Icon.png)');
												_additionalRangeforAcceptanceRegion = (point.begin != 0 || point.end != 0) ? roundToTwo(point.begin) + ',' + roundToTwo(point.end) + ' deg' : undefined;
												break;
											}
											case 'in_band': {
												_setpoints.push({
													color : '#FF9801',
													value : point.min,
													width : 2
												});
												_setpoints.push({
													color : '#FF9801',
													value : point.max,
													width : 2
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.min
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointOverImage[1]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 6
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.max
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointUnderImage[1]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 6
												});
												ctxSetpoints.setPlotSetpoints("Sev2 in-band", point.setpointTypeEnum, roundToTwo(point.min) + ',' + roundToTwo(point.max), '#FF9801', 'url(../images/Sev2-In-Band-Icon.png)');
												break;
											}
											case 'out_of_band':
												{
													_setpoints.push({
														color : '#FF9801',
														value : point.min,
														width : 2
													});
													_setpoints.push({
														color : '#FF9801',
														value : point.max,
														width : 2
													});
													seriesArr.push({
														"name" : "Setpoint Symbol",
														"data" : [{
															'x' : setPointSymbolSeries.x,
															'y' : point.min
														}],
														"type" : 'scatter',
														"marker" : {
															enabled : true,
															symbol : setpointUnderImage[1]
														},
														"size" : 0,
														"showInLegend" : false,
														"zIndex" : 6
													});
													seriesArr.push({
														"name" : "Setpoint Symbol",
														"data" : [{
															'x' : setPointSymbolSeries.x,
															'y' : point.max
														}],
														"type" : 'scatter',
														"marker" : {
															enabled : true,
															symbol : setpointOverImage[1]
														},
														"size" : 0,
														"showInLegend" : false,
														"zIndex" : 6
													});
													ctxSetpoints.setPlotSetpoints("Sev2 out-of-band", point.setpointTypeEnum, roundToTwo(point.min) + ',' + roundToTwo(point.max), '#FF9801', 'url(../images/Sev2-Out-of-Band-Icon.png)');
													break;
												}

												return;
											}
											return;
										}
										case 3: {
											switch (point.setpointTypeEnum) {

											case 'over' : {
												_setpoints.push({
													color : '#FFCC01',
													value : point.min,
													width : 2
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.min
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointOverImage[2]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 6
												});

												ctxSetpoints.setPlotSetpoints("Sev3 over", point.setpointTypeEnum, roundToTwo(point.min), '#FFCC01', setpointOverImage[2]);
												break;
											}
											case 'under' : {
												_setpoints.push({
													color : '#FFCC01',
													value : point.max,
													width : 2
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.max
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointUnderImage[2]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 6
												});

												ctxSetpoints.setPlotSetpoints("Sev3 under", point.setpointTypeEnum, roundToTwo(point.max), '#FFCC01', setpointUnderImage[2]);
												break;
											}
											case 'acceptance_region' : {
												_setpoints.push({
													color : '#FFCC01',
													value : point.min,
													width : 2
												});
												_setpoints.push({
													color : '#FFCC01',
													value : point.max,
													width : 2
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.min
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointOverImage[2]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 6
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.max
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointUnderImage[2]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 6
												});
												ctxSetpoints.setPlotSetpoints("Sev3 acceptance-region", point.setpointTypeEnum, roundToTwo(point.min) + ',' + roundToTwo(point.max), '#FFCC01', 'url(../images/Sev3-Acceptance-Region-Icon.png)');
												_additionalRangeforAcceptanceRegion = (point.begin != 0 || point.end != 0) ? roundToTwo(point.begin) + ',' + roundToTwo(point.end) + ' deg' : undefined;
												break;
											}
											case 'in_band': {
												_setpoints.push({
													color : '#FFCC01',
													value : point.min,
													width : 2
												});
												_setpoints.push({
													color : '#FFCC01',
													value : point.max,
													width : 2
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.min
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointOverImage[2]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 6
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.max
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointUnderImage[2]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 6
												});
												ctxSetpoints.setPlotSetpoints("Sev3 in-band", point.setpointTypeEnum, roundToTwo(point.min) + ',' + roundToTwo(point.max), '#FFCC01', 'url(../images/Sev3-In-Band-Icon.png)');
												break;
											}
											case 'out_of_band':
												{
													_setpoints.push({
														color : '#FFCC01',
														value : point.min,
														width : 2
													});
													_setpoints.push({
														color : '#FFCC01',
														value : point.max,
														width : 2
													});
													seriesArr.push({
														"name" : "Setpoint Symbol",
														"data" : [{
															'x' : setPointSymbolSeries.x,
															'y' : point.min
														}],
														"type" : 'scatter',
														"marker" : {
															enabled : true,
															symbol : setpointUnderImage[2]
														},
														"size" : 0,
														"showInLegend" : false,
														"zIndex" : 6
													});
													seriesArr.push({
														"name" : "Setpoint Symbol",
														"data" : [{
															'x' : setPointSymbolSeries.x,
															'y' : point.max
														}],
														"type" : 'scatter',
														"marker" : {
															enabled : true,
															symbol : setpointOverImage[2]
														},
														"size" : 0,
														"showInLegend" : false,
														"zIndex" : 6
													});
													ctxSetpoints.setPlotSetpoints("Sev3 out-of-band", point.setpointTypeEnum, roundToTwo(point.min) + ',' + roundToTwo(point.max), '#FFCC01', 'url(../images/Sev3-Out-of-Band-Icon.png)');
													break;

												}
												return;
											}
											return;

										}
										case 4: {
											switch (point.setpointTypeEnum) {
											case 'over' : {
												_setpoints.push({
													color : '#e2171a',
													value : point.min,
													width : 2
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.min
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointOverImage[3]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 6
												});
												ctxSetpoints.setPlotSetpoints("Sev4 over", point.setpointTypeEnum, roundToTwo(point.min), '#e2171a', setpointOverImage[3]);
												break;
											}
											case 'under' : {
												_setpoints.push({
													color : '#e2171a',
													value : point.max,
													width : 2
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.max
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointUnderImage[3]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 6
												});
												ctxSetpoints.setPlotSetpoints("Sev4 under", point.setpointTypeEnum, roundToTwo(point.max), '#e2171a', setpointUnderImage[3]);
												break;
											}
											case 'acceptance_region' : {
												_setpoints.push({
													color : '#e2171a',
													value : point.min,
													width : 2
												});
												_setpoints.push({
													color : '#e2171a',
													value : point.max,
													width : 2
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.min
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointOverImage[3]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 6
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.max
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointUnderImage[3]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 6
												});
												ctxSetpoints.setPlotSetpoints("Sev4 acceptance-region", point.setpointTypeEnum, roundToTwo(point.min) + ',' + roundToTwo(point.max), '#e2171a', 'url(../images/Sev4-Acceptance-Region-Icon.png)');
												_additionalRangeforAcceptanceRegion = (point.begin != 0 || point.end != 0) ? roundToTwo(point.begin) + ',' + roundToTwo(point.end) + ' deg' : undefined;
												break;
											}
											case 'in_band': {
												_setpoints.push({
													color : '#e2171a',
													value : point.min,
													width : 2
												});
												_setpoints.push({
													color : '#e2171a',
													value : point.max,
													width : 2
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.min
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointOverImage[3]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 6
												});
												seriesArr.push({
													"name" : "Setpoint Symbol",
													"data" : [{
														'x' : setPointSymbolSeries.x,
														'y' : point.max
													}],
													"type" : 'scatter',
													"marker" : {
														enabled : true,
														symbol : setpointUnderImage[3]
													},
													"size" : 0,
													"showInLegend" : false,
													"zIndex" : 6
												});
												ctxSetpoints.setPlotSetpoints("Sev4 in-band", point.setpointTypeEnum, roundToTwo(point.min) + ',' + roundToTwo(point.max), '#e2171a', 'url(../images/Sev4-In-Band-Icon.png)');
												break;

											}
											case 'out_of_band':
												{
													_setpoints.push({
														color : '#e2171a',
														value : point.min,
														width : 2
													});
													_setpoints.push({
														color : '#e2171a',
														value : point.max,
														width : 2
													});
													seriesArr.push({
														"name" : "Setpoint Symbol",
														"data" : [{
															'x' : setPointSymbolSeries.x,
															'y' : point.min
														}],
														"type" : 'scatter',
														"marker" : {
															enabled : true,
															symbol : setpointUnderImage[3]
														},
														"size" : 0,
														"showInLegend" : false,
														"zIndex" : 6
													});
													seriesArr.push({
														"name" : "Setpoint Symbol",
														"data" : [{
															'x' : setPointSymbolSeries.x,
															'y' : point.max
														}],
														"type" : 'scatter',
														"marker" : {
															enabled : true,
															symbol : setpointOverImage[3]
														},
														"size" : 0,
														"showInLegend" : false,
														"zIndex" : 6
													});
													ctxSetpoints.setPlotSetpoints("Sev4 out-of-band", point.setpointTypeEnum, roundToTwo(point.min) + ',' + roundToTwo(point.max), '#e2171a', 'url(../images/Sev4-Out-of-Band-Icon.png)');
													break;

												}
												return;
											}
											return;
										}
										}
									});
								});
							}
						}

						options.plotOptions = _.extend(options.plotOptions || {}, {
							column : {
								dataLabels : {
									enabled : false
								}
							},
							series : {
								cursor : 'pointer',
								point : {
									events : {
										click : function() {
											//Can't use this.y directly because the time format is different in the getWaveform service call.
											//Need to get the complete date time stamp from the original data

											//var index= _.findIndex(_timeline,this.category);
											var formattedCategory;
											if (data.preferredTimeZone == 'tzLocal') {
												formattedCategory = moment(this.category).valueOf();
											} else {
												formattedCategory = (moment(this.category).utc(this.category)).valueOf();
											}

											//  var index=_timeline.indexOf(this.category);
											var index = _timeline.indexOf(formattedCategory);
											var originalTimeStamp = data.response[0].data[index].date;
											scope.$parent.toggleWaveform(originalTimeStamp);
										},
										mouseOver : function(obj) {
											var dataArr = seriesArr[0].data;
											var tooltipTime = this.x;
											var tooltipSpeed;
											$.each(dataArr, function(i, v) {
												if (v[0] === tooltipTime) {
													if (v[2] === null && v[2] != 0) {
														tooltipSpeed = "";
													} else {
														tooltipSpeed = v[2];
													}
												}
											});
											if (data.preferredTimeZone == 'tzLocal') {
												$('#tooltipTimeSeries').html('<b>' + roundToTwo(this.y) + '</b>' + ' ' + _uom + ' ' + _subunits + '  &nbsp;&nbsp;' + moment(this.x).format('YYYY-MM-DD HH:mm:ss') + ' ' + (tooltipSpeed !== "" ? tooltipSpeed + ' RPM' : ''));
												$('#tooltipTimeSeries').removeClass('customLegend-hide').addClass('customLegend-show');
											} else {
												$('#tooltipTimeSeries').html('<b>' + roundToTwo(this.y) + '</b>' + ' ' + _uom + ' ' + _subunits + ' &nbsp;&nbsp;' + moment(this.x).utc(this.x).format('YYYY-MM-DD HH:mm:ss') + ' ' + (tooltipSpeed !== "" ? tooltipSpeed + ' RPM' : ''));
												$('#tooltipTimeSeries').removeClass('customLegend-hide').addClass('customLegend-show');
											}
										},
										mouseOut : function() {
											//  $('#tooltipTimeSeries').html(' ');
											// $('#tooltipTimeSeries').removeClass('customLegend-show');
											//  $('#tooltipTimeSeries').addClass('customLegend-hide');
										}
									}
								}
							}

						});
						options.yAxis = _.extend(options.yAxis || {}, {
							title : {
								text : _uom + ' ' + _subunits,
								style : {
									color : 'black',
									fontFamily : 'ge-inspira',
									fontSize : '14'
								}
							},
							startOnTick : true,
							plotLines : _setpoints

						});

						options.xAxis = _.extend(options.xAxis || {}, {
							title : {
								// text:"Time (GMT)"
								text : xAxisLabelTimeZone,
								style : {
									color : 'black',
									fontFamily : 'ge-inspira',
									fontSize : '14'
								}
							},
							labels : {
								align : 'right',
								style: {
									fontFamily : 'ge-inspira',
									fontSize: '12'
								},
								format : '{value:%Y-%m-%d<br/>%H:%M}'
							},
							max : null,
							min : null,
							type : 'datetime',
							dateTimeLabelFormats : {
								second : '%Y-%m-%d<br/>%H:%M:%S',
								minute : '%Y-%m-%d<br/>%H:%M',
								hour : '%Y-%m-%d<br/>%H:%M',
								day : '%Y<br/>%m-%d',
								week : '%Y<br/>%m-%d',
								month : '%Y-%m',
								year : '%Y'
							},
							pointInterval : 24 * 3600 * 1000,
							plotLines : [{
								color : 'black',
								value : lastOccurred
								//, value:'1414413437000'
								,
								width : 1,
								connectNulls : true,
								allowPointSelect : true
							}],
							endOnTick: true ,
							startOnTick : true



							/*      ,categories:_timeline
							 ,startOnTick: true
							 ,tickInterval:_timeline.length/5
							 , plotLines: [{
							 color: 'black', // Color value
							 //dashStyle: 'solid', // Style of the plot line. Default to solid
							 value: _eventTime, // Value of where the line will appear
							 //  value: 396, // Value of where the line will appear TODO - Find index of value in time series x axis
							 width: '1' // Width of the line
							 }]

							 */
						});

						options.tooltip = {
							shared : true,
							crosshairs : true,
							useHTML : true,
							padding : 0,
							positioner : function(boxWidth, boxHeight, point) {
								return {
									x : 200,
									y : -10
								};
							},
							shadow : false,
							borderWidth : 0,
							backgroundColor : 'none',
							formatter : function() {
								var s;
								var tooltipSpeed1;
								var dataArr = seriesArr[0].data;
								var tooltipTime = this.x;
								var tooltipSpeed;
								var tooltipData;
								$.each(dataArr, function(i, v) {
									if (v[0] === tooltipTime) {
										tooltipData = v[1];
										if (v[2] === null && v[2] != 0) {
											tooltipSpeed = "";
										} else {
											tooltipSpeed = v[2];
										}
									}
								});
								if (data.preferredTimeZone == 'tzLocal') {
									s = '<b>' + roundToTwo(tooltipData) + '</b>' + ' ' + _uom + ' ' + _subunits + '  &nbsp;&nbsp;' + moment(this.x).format('YYYY-MM-DD HH:mm:ss') + ' ' + (tooltipSpeed !== "" ? tooltipSpeed + ' RPM' : '');
								} else {
									s = '<b>' + roundToTwo(tooltipData) + '</b>' + ' ' + _uom + ' ' + _subunits + ' &nbsp;&nbsp;' + moment(this.x).utc(this.x).format('YYYY-MM-DD HH:mm:ss') + ' ' + (tooltipSpeed !== "" ? tooltipSpeed + ' RPM' : '');
								}
								//  return s;
								$('#tooltipTimeSeries').html(s);
							}
						};
						var plotSetpoints = ctxSetpoints.getPlotSetpoints();

						var list = '';
						_.forEach(plotSetpoints, function(obj) {
							if (_additionalRangeforAcceptanceRegion && obj.type == 'acceptance_region')
								list += '<span class="setpointBanner-block"><span class="setpointBanner-block-icon" style="background: ' + obj.symbol + ' no-repeat;"></span><b class="setpointBanner-block-text">' + obj.level + ' : </b>' + ' ' + obj.value + ' ' + _uom + ' ' + _subunits + ',' + _additionalRangeforAcceptanceRegion + '</span>';
							else
								list += '<span class="setpointBanner-block"><span class="setpointBanner-block-icon" style="background: ' + obj.symbol + ' no-repeat;"></span><b class="setpointBanner-block-text">' + obj.level + ' : </b>' + ' ' + obj.value + ' ' + _uom + ' ' + _subunits + '</span>'

						});

						if (plotSetpoints.length > 0) {
							$(".setpointBanner").html('<span>' + list + '</span>');
							$(".setpointBanner").removeClass('customLegend-hide').addClass('customLegend-show')
						} else {
							$(".setpointBanner").removeClass('customLegend-show')
							$(".setpointBanner").addClass('customLegend-hide')
						}

						options.series = seriesArr;

					} else {
						if (plotType == "smartSignal") {
							/*_series.push(obj.actual);
							 _timeline.push(moment(obj.date).format("YYYY-MM-DD HH:mm"));*/

							var actualSeries = [],
							    estimatedSeries = [],
							    timeRange = [];
							//ASSUMPTION: Assuming that given Data is sorted by date

							actualSeries = _.map(_.where(data.data), function(obj) {
								//  return  [moment(obj.date).format("YYYY-MM-DD HH:mm") , obj.actual];
								if (data.preferredTimeZone == 'tzLocal') {
									return [moment(obj.date).valueOf(), obj.actual]
								} else {
									return [(moment(obj.date).utc(obj.date)).valueOf(), obj.actual];
								}
								// return  [Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()),  obj.actual];
							});

							estimatedSeries = _.map(_.where(data.data), function(obj) {
								if (data.preferredTimeZone == 'tzLocal') {
									return [moment(obj.date).valueOf(), obj.estimate]
								} else {
									return [(moment(obj.date).utc(obj.date)).valueOf(), obj.estimate];
								}
								// return  [Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()),  obj.estimate];
							});

							//Now lets sort the data on client side to ensure it looks good on chart
							var sortedActualSeries = _.sortBy(actualSeries, 0);
							var sortedEstimateSeries = _.sortBy(estimatedSeries, 0);

							//Get MAX value of Y Axis
							var temp = [_.max(sortedActualSeries, 1)[1], _.max(sortedEstimateSeries, 1)[1]];
							var topPoint = _.max(temp);
							var tempLowestPoint = [_.min(sortedActualSeries, 1)[1], _.min(sortedEstimateSeries, 1)[1]];
							var lowestPoint = _.min(tempLowestPoint);
							var gridPoint = Math.round((topPoint - lowestPoint)/2);
							//console.log("gridPoint= " + gridPoint);
							_uom = data.tagNode.units;
							if(data.tagNode.subunits) {
								_subunits = data.tagNode.subunits;
							} else {
								_subunits = "";
							}

							/*Looks like need to iterate through the entire data array and create array for residuals
							 * The point where there is no residuals , need to add null. This way highcharts will plot the series correctly
							 * */
							var residualsBelow = [],
							    residualsAbove = [],
							    ssRules = [],
							    ssDiagRules = [];
							_.forEach(data.data, function(obj) {
								//Conditional check for residuals
								if (obj.residualThresholdEnum == "below") {
									if (data.preferredTimeZone == 'tzLocal') {
										//residualsBelow.push([moment(obj.date).valueOf(), lowestPoint - 10]);
										residualsBelow.push([moment(obj.date).valueOf(), lowestPoint - (1/3)*gridPoint]);
										//residualsAbove.push([moment(obj.date).valueOf(),null]);
									} else {
										//residualsBelow.push([(moment(obj.date).utc(obj.date)).valueOf(), lowestPoint - 10]);
										residualsBelow.push([(moment(obj.date).utc(obj.date)).valueOf(), lowestPoint - (1/3)*gridPoint]);
										//residualsAbove.push([(moment(obj.date).utc(obj.date)).valueOf(),null]);
									}
									//   residualsBelow.push([Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()) ,0]);
									//    residualsAbove.push([Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()),null]);
								} else {
									if (obj.residualThresholdEnum == "above") {
										if (data.preferredTimeZone == 'tzLocal') {
											//residualsAbove.push([moment(obj.date).valueOf(), topPoint + 6]);
											residualsAbove.push([moment(obj.date).valueOf(), topPoint + (1/3)*gridPoint]);
											//residualsBelow.push([moment(obj.date).valueOf(),null]);
										} else {
											//residualsAbove.push([(moment(obj.date).utc(obj.date)).valueOf(), topPoint + 6]);
											residualsAbove.push([(moment(obj.date).utc(obj.date)).valueOf(), topPoint + (1/3)*gridPoint]);
											//residualsBelow.push([(moment(obj.date).utc(obj.date)).valueOf(),null]);
										}
										//  residualsAbove.push([Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()) ,topPoint+6]);
										//  residualsBelow.push([Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()) ,null]);
									}
									/*else{
									 if(data.preferredTimeZone=='tzLocal'){
									 residualsAbove.push([moment(obj.date).valueOf(),null]);
									 residualsBelow.push([moment(obj.date).valueOf(),null]);
									 }
									 else{
									 residualsAbove.push([(moment(obj.date).utc(obj.date)).valueOf(),null]);
									 residualsBelow.push([(moment(obj.date).utc(obj.date)).valueOf(),null]);
									 }
									 //residualsAbove.push([Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()) ,null]);
									 //residualsBelow.push([Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()) ,null]);
									 }*/
								}

								ssAdvisory = _.filter(data.advisoriesNode, {
									"nodeTypeEnum" : "ss_rule"
								});
								ssDiagAdvisory = _.filter(data.advisoriesNode, {
									"nodeTypeEnum" : "ss_diagnostic_rule"
								});
								//Conditional checks for the ssDiagnostic (Diamonds on the first row) and other rules (circles on the second row)
								if (obj.advisories.length > 0) {
									for (var j = 0; j < obj.advisories.length && j < 2; j++) {
										var nodeType = checkAdvisoryType(data.advisoriesNode, obj.advisories[j]);
										if (nodeType == "ss_rule") {
											if (data.preferredTimeZone == 'tzLocal') {
												//ssRules.push([moment(obj.date).valueOf(), topPoint + 14]);
												ssRules.push([moment(obj.date).valueOf(), topPoint + (2/3)*gridPoint]);
												//ssDiagRules.push([moment(obj.date).valueOf(),null]);
											} else {
												//ssRules.push([(moment(obj.date).utc(obj.date)).valueOf(), topPoint + 14]);
												ssRules.push([(moment(obj.date).utc(obj.date)).valueOf(), topPoint + (2/3)*gridPoint]);
												//ssDiagRules.push([(moment(obj.date).utc(obj.date)).valueOf(),null]);
											}

											// ssRules.push([Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()) ,topPoint+14]);
											// ssDiagRules.push([Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()) ,null])
										} else {
											if (nodeType == "ss_diagnostic_rule") {
												if (data.preferredTimeZone == 'tzLocal') {
													//ssDiagRules.push([moment(obj.date).valueOf(), topPoint + 20]);
													ssDiagRules.push([moment(obj.date).valueOf(), topPoint + gridPoint]);
													//ssRules.push([moment(obj.date).valueOf(),null]);
												} else {
													//ssDiagRules.push([(moment(obj.date).utc(obj.date)).valueOf(), topPoint + 20]);
													ssDiagRules.push([(moment(obj.date).utc(obj.date)).valueOf(), topPoint + gridPoint]);
													//ssRules.push([(moment(obj.date).utc(obj.date)).valueOf(),null]);
												}
												// ssDiagRules.push([Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()) ,topPoint+20]);
												// ssRules.push([Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()) ,null]);
											} else {
												if (data.preferredTimeZone == 'tzLocal') {
													ssRules.push([moment(obj.date).valueOf(), null]);
													//ssDiagRules.push([moment(obj.date).valueOf(),null]);
												} else {
													ssRules.push([(moment(obj.date).utc(obj.date)).valueOf(), null]);
													//ssDiagRules.push([(moment(obj.date).utc(obj.date)).valueOf(),null]);
												}
												// ssRules.push([Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()) ,null]);
												// ssDiagRules.push([Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()) ,null])
											}
										}
									}
								}
								/*else{
								 if(data.preferredTimeZone=='tzLocal'){
								 ssRules.push([moment(obj.date).valueOf(),null]);
								 ssDiagRules.push([moment(obj.date).valueOf(),null]);
								 }
								 else{
								 ssRules.push([(moment(obj.date).utc(obj.date)).valueOf(),null]);
								 ssDiagRules.push([(moment(obj.date).utc(obj.date)).valueOf(),null]);
								 }

								 //   ssRules.push([Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()) ,null]);
								 //   ssDiagRules.push([Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()) ,null])
								 }*/
							});

							//Get Series for residualThresholdEnum =="below"
							var residualBelow = _.filter(data.data, {
								'residualThresholdEnum' : 'below'
							});
							var residualTimeline = _.chain(residualBelow).pluck('date', 'residual').flatten().valueOf();
							//var residualPoints= _.chain(residualBelow).pluck('residual').flatten().valueOf();
							var residualPoints = [],
							    residualPointsConsolidated = [];
							var residualPointsBelow = _.map(_.where(data.data, {
								residualThresholdEnum : "below"
							}), function(obj) {
								if (data.preferredTimeZone == 'tzLocal') {
									residualPointsConsolidated.push([moment(obj.date).valueOf(), obj.residual]);
									return [moment(obj.date).valueOf(), obj.residual];
								} else {
									residualPointsConsolidated.push([(moment(obj.date).utc(obj.date)).valueOf(), obj.residual]);
									return [(moment(obj.date).utc(obj.date)).valueOf(), obj.residual];
								}

								//  residualPointsConsolidated.push([Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()) , obj.residual]);
								//  return  [Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()) , obj.residual];
							});

							var _startDate = data.data[0].date;
							var _endDate = data.data[data.data.length - 1].date;

							var residualPointsAbove = _.map(_.where(data.data, {
								residualThresholdEnum : "above"
							}), function(obj) {
								if (data.preferredTimeZone == 'tzLocal') {
									residualPointsConsolidated.push([moment(obj.date).valueOf(), obj.residual]);
									return [moment(obj.date).valueOf(), obj.residual];
								} else {
									residualPointsConsolidated.push([(moment(obj.date).utc(obj.date)).valueOf(), obj.residual]);
									return [(moment(obj.date).utc(obj.date)).valueOf(), obj.residual];
								}

								// residualPointsConsolidated.push([Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()) , obj.residual]);
								// return  [Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()), obj.residual];
							});
							residualPoints = _.sortBy(residualPointsConsolidated, 0);

							var ssDiagnosticArr = _.map(_.where(data.data), function(obj) {
								if (data.preferredTimeZone == 'tzLocal') {
									return [moment(obj.date).valueOf(), obj.advisories];
								} else {
									return [(moment(obj.date).utc(obj.date)).valueOf(), obj.advisories];
								}

								// return [Date.UTC(moment(obj.date).year(),moment(obj.date).month(),moment(obj.date).date(),moment(obj.date).hour(),moment(obj.date).minute(),moment(obj.date).second()),obj.advisories];
							});

							//Form base array containing date-advisory mapping
							var diagnosticRule = [];
							_.forEach(ssDiagnosticArr, function(obj) {
								_.forEach(obj[1], function(ad) {
									diagnosticRule.push({
										"date" : obj[0],
										"advisory" : ad
									});
								})
							});

							//Find number of SSDiagnostic Rule and other rule.
							//ASSUMPTION: The advisoriesNodes always has unique rules for each of the nodeTypeEnum category
							var ssDiagAdvisory = [],
							    ssAdvisory = [],
							    seriesSSAdvisory = {},
							    seriesSSDiagnosticAdvisory = {};
							ssAdvisory = _.filter(data.advisoriesNode, {
								"nodeTypeEnum" : "ss_rule"
							});
							ssDiagAdvisory = _.filter(data.advisoriesNode, {
								"nodeTypeEnum" : "ss_diagnostic_rule"
							});

							//Filter base array for each of the nodeTypeEnum category; Match criteria: nodeId
							_.forEach(ssAdvisory, function(rule) {
								//Filter base array based on nodeId, form object, specify marker shape, color and create series (y axis= second row from chart's top point)
								seriesSSAdvisory.data = _.map(_.where(diagnosticRule, {
									"advisory" : rule.nodeId
								}), function(obj) {
									return [obj.date, topPoint + (2/3)*gridPoint];
								});
								seriesSSAdvisory.symbol = rule.ssExtra.ruleShapeEnum;
								seriesSSAdvisory.color = convert_argbToHex(rule.ssExtra.color);
							});

							_.forEach(ssDiagAdvisory, function(rule) {
								//Filter base array based on nodeId, form object, specify marker shape, color and create series (y axis= second row from chart's top point)
								seriesSSDiagnosticAdvisory.data = _.map(_.where(diagnosticRule, {
									"advisory" : rule.nodeId
								}), function(obj) {
									return [obj.date, topPoint + gridPoint];
								});
								seriesSSDiagnosticAdvisory.symbol = rule.ssExtra.ruleShapeEnum;
								seriesSSDiagnosticAdvisory.color = convert_argbToHex(rule.ssExtra.color);
							});

							options.yAxis = _.extend(options.yAxis || {}, {
								title : {
									text : _uom + ' ' + _subunits,
									style : {
										color : 'black',
										fontFamily : 'ge-inspira',
										fontSize : '14'
									}
								},
								ceiling : topPoint + gridPoint,
								floor : lowestPoint - gridPoint, 
								startOnTick : true,
								max : topPoint + gridPoint,
								min : lowestPoint - gridPoint

							});

							options.xAxis = _.extend(options.xAxis || {}, {
								title : {
									//  text:"Time (GMT)"
									text : xAxisLabelTimeZone,
									style : {
										color : 'black',
										fontFamily : 'ge-inspira',
										fontSize : '14'
									}
								},
								labels : {
									align : 'right',
									style : {
										"fontsize" : "12px"
									}
								},
								type : 'datetime',
								dateTimeLabelFormats : {
									second : '%Y-%m-%d<br/>%H:%M:%S',
									minute : '%Y-%m-%d<br/>%H:%M',
									hour : '%Y-%m-%d<br/>%H:%M',
									day : '%Y<br/>%m-%d',
									week : '%Y<br/>%m-%d',
									month : '%Y-%m',
									year : '%Y'
								},
								endOnTick: true ,
								startOnTick : true
							});
							
							var _decimalPoints = data.tagNode.ssExtra.decimalPlaces;
							var _actual,
							    _estimate,
							    _diff;
							options.tooltip = {
								shared : true,
								crosshairs : true,
								useHTML : true,
								padding : 0,
								positioner : function(boxWidth, boxHeight, point) {
									return {
										x : boxWidth - 200,
										y : 0
									};
								},
								shadow : true,
								borderWidth : 1,
								backgroundColor : 'rgba(255,255,255,0.8)',
								formatter : function() {
									var s;
									if (data.preferredTimeZone == 'tzLocal') {
										s = '<b>' + moment(this.x).format('YYYY-MM-DD HH:mm:ss') + '</b>';
									} else {
										s = '<b>' + dateFormatter.getUTCFormat(this.x) + '</b>';
									}
									_.forEach(this.points, function(obj) {
										if (obj.series.name == 'Actual') {
											s += '<span style="margin-left:10px;color:' + obj.series.color + '">' + obj.series.name + ':</span>' + Highcharts.numberFormat(obj.y, _decimalPoints + 3);
											_actual = obj.y;
										}
										if (obj.series.name == 'Estimate') {
											s += '<span style="margin-left: 10px; color:' + obj.series.color + '">' + obj.series.name + ':</span>' + Highcharts.numberFormat(obj.y, _decimalPoints + 3);
											_estimate = obj.y;
										}
									});
									if (_actual !== 'undefined' && _estimate !== 'undefined') {
										_diff = _actual - _estimate;
										s += '<span style="margin-left:10px; color: red">Residual:</span>' + Highcharts.numberFormat(_diff, _decimalPoints + 3);
									}
									return s;
								}
							};

							console.log('ssDiagRules num points: ' + ssDiagRules.length );
							console.log('ssRules num points: ' + ssRules.length );
							console.log('topPoint: ' + topPoint);
							console.log('lowestPoint: ' + lowestPoint);

							options.series = [{
								"name" : "Actual",
								"data" : sortedActualSeries,
								"type" : 'spline',
								marker : {
									enabled : false
								},
								showInLegend : false,
								color : '#058DC7'
							}, {
								"name" : "Estimate",
								"data" : sortedEstimateSeries,
								"type" : 'spline',
								marker : {
									enabled : false
								},
								showInLegend : false,
								color : '#46ad00'
							}, {
								"name" : "SS Diagnostic Rule",
								"data" : ssDiagRules,
								"type" : 'spline',
								marker : {
									enabled : true,
									symbol : 'diamond',
									radius : 4
								},
								showInLegend : false,
								lineWidth : 0,
								color : ssDiagRuleColor
							}, {
								"name" : "SS Rule fired for",
								"data" : ssRules,
								"type" : 'spline',
								marker : {
									enabled : true,
									symbol : 'circle',
									radius : 5
								},
								showInLegend : false,
								lineWidth : 0,
								color : ssRuleColor
							}, {
								"name" : "Residuals",
								"data" : residualsAbove,
								"type" : 'spline',
								marker : {
									enabled : true,
									symbol : 'url(../images/SmartSignal_marker_X-01.png)'
								},
								showInLegend : false,
								lineWidth : 0,
								color : '#e2171a'
							}, {
								"name" : "Residuals",
								"data" : residualsBelow,
								"type" : 'spline',
								marker : {
									enabled : true,
									symbol : 'url(../images/SmartSignal_marker_X-01.png)'
								},
								showInLegend : false,
								lineWidth : 0,
								color : '#e2171a'
							}];
						} else {
							if (plotType == undefined) {
								$('#chartLoadDisplay').html("<div class='placeholderForCharts span12'>" + "<div>" + "<h3 class='centerText'>No Data Available</h3>" + "</div> </div>");
								$("#loadIcon").addClass('hideLoadingIcon');
							}
						}
					}
					function getSetPointSeries(value, baseData) {
						var tempSeries = [];
						for (var i = 0; i < baseData.length - 1; i++) {
							tempSeries.push(value);
						}
						var len = baseData.length - 1;
						tempSeries.push({
							y : value,
							marker : {
								symbol : 'url(../images/Severity4_Over_Setpoint_Icons.png)'
							}
						});
						return tempSeries;
					}

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
				scope.$watch('data', function(newData, oldData) {
					if (newData) {
						$('#tooltipTimeSeries').html(' ');
						$('.setpointBanner').html(' ');
						// Not very efficient.
						if (instance) {
							instance.chart.destroy();
						}

						instance = new Chart(element[0], newData, options);
						//  instance.chart.showLoading("Loading New Data");

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
});
