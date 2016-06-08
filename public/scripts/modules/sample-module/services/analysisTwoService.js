/*global define */
define(['angular', 'services-module'], function(angular, services) {
	'use strict';

	/* Services */
	services.service('analysisTwoService', ['$rootScope', '$timeout', '$analysis', '$alarms', 'tagsService', 'tagsValueService', 'tagsRawValueService', 'infoShare',
	function($rootScope, $timeout, $analysis, $alarms, tagsService, tagsValueService, tagsRawValueService, infoShare) {
		var __RS = $rootScope;
		var analysisGblInfo = angular.copy(infoShare);
		var self = {
			// Initial Sort Settings
			sortByPlotNew : 'centralTagName',
			sortOrderPlotNew : '', // values are '' or 'reverse'
			searchTextPlotNew : '',

			pageSize : 10,
			currentPage : 1,

			customerListArray : analysisGblInfo.customers,
			siteListArray : analysisGblInfo.sites,
			lineupListArray : analysisGblInfo.lineups,
			machineListArray : analysisGblInfo.machines,
			selectedObj : analysisGblInfo.selectedObj,

			plottedCharts : [],
			chartobjs : [],
			plotNewSelectedTags : {},
			editChartSelectedTags : {},
			selectedTags : [],
			editSelectedTags : [],
			//staticData:'',
			analysisContext : '',
			selectedPlottedChartForDetails : 0,
			selectedPlottedChartForEdit : 0,

			areTagsAvailable : false,
			availableTagsForCurrentContext : [],
			editChartAvailableTags : [],

			loading : false,
			loadingChart : null,
			isZoomApplied : false,
			showSaveAsOnly : true,
			hasTagChanged : false

		};

		self.analysisContext = {
			selectedTimeIndex : 0,
			selectedTimeZoneIndex : 1,
			selectedCustomTimeStartDt : "",
			selectedCustomTimeEndDt : ""
		};

		self.updateCtrl = function(obj) {
			$rootScope.$broadcast('service:update', obj);
		};

		self.staticData = {
			"buttons" : {
				"plotNew" : {
					"label" : "analysis.button.plotnew",
					"tooltips" : "analysis.button.plotnew",
					"actualTxt" : "plot new"
				},
				"viewChartDetails" : {
					"label" : "analysis.model.chartdetail.title",
					"tooltips" : "analysis.model.chartdetail.title"
				},
				"editChart" : {
					"label" : "Edit Chart",
					"tooltips" : "Edit Chart"
				},
				"exportOptions" : [{
					"label" : "Save As xls",
					"tooltips" : "Save as XLSt"
				}],
				"timeRangeOptions" : [{
					"label" : "1h",
					"route" : "oneHour",
					"selected" : true
				}, {
					"label" : "4h",
					"route" : "fourHours"
				}, {
					"label" : "12h",
					"route" : "twelveHours"
				}, {
					"label" : "24h",
					"route" : "twentyFourHours"
				}, {
					"label" : "48h",
					"route" : "fortyEightHours"
				}, {
					"label" : "1w",
					"route" : "oneWeek"
				}, {
					"label" : "2w",
					"route" : "twoWeeks"
				}, {
					"label" : "3m",
					"route" : "threeMonths"
				}, {
					"label" : "6m",
					"route" : "sixMonths"
				}, {
					"label" : "9m",
					"route" : "nineMonths"
				}, {
					"label" : "1y",
					"route" : "oneYear"
				}, {
					"label" : "Custom",
					"startData" : "",
					"endDate" : "",
					route : "custom"
				}],
				"timeZoneBtns" : [{
					label : "Local Time",
					type : "localTimeZone"
				}, {
					label : 'UTC Time',
					type : "utcTimeZone"
				}]
			},
			"tableHeader" : [{
				"id" : "Name",
				"label" : "Name"
			}]
		};

		self.updatePageSize = function(val) {
			self.pageSize = val;
			self.currentPage = 1;
		};

		// Simple toggle sort function
		self.toggleSortPlotNew = function(column) {

			if (self.sortByPlotNew === column) {

				self.sortOrderPlotNew = self.sortOrderPlotNew === '' ? 'reverse' : '';

			} else {

				self.sortByPlotNew = column;
				self.sortOrderPlotNew = '';
				// default for new is desc
			}
		};

		self.numberOfPagesInPlotNew = function() {

			return Math.ceil(self.availableTagsForCurrentContext.length / self.pageSize);
		};

		self.currPageEndIndexPlotNew = function() {

			var idx = (self.currentPage + 1) * self.pageSize;

			return (idx > self.availableTagsForCurrentContext.length) ? self.availableTagsForCurrentContext.length : idx;
		};

		// click on the check box from the table of plot new modal
		self.removeTag = function(tags, name) {
			tags.forEach(function(result, index) {
				if (result["name"] === name) {
					//Remove from array
					tags.splice(index, 1);
				}
			});
			return tags;
		};
		self.onSelectionOfTagInPlotNewChart = function(tag) {
			var name = tag.customerId + tag.enterpriseId + tag.selectedPt + tag.selectedNode;
			if (self.plotNewSelectedTags[name]) {
				self.plotNewSelectedTags[name] = '';
				self.selectedTags = self.removeTag(self.selectedTags, name);
			} else {
				self.plotNewSelectedTags[name] = tag;
				tag.name = name;
				self.selectedTags.push(tag);
			}
		};

		self.onSelectionOfTagInEditChart = function(tag) {
			var name = tag.customerId + tag.enterpriseId + tag.selectedNode;
			if (self.editChartSelectedTags[name]) {
				self.editChartSelectedTags[name] = '';
				self.editSelectedTags = self.removeTag(self.editSelectedTags, name);
			} else {
				self.editChartSelectedTags[name] = tag;
				tag.name = name;
				self.editSelectedTags.push(tag);
			}
		};

		// Getting selected options for the charts
		self.computeEditChartAvailableTags = function(chartIdx) {
			var editChartAvailableTags = [];
			var selectedChart = self.plottedCharts[chartIdx];
			var i,
			    j,
			    k;
			var temp;
			var found;

			if (selectedChart) {
				//go through the settings for the selected chart
				for (i in selectedChart.response) {
					// create object to hold current settings
					temp = {
						"tag" : self.plottedCharts[chartIdx].response[i],
						"selected" : true
					};
					// Add current settings to the list of settings to be edited
					editChartAvailableTags.push(temp);
				}
				console.log(self.availableTagsForCurrentContext);
				// Go through data from server and find info we need.
				for (j in self.availableTagsForCurrentContext) {

					found = false;
					// Go through the settings for the selected chart
					for (k in selectedChart.response) {
						// if we found a tag for our selected chart then wave flag
						if (self.availableTagsForCurrentContext[j].sourceId === selectedChart.response[k].sourceId && self.availableTagsForCurrentContext[j].enterpriseId === selectedChart.response[k].tagNode.enterpriseId) {

							found = true;
							break;
						}
					}
					// if we didn't find any tags for our chart

					if (!found) {
						// create object with no selections to be displayed.
						temp = {
							"tag" : self.availableTagsForCurrentContext[j],
							"selected" : false
						};
						// Add to list of tags to be edited.
						editChartAvailableTags.push(temp);
					}
				}
				self.editChartAvailableTags = editChartAvailableTags;
			}
		};

		self.getlineupListArray = function() {
			return self.lineupListArray;
		};

		self.getsiteListArray = function() {
			return self.siteListArray;
		};

		//** request to get tags for table
		//** table specific not chart specific
		self.getTags = function(callback) {

			//self.filterApplied = true;  taken care by global filter
			self.availableTagsForCurrentContext = [];

			// ** preventing unnecessary service call
			if (!self.areTagsAvailable) {
				tagsService.getTags(self.selectedObj.customer.customerId, self.selectedObj.site.siteId, self.selectedObj.lineup.lineupId).then(function(response) {
					self.areTagsAvailable = true;
					self.availableTagsForCurrentContext = response;
					// ** callback will assign response to scope to render table
					callback(response);
				}, function(error) {
					self.availableTags = false;
					self.dataError(error);
					callback(response);
				});
			}
		};
		//createNewChart
		//update
		// *** for individual chart
		//tags = all charts if creating new chart and selected chart if editing a chart
		self.getTagValues = function(tags, actionType, updateType, rawData) {
			var plottedChartTags = [];
			var tmRange,
			    stDt,
			    endDt;
			var customer = self.selectedObj.customer.customerId;
			var action = actionType;
			var opt;
			var chartDataType = updateType ? updateType : "sampling";
			var chartStatus = {};

			//tags either from plotNewSelectedTags or editChartSelectedTags
			for (opt in tags) {
				if (tags[opt]) {
					plottedChartTags.push(tags[opt]);
				}
			}
			// If we have any charts to plot
			if (plottedChartTags.length > 0) {

				chartStatus.loading = true;
				self.updateCtrl(chartStatus);

				// Setup time Ranges
				tmRange = self.staticData.buttons.timeRangeOptions[self.analysisContext.selectedTimeIndex].route;

				stDt = self.getStartDt(tmRange, self.analysisContext.selectedCustomTimeStartDt);
				endDt = self.getEndDt(tmRange, self.analysisContext.selectedCustomTimeEndDt);

				var plotType = "alarm-plot";
				var activeChart = 0;

				// Set funtion here
				var getStuff = function(myChart) {
					if (isNaN(plottedChartTags[activeChart].selectedNode)) {
						var sourceID = plottedChartTags[activeChart].selectedNode;
					} else {
						var sourceID = parseInt(plottedChartTags[activeChart].selectedNode);
					}

					var params = {
						customerId : plottedChartTags[activeChart].customerId,
						enterpriseId : plottedChartTags[activeChart].enterpriseId,
						isActive : true,
						startTime : stDt,
						endTime : endDt,
						consolidate : true
					};
					$alarms.getAlarmPlot(plotType, params, sourceID).then(function(obj) {
						if (obj.status == "200") {
							var response = obj.response;
							var allTagsArray = response;
							var plottedChart;
							// this is the MAIN OBJECT that will be passed to directive
							var tagsInfo = [];
							var tagValues = [];
							// value of tag
							var chartStatus = {
								loading : false,
								hasTagChanged : true,
								chart : null
							};

							//add new data to array of already process chart data
							_.each(allTagsArray, function(tObj, idx) {
								var tagObjDataArray = tObj.data;
								var newTagDataArray = [];
								//name for one of the charts set of data
								var tagName = response[idx].tagNode.nodeNamePath;

								_.each(tagObjDataArray, function(tagObjData, i) {
									var t,
									    v;
									t = tagObjData.date;
									// time
									v = tagObjData.actual;
									// value
									newTagDataArray.push({
										't' : t,
										'v' : v
									});
								});

								tagsInfo[idx] = response[idx].tagNode;
								tagValues[idx] = {
									name : tagName,
									data : newTagDataArray
								};
							});
							// Create chart object
							plottedChart = {
								'response' : response, // An array with objects in it
								'eventTime' : stDt,
								'endEventTime' : endDt,
								'preferredTimeZone' : 'tzLocal',
								'meta' : params,
								'sources' : plottedChartTags,
								'tags' : tags
							};

							if (action === 'updateChart') {
								// Update current chart
								self.plottedCharts[self.selectedPlottedChartForEdit].response = [];
								var updatedChart = angular.copy(self.plottedCharts[self.selectedPlottedChartForEdit]);
								//updatedChart.response.push(plottedChart.response[0]);

								self.plottedCharts[self.selectedPlottedChartForEdit] = updatedChart;
								chartStatus.chartIdx = self.selectedPlottedChartForEdit;
								self.loadingChart = chartStatus.chartIdx;
								console.log("This is coming from the service: ", self.loadingChart);
								action = 'rebuildChart';
								//activeChart++;
								chartStatus.loading = true;
								chartStatus.hasTagChanged = true;
								console.log("Rinse and repeat - from Update");
								getStuff(self.selectedPlottedChartForEdit);
							} else if (action === 'rebuildChart') {
								// Rebuild current chart
								var index = ( typeof myChart !== 'undefined' && typeof myChart !== null) ? myChart : self.plottedCharts.length - 1;
								// Copy chart that we are interested in
								var rebuildChart = angular.copy(self.plottedCharts[index]);
								// Add new series to chart (copy)

								rebuildChart.response.push(plottedChart.response[0]);
								// Set chart (copy) to replace original chart
								self.plottedCharts[index] = rebuildChart;
								// Set chart index for loading status
								chartStatus.chartIdx = index;
								self.loadingChart = chartStatus.chartIdx;

								console.log("This is coming from the service: ", self.loadingChart);
								if (activeChart < plottedChartTags.length - 1) {
									action = 'rebuildChart';
									activeChart++;
									chartStatus.loading = true;
									chartStatus.hasTagChanged = true;
									console.log("Rinse and repeat - from Rebuild");
									getStuff(index);
								} else {
									rebuildChart.sources = plottedChartTags;
									rebuildChart.tags = tags;
									chartStatus.loading = false;
									chartStatus.hasTagChanged = true;
									console.log("Yes we are done now!!! - from Rebuild");
									$rootScope.$broadcast('event:finishedPlottedCharts', self.plottedCharts);
								}
							} else {
								// Creating new chart
								self.plottedCharts.push(plottedChart);

								$rootScope.$broadcast('event:plottedCharts', self.plottedCharts);

								if (activeChart < plottedChartTags.length - 1) {
									action = 'rebuildChart';
									activeChart++;
									chartStatus.loading = true;
									chartStatus.hasTagChanged = true;
									console.log("Rinse and repeat - from Create");
									getStuff();
								} else {
									chartStatus.loading = false;
									chartStatus.hasTagChanged = true;
									console.log("Yes we are done now!!! - from Create");
									$rootScope.$broadcast('event:finishedPlottedCharts', self.plottedCharts);
								}
								// chartStatus.loading = false;
								// chartStatus.hasTagChanged = true;
							}
							chartStatus.chart = plottedChart;
							self.updateCtrl(chartStatus);
							// this is required also for multiple customer validation
						} else {

							var index = ( typeof myChart !== 'undefined' && typeof myChart !== null) ? myChart : self.plottedCharts.length - 1;
							var result = plottedChartTags.filter(function(obj) {
								return obj.selectedNode == sourceID;
							});

							if (index >= 0) {
								self.plottedCharts[index].sources[activeChart].trendFailed = true;
								plottedChartTags[activeChart].trendFailed = true;
								if (activeChart < plottedChartTags.length - 1) {
									activeChart++;
									getStuff(index)
								} else {
									var chartStatus = {};
									chartStatus.loading = false;
									chartStatus.error = 'Unable to get data from server!';
									$rootScope.$broadcast('analysisError');
									console.log("Epic Fail!...");
									self.updateCtrl(chartStatus);
								}
							} else {
								plottedChartTags[activeChart].trendFailed = true;
								if (activeChart < plottedChartTags.length - 1) {
									activeChart++;
									getStuff();
								} else {
									var chartStatus = {};
									chartStatus.loading = false;
									chartStatus.error = 'Unable to get data from server!';
									$rootScope.$broadcast('analysisError');
									console.log("Epic Fail!...");
									self.updateCtrl(chartStatus);
								}
							}
						}
					},
					// error
					function(error) {
						chartStatus.loading = false;
						chartStatus.error = 'Unable to get data from server!';
						$rootScope.$broadcast('analysisError');
						console.log("Epic Fail!...");
						self.updateCtrl(chartStatus);
					});
				};
				if (activeChart < plottedChartTags.length) {
					getStuff();
				}
			}
		};

		self.getavailableTagsForCurrentContext = function() {
			return self.availableTagsForCurrentContext;
		};

		/**
		 * @param tObj - time object
		 * @param templateObj -
		 * Refactor and modular existing function
		 */
		self.updateAllChart = function(tObj, chartObj) {
			var self = this;
			_.each(self.chartobjs, function(chart, idx) {
				//chart.xAxis[0].setExtremes(moment(tObj.stDt).format("X") * 1000, moment(tObj.endDt).format("X") * 1000);
				while (chart.series.length > 0)
				chart.series[0].remove(true);

			});
			var selectedPlottedCharts = self.getPlottedCharts();
			var tmRange,
			    stDt,
			    endDt;
			var customer = self.selectedObj.customer.customerId;

			var opt;
			var plottedChart;
			var chartStatus = {};
			var allPlottedTags;
			var activeChart;

			var activeTag = 0;

			// If we have any charts to plot

			var getStuff = function(allPlottedTags, activeChart, plotType, idx) {
				if (allPlottedTags[activeChart].selectedNode) {
					if (isNaN(allPlottedTags[activeChart].selectedNode)) {
						var sourceID = allPlottedTags[activeChart].selectedNode;
					} else {
						var sourceID = parseInt(allPlottedTags[activeChart].selectedNode);
					}//parseInt(allPlottedTags[activeChart].tags[activeTag].sourceId);

					var params = {
						customerId : allPlottedTags[activeChart].customerId,
						enterpriseId : allPlottedTags[activeChart].enterpriseId,
						isActive : true,
						startTime : stDt,
						endTime : endDt,
						consolidate : true
					};
				} else if (allPlottedTags[activeChart].nodeId) {
					var sourceID = allPlottedTags[activeChart].nodeId;
					var params = {
						customerId : allPlottedTags[activeChart].customerId,
						enterpriseId : allPlottedTags[activeChart].enterpriseId,
						isActive : true,
						startTime : stDt,
						endTime : endDt,
						consolidate : true
					};
				} else {
					var sourceID = allPlottedTags[activeChart].tags[activeTag].sourceId;
					stDt = allPlottedTags[activeChart].tags[activeTag].startTime;
					endDt = allPlottedTags[activeChart].tags[activeTag].endTime;
					var params = {
						customerId : allPlottedTags[activeChart].tags[activeTag].customerId,
						enterpriseId : allPlottedTags[activeChart].tags[activeTag].enterpriseId,
						isActive : true,
						startTime : stDt,
						endTime : endDt,
						consolidate : true
					};
				}

				$alarms.getAlarmPlot(plotType, params, sourceID).then(function(obj) {
					if (obj.status == "200") {
						var response = obj.response;
						var allTagsArray = response;
						var plottedChart;
						var tagsInfo = [];
						// holds latest tag info with all data
						var tagValues = [];
						// holds latest tag values with corrections
						var newPlottedCharts = [];
						var chartStatus = {
							loading : false,
							hasTagChanged : true,
							chart : null
						};

						//add new data to array of already process chart data
						_.each(allTagsArray, function(tObj, idx) {
							var tagObjDataArray = tObj.data;
							var newTagDataArray = [];
							//name for one of the charts set of data
							var tagName = response[idx].tagNode.nodepath;

							_.each(tagObjDataArray, function(tagObjData, i) {
								var t,
								    v;
								t = tagObjData.date;
								// time
								v = tagObjData.actual;
								// value
								newTagDataArray.push({
									't' : t,
									'v' : v
								});
							});

							tagsInfo[idx] = response[idx].tagNode;
							tagValues[idx] = {
								name : tagName,
								data : newTagDataArray
							};
						});
						var combinedArray = [];
						if (allPlottedTags[activeChart].tags && allPlottedTags[activeChart].tags.length) {
							var combinedTagObject = $.extend({}, allPlottedTags[activeChart].tags[activeTag], response[0]);
							combinedArray.push(combinedTagObject);
						}
						plottedChart = {
							'response' : response, // An array with objects in it
							'eventTime' : stDt,
							'endEventTime' : endDt,
							'preferredTimeZone' : 'tzLocal',
							'meta' : params,
							'sources' : allPlottedTags[activeChart].tags ? combinedArray : response
						};
						// if we still have tags(series) to process in this chart
						if (action === 'rebuildChart') {
							// Copy chart that we are interested in
							var rebuildChart = angular.copy(self.plottedCharts[idx]);
							rebuildChart.eventTime = stDt;
							rebuildChart.endEventTime = endDt;
							// Add new series to chart (copy)
							rebuildChart.response.push(plottedChart.response[0]);
							var result = rebuildChart.sources.filter(function(obj) {
								return obj.sourceId == plottedChart.sources[0].sourceId;
							});
							if (!result.length) {
								rebuildChart.sources.push(plottedChart.sources[0]);
							}
							// Set chart (copy) to replace original chart
							self.plottedCharts[idx] = rebuildChart;
							// Set chart index for loading status
							chartStatus.chartIdx = activeChart;
							self.loadingChart = chartStatus.chartIdx;

							// If we still have tags in this chart
							if (activeTag < allPlottedTags[activeChart].length - 1) {
								action = 'rebuildChart';
								activeTag++;
								chartStatus.loading = true;
								chartStatus.hasTagChanged = true;
								console.log("Rinse and repeat - from Rebuild");
								getStuff(allPlottedTags, activeChart, plotType, idx);
							} else {
								// if we still have charts to process
								if (activeChart < allPlottedTags.length - 1) {
									// if we dont have tags in this chart
									activeTag = 0;
									activeChart++;
									action = 'rebuildChart';

									chartStatus.loading = true;
									chartStatus.hasTagChanged = true;
									console.log("Rinse and repeat - from Create");
									getStuff(allPlottedTags, activeChart, plotType, idx);
								} else {
									chartStatus.loading = false;
									chartStatus.hasTagChanged = true;
									console.log("Yes we are done with this chart! from Rebuild" + activeChart);
									$rootScope.$broadcast('event:finishedPlottedCharts', self.plottedCharts);
								}
							}
						} else if (action === "updateChart") {
							var rebuildChart = angular.copy(self.plottedCharts[activeChart]);
							rebuildChart.eventTime = stDt;
							rebuildChart.endEventTime = endDt;
							// Add new series to chart (copy)
							rebuildChart.response.push(plottedChart.response[0]);
							var result = rebuildChart.sources.filter(function(obj) {
								return obj.sourceId == plottedChart.sources[0].sourceId;
							});
							if (!result.length) {
								rebuildChart.sources.push(plottedChart.sources[0]);
							}
							// Set chart (copy) to replace original chart
							self.plottedCharts[activeChart] = rebuildChart;
							// Set chart index for loading status
							chartStatus.chartIdx = activeChart;
							self.loadingChart = chartStatus.chartIdx;
							if (activeTag < allPlottedTags[activeChart].tags.length - 1) {
								action = 'updateChart';
								activeTag++;
								chartStatus.loading = true;
								chartStatus.hasTagChanged = true;
								console.log("Rinse and repeat - from Create");
								getStuff(allPlottedTags, activeChart, plotType, idx);
							} else {
								if (activeChart < allPlottedTags.length - 1) {
									action = "";
									activeTag = 0;
									activeChart++;
									getStuff(allPlottedTags, activeChart, plotType);
								} else {
									chartStatus.loading = false;
									chartStatus.hasTagChanged = true;
									activeChart = 0;
									activeTag = 0;
									console.log("Yes we are done with this chart! from Rebuild" + activeChart);
									$rootScope.$broadcast('event:finishedPlottedCharts', self.plottedCharts);
								}

							}
						} else {
							// Creating new chart
							self.plottedCharts.push(plottedChart);
							// check if new chart has more tags
							if (activeTag < allPlottedTags[activeChart].tags.length - 1) {
								action = 'updateChart';
								activeTag++;
								chartStatus.loading = true;
								chartStatus.hasTagChanged = true;
								console.log("Rinse and repeat - from Create");
								getStuff(allPlottedTags, activeChart, plotType, idx);
							} else {
								if (activeChart < allPlottedTags.length - 1) {
									action = "";
									activeTag = 0;
									activeChart++;
									getStuff(allPlottedTags, activeChart, plotType);
								} else {
									activeChart = 0;
									activeTag = 0;
									chartStatus.loading = false;
									chartStatus.hasTagChanged = true;
									console.log("Yes we are done now!!! - from Create");
									$rootScope.$broadcast('event:finishedPlottedCharts', self.plottedCharts);
								}
							}
						}
						chartStatus.chart = plottedChart;
						self.updateCtrl(chartStatus);
						self.hasTagChanged = chartStatus.hasTagChanged;
						// this is required also for multiple customer validation
					} else {
						var chartStatus = {};
						var nodePathName = allPlottedTags[activeChart].tags[activeTag].nodeNamePath;
						var index = nodePathName.lastIndexOf("->");
						nodePathName = nodePathName.substring(index + 2);
						plottedChart = {
							"response" : [],
							'eventTime' : stDt,
							'endEventTime' : endDt,
							'preferredTimeZone' : 'tzLocal',
							'meta' : params,
							'sources' : [{
								"sourceId" : allPlottedTags[activeChart].tags[activeTag].sourceId,
								"namepath" : allPlottedTags[activeChart].tags[activeTag].nodeNamePath,
								"name" : nodePathName,
								"nodePath" : allPlottedTags[activeChart].tags[activeTag].nodePath,
								"trendFailed" : true
							}]
						};
						if (!self.plottedCharts[activeChart]) {
							self.plottedCharts.push(plottedChart);
							action = 'updateChart';
						} else {
							var rebuildChart = angular.copy(self.plottedCharts[activeChart]);
							//self.plottedCharts[activeChart].sources.push(plottedChart.sources[0])
							//console.log(rebuildChart);
							rebuildChart.eventTime = stDt;
							rebuildChart.endEventTime = endDt;
							// Add new series to chart (copy)
							// Set chart (copy) to replace original chart
							rebuildChart.sources.push(plottedChart.sources[0]);
							self.plottedCharts[activeChart] = rebuildChart;
							// Set chart index for loading status
							chartStatus.chartIdx = activeChart;
							self.loadingChart = chartStatus.chartIdx;
						}
						if (activeTag < allPlottedTags[activeChart].tags.length - 1) {

							activeTag++;
							chartStatus.loading = true;
							chartStatus.hasTagChanged = true;
							console.log("Rinse and repeat - from Create");
							getStuff(allPlottedTags, activeChart, plotType, idx);
						} else {
							if (activeChart < allPlottedTags.length - 1) {
								action = "";
								activeTag = 0;
								activeChart++;
								getStuff(allPlottedTags, activeChart, plotType);
							} else {
								activeChart = 0;
								activeTag = 0;
								chartStatus.loading = false;
								chartStatus.hasTagChanged = true;
								console.log("Yes we are done now!!! - from Create");
								$rootScope.$broadcast('event:finishedPlottedCharts', self.plottedCharts);
							}
						}

						/*
						 var chartStatus = {};
						 chartStatus.loading = false;
						 chartStatus.error = 'Unable to get data from server!';
						 $rootScope.$broadcast('analysisError');
						 console.log("Epic Fail!...");
						 self.updateCtrl(chartStatus);*/

					}

				},
				// error
				function(error) {
					chartStatus.loading = false;
					chartStatus.error = 'Unable to get data from server!';
					$rootScope.$broadcast('analysisError');
					console.log("Epic Fail!...");
					self.updateCtrl(chartStatus);
				});

			};
			this.getPlots = function(allPlottedTags, activeChart, idx) {
				var self = this;
				if (allPlottedTags) {
					if (allPlottedTags.length > 0) {
						chartStatus.loading = true;
						self.updateCtrl(chartStatus);

						// Setup time Ranges

						tmRange = self.staticData.buttons.timeRangeOptions[self.analysisContext.selectedTimeIndex].route;
						stDt = self.getStartDt(tmRange, self.analysisContext.selectedCustomTimeStartDt);
						endDt = self.getEndDt(tmRange, self.analysisContext.selectedCustomTimeEndDt);
						var plotType = "alarm-plot";
					}
					if (activeChart < allPlottedTags.length /*&& activeTag < allPlottedTags[activeChart].tags.length*/) {
						getStuff(allPlottedTags, activeChart, plotType, idx);
					}
				}
			};
			if (selectedPlottedCharts.length) {
				var action = "rebuildChart";
				_.each(selectedPlottedCharts, function(selectedPlottedChart, idx) {
					selectedPlottedChart.response = [];
					allPlottedTags = [];
					activeChart = 0;
					if (!selectedPlottedChart.tags) {
						selectedPlottedChart.tags = [];
						_.each(selectedPlottedChart.sources, function(source, idx) {
							if (!source.tagNode) {
								source.tagNode = {};
							}
							source.tagNode.customerId = selectedPlottedChart.meta.customerId;
							selectedPlottedChart.tags.push(source.tagNode);
						});
					}
					for (opt in selectedPlottedChart.tags) {
						if (selectedPlottedChart.tags[opt]) {
							allPlottedTags.push(selectedPlottedChart.tags[opt]);
						}
					}
					this.getPlots(allPlottedTags, activeChart, idx);
				}, this);
			} else {
				activeChart = 0;
				var action = "";
				allPlottedTags = chartObj;
				this.getPlots(allPlottedTags, activeChart);

				/*
				 _.each(chartObj, function(selectedPlottedChart, idx) {
				 selectedPlottedChart.response = [];
				 allPlottedTags = [];

				 for (opt in selectedPlottedChart.tags) {
				 if (selectedPlottedChart.tags[opt]) {
				 allPlottedTags.push(selectedPlottedChart.tags[opt]);
				 }
				 }
				 this.getPlots(allPlottedTags, activeChart, idx);
				 }, this);*/

			}

		};

		self.getPlottedCharts = function() {
			return self.plottedCharts;
		};

		self.analysisPlotNewChart = function() {
			var action = 'newChart';
			// telling what action needs to be taken
			self.getTagValues(self.plotNewSelectedTags, action);
		};

		self.updateAnalysisChart = function() {
			var action = 'updateChart';
			// telling what action needs to be taken
			self.getTagValues(self.editChartSelectedTags, action);
		};
		//remove edit items that were previously selected by the user
		self.changePreselected = function() {
			// self.editChartAvailableTags.forEach(item, index){
			//     if(item.selected){
			//         // push to be used.
			//     }
			//     else {
			//         // remove from array.
			//     }
			// }
		};

		self.changeChartSeries = function(tags, updateType, hasRawData) {
			var action = 'updateChart';
			// telling what action needs to be taken
			self.getTagValues(tags, action, updateType, hasRawData);
		};

		self.getStartDt = function(tRange, stDt) {

			var dt = new Date();

			if (tRange === "custom") {
				if (stDt) {

					if ($rootScope.selectedTz == 'tzLocal') {
						//var newDate = moment(dta.date).valueOf();
						var formattedDate = moment(stDt).utc(stDt).format();
						return new Date(formattedDate).toISOString();
					} else {
						//var newDate = moment(dta.date).utc(dta.date).valueOf();
						return stDt;
					}

				} else if (self.startDatePic) {
					return self.startDatePic;
				} else {
					return dt.toISOString();
				}
			}

			if (tRange === "oneHour") {
				dt.setUTCHours(dt.getUTCHours() - 1);
			} else if (tRange === "fourHours") {
				dt.setUTCHours(dt.getUTCHours() - 4);
			} else if (tRange === "twelveHours") {
				dt.setUTCHours(dt.getUTCHours() - 12);
			} else if (tRange === "twentyFourHours") {
				dt.setUTCHours(dt.getUTCHours() - 24);
			} else if (tRange === "fortyEightHours") {
				dt.setUTCHours(dt.getUTCHours() - 48);
			} else if (tRange === "oneWeek") {
				dt.setUTCHours(dt.getUTCHours() - 168);
			} else if (tRange === "twoWeeks") {
				dt.setUTCHours(dt.getUTCHours() - 336);
			} else if (tRange === "threeMonths") {
				dt.setUTCMonth(dt.getUTCMonth() - 3);
			} else if (tRange === "sixMonths") {
				dt.setUTCMonth(dt.getUTCMonth() - 6);
			} else if (tRange === "nineMonths") {
				dt.setUTCMonth(dt.getUTCMonth() - 9);
			} else if (tRange === "oneYear") {
				dt.setUTCMonth(dt.getUTCMonth() - 12);
			}
			return dt.toISOString();
		};

		self.getEndDt = function(tRange, endDt) {

			var dt = new Date();

			if (tRange === "custom") {

				if (endDt) {
					if ($rootScope.selectedTz == 'tzLocal') {
						//var newDate = moment(dta.date).valueOf();
						var formattedDate = moment(endDt).utc(endDt).format();
						return new Date(formattedDate).toISOString();
					} else {
						return endDt;
					}
				} else if (self.endDatePic) {
					return self.endDatePic;
				} else {
					return dt.toISOString();
				}

			}
			dt.setUTCHours(dt.getUTCHours());
			return dt.toISOString();
		};

		self.cancelAnalysisPlotNewChart = function(instance) {
			self.plotNewSelectedTags = {};
			instance.$dismiss('cancel');
		};

		return self;
	}]);

});
