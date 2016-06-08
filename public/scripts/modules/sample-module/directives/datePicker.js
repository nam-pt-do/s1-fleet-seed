/*global define */
define(['angular', 'directives-module'], function(angular, directives) {
	'use strict';

	/* Directives  */
	directives.directive('aDatepicker', ['$filter', '$rootScope', '$state', '$timeout',
	function($filter, $rootScope, $state, $timeout) {
		return {
			restrict : 'A',
			scope : {
				datePickerObj : "=datepickerOn"
			},
			templateUrl : 'assets/views/analysis/datePicker.html',
			link : function($scope, element, attrs) {

				$scope.isClicked = false;
				$scope.showWeeks = false;

				$scope.isDateSelected = false;
				$scope.showTimePicker = true/*$state.includes('analysis')*/;

				// time picker variable
				$scope.hstep1 = 1;
				$scope.hstep2 = 1;
				$scope.mstep1 = 15;
				$scope.mstep2 = 15;

				$scope.ismeridian1 = true;
				$scope.ismeridian2 = true;

				$scope.toggleMode1 = function() {
					$scope.ismeridian1 = !$scope.ismeridian1;
				};
				$scope.toggleMode2 = function() {
					$scope.ismeridian2 = !$scope.ismeridian2;
				};

				$scope.getCurrentDate = function() {
					var currDate = new Date();
					if ($scope.showTimePicker) {// Only for Analysis
						if ($rootScope.siteTimezoneOffset === 0) {
							currDate = new Date(currDate.getUTCFullYear(), currDate.getUTCMonth(), currDate.getUTCDate(), currDate.getUTCHours(), currDate.getUTCMinutes(), currDate.getUTCSeconds());
						} else {
							var zoneOffset = moment(currDate).tz($rootScope.siteTimezone).format('ZZ');
							currDate = new Date(moment().zone(zoneOffset).format('YYYY-MM-DDTHH:mm:ss'));
							currDate = new Date(currDate.getUTCFullYear(), currDate.getUTCMonth(), currDate.getUTCDate(), currDate.getUTCHours(), currDate.getUTCMinutes(), currDate.getUTCSeconds());
						}
					}
					return currDate;
				};

				$scope.$watch('dt1', function(newVal, oldVal) {
					if (newVal) {
						$scope.minDate = $scope.dt1;
						// validation for selected date should be greater than 0

						var startDateCal = newVal;
						var endDateCal = $scope.endDate;
						var currentTime = $scope.getCurrentDate();
						var currentHour = currentTime.getHours();
						var currentMin = currentTime.getMinutes();
						var currentSec = currentTime.getSeconds();
						var rawStDate;
						var rawEnDate;

						startDateCal.setHours(currentHour);
						startDateCal.setMinutes(currentMin);
						startDateCal.setSeconds(currentSec);

						$scope.startDate = startDateCal;

						//var customDate = [startDate, endDate];
						if (endDateCal) {

							if ($scope.showTimePicker) {

								var startTimeObj = $scope.startTime;
								// from time picker
								var endTimeObj = $scope.endTime;
								// from time picker

								var startHour = startTimeObj.getHours();
								// get start hour
								var endHour = endTimeObj.getHours();
								// get end hour
								var startMin = startTimeObj.getMinutes();
								var endMin = endTimeObj.getMinutes();

								startDateCal.setHours(startHour);
								startDateCal.setMinutes(startMin);

								endDateCal.setHours(endHour);
								endDateCal.setMinutes(endMin);
							}
							$scope.startDate = startDateCal;
							$scope.startTime = startDateCal;

							rawStDate = Date.parse(startDateCal);
							rawEnDate = Date.parse(endDateCal);

							if (rawEnDate > rawStDate) {
								$scope.isDateSelected = true;
							} else {
								$scope.isDateSelected = false;
							}

						}

					}
				});

				$scope.$watch('dt2', function(newVal, oldVal) {

					if (newVal) {
						$scope.maxDate = $scope.dt2;
						var startDateCal = $scope.startDate = $scope.dt1;
						var endDateCal = newVal;
						var currentTime = $scope.getCurrentDate();
						var currentHour = currentTime.getHours();
						var currentMin = currentTime.getMinutes();
						var currentSec = currentTime.getSeconds();
						var rawStDate;
						var rawEnDate;

						endDateCal.setHours(currentHour);
						endDateCal.setMinutes(currentMin);
						endDateCal.setSeconds(currentSec);

						if ($scope.showTimePicker) {

							var startTimeObj = $scope.startTime;
							// from time picker
							var endTimeObj = $scope.endTime;
							// from time picker

							var startHour = startTimeObj.getHours();
							// get start hour
							var endHour = endTimeObj.getHours();
							// get end hour
							var startMin = startTimeObj.getMinutes();
							var endMin = endTimeObj.getMinutes();

							startDateCal.setHours(startHour);
							startDateCal.setMinutes(startMin);

							endDateCal.setHours(endHour);
							endDateCal.setMinutes(endMin);
						}
						$scope.endDate = endDateCal;
						$scope.endTime = endDateCal;

						rawStDate = Date.parse(startDateCal);
						rawEnDate = Date.parse(endDateCal);

						if (rawEnDate > rawStDate) {
							$scope.isDateSelected = true;
						} else {
							$scope.isDateSelected = false;
						}

					}
				});

				$scope.updateTime = function(stTime, endTime) {
					var startDateCal = $scope.dt1 || $scope.startDate;
					// from date picker
					var endDateCal = $scope.dt2 || $scope.endDate;
					
					// from date picker
					var rawStDate;
					var rawEnDate;

					var startTimeObj = $scope.startTime = stTime ? stTime : $scope.startTime;
					// from time picker
					var endTimeObj = $scope.endTime = endTime ? endTime : $scope.endTime;
					// from time picker
				
					var startHour = startTimeObj.getHours();
					// get start hour
					var endHour = endTimeObj.getHours();
					// get end hour
					var startMin = startTimeObj.getMinutes();
					var endMin = endTimeObj.getMinutes();

					if (endDateCal) {

						startDateCal.setHours(startHour);
						startDateCal.setMinutes(startMin);
						endDateCal.setHours(endHour);
						endDateCal.setMinutes(endMin);
						$scope.startDate = startDateCal;
						$scope.startTime = startDateCal;
						$scope.endDate = endDateCal;
						$scope.endTime = endDateCal;
						rawStDate = Date.parse(startDateCal);
						rawEnDate = Date.parse(endDateCal);
						if (rawEnDate > rawStDate) {
							$scope.isDateSelected = true;
						} else {
							$scope.isDateSelected = false;
						}
					}
				};

				$scope.applyTimeFilter = function() {

					var startDateCal = $scope.startDate;
					// from date picker
					var endDateCal = $scope.endDate;
					// from date picker
					var rawStDate;
					var rawEnDate;
					var startDate;
					var EndDate;
					var customDate;

					if ($scope.showTimePicker) {

						var startTimeObj = $scope.startTime;
						// from time picker
						var endTimeObj = $scope.endTime;
						// from time picker

						var startHour = startTimeObj.getHours();
						// get start hour
						var endHour = endTimeObj.getHours();
						// get end hour
						var startMin = startTimeObj.getMinutes();
						var endMin = endTimeObj.getMinutes();

						startDateCal.setHours(startHour);
						startDateCal.setMinutes(startMin);

						endDateCal.setHours(endHour);
						endDateCal.setMinutes(endMin);
					}

					startDate = $filter('moment')(startDateCal, "YYYY-MM-DDTHH:mm:ss");
					EndDate = $filter('moment')(endDateCal, "YYYY-MM-DDTHH:mm:ss");

					customDate = [startDate, EndDate];
					$rootScope.$broadcast("customDateUpdate", customDate);

					$scope.isDateSelected = false;
					$scope.datePickerObj.isDatepickerVisible = false;
				};

				$scope.$watch('datePickerObj', function(newValue, oldValue) {
					if (newValue !== oldValue) {

						var currentDate = $scope.getCurrentDate();
						$scope.startTime = currentDate;
						$scope.endTime = currentDate;
						$scope.startDate = currentDate;
						$scope.endDate = currentDate;
						if ($scope.dt1) {
                            $scope.dt1 = $scope.minDate;
                            $scope.startTime = $scope.minDate;
                        } else {
                            $scope.dt1 = $scope.minDate = $scope.currentDate = currentDate; 
						}
						if($scope.dt2) {
							$scope.dt2 = $scope.maxDate;
							$scope.endTime = $scope.maxDate;
						}
						$('#custom-calendar-wrapper').click(function(evt) {
							evt.stopPropagation();
						});

						$(document).bind("click", function(evt) {

							if (evt.target.id !== "timeCustom") {
								$scope.$apply(function() {
									$scope.datePickerObj.isDatepickerVisible = false;
									//$scope.dt2 = null;
									$scope.isDateSelected = false;
								});
							}
						});
					}
				}, true);
			}
		};
	}]);

	return directives
});