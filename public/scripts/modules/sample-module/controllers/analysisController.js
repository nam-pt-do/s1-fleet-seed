
/**
 * Renders all the widgets on the tab and triggers the datasources that are used by the widgets.
 * Customize your widgets by:
 *  - Overriding or extending widget API methods
 *  - Changing widget settings or options
 */
'use strict';

define(['angular',
    'controllers-module',
    'vruntime'
], function(angular, controllers) {

    // Controller definition
    controllers.controller('AnalysisCtrl',
        ['$log', '$scope', '$state', '$stateParams', '$analysis', '$alarms', '$users', 'UserSelections', '$guid', 'ctxGlobal', '$timeout', '$rootScope',
        function ($log, $scope, $state, $stateParams, $analysis, $alarms, $users, UserSelections, $guid, ctxGlobal, $timeout, $rootScope) {

        $scope.cId = ctxGlobal.getCustomerId(); // Customer ID
        $scope.eId = $scope.enterpriseId; // Enterprise ID
        $scope.nId = ctxGlobal.getNodeId(); // Node ID
        $scope.pId = null; // Point ID
        $scope.vId = null; // Enterprise ID

        $scope.plotSelections = $analysis.getPlotSelections;

        //Initialize default start and end date
        var tempEndDt = ($scope.plotSelections && $scope.plotSelections.length > 0 && $scope.plotSelections[0]) ? new Date($scope.plotSelections[0].eDt) : moment(new Date());
        var tempEndDt = $scope.dtEndDate || tempEndDt;
        var tempStDt = ($scope.plotSelections && $scope.plotSelections.length > 0 && $scope.plotSelections[0]) ? new Date($scope.plotSelections[0].sDt) : moment().subtract(7, 'days');
        var tempStDt = $scope.dtStartDate || tempStDt;
        var stDt = new Date(tempStDt);
        var edDt = new Date(tempEndDt);
        if ($scope.currentUser && $scope.currentUser.preference) {
            $rootScope.selectedTz = $rootScope.currentUser.preference.tzOption
        } else {
            $rootScope.selectedTz = UserSelections.getTimezone();
        }

        if ($rootScope.selectedTz && $rootScope.selectedTz == 'tzGmt') {
            $scope.dtStartDate = stDt.getUTCFullYear() + '-' + ((stDt.getUTCMonth() < 9) ? "0" + ( stDt.getUTCMonth() + 1 ) : stDt.getUTCMonth() + 1) + '-' + ((stDt.getUTCDate() < 10) ? "0" + stDt.getUTCDate() : stDt.getUTCDate());
            $scope.dtEndDate = edDt.getUTCFullYear() + '-' + ((edDt.getUTCMonth() < 9) ? "0" + ( edDt.getUTCMonth() + 1) : edDt.getUTCMonth() + 1) + '-' + ((edDt.getUTCDate() < 10) ? "0" + edDt.getUTCDate() : edDt.getUTCDate());
            $scope.startTime = ((stDt.getUTCHours() < 10) ? "0" + stDt.getUTCHours() : stDt.getUTCHours()) + ":" + ((stDt.getUTCMinutes() < 10) ? "0" + stDt.getUTCMinutes() : stDt.getUTCMinutes());
            $scope.endTime = ((edDt.getUTCHours() < 10) ? "0" + edDt.getUTCHours() : edDt.getUTCHours()) + ":" + ((edDt.getUTCMinutes() < 10) ? "0" + edDt.getUTCMinutes() : edDt.getUTCMinutes());
        } else if ($rootScope.selectedTz && $rootScope.selectedTz == 'tzLocal') {
            $scope.dtStartDate = stDt.getFullYear() + '-' + ((stDt.getMonth() < 9) ? "0" + (stDt.getMonth() + 1 ) : stDt.getMonth() + 1) + '-' + ((stDt.getDate() < 10) ? "0" + stDt.getDate() : stDt.getDate());
            $scope.dtEndDate = edDt.getFullYear() + '-' + ((edDt.getMonth() < 9) ? "0" + (edDt.getMonth() + 1 ) : edDt.getMonth() + 1) + '-' + ((edDt.getDate() < 10) ? "0" + edDt.getDate() : edDt.getDate());
            $scope.startTime = ((stDt.getHours < 10) ? "0" + stDt.getHours() : stDt.getHours()) + ":" + ((stDt.getMinutes() < 10) ? "0" + stDt.getMinutes() : stDt.getMinutes());
            $scope.endTime = ((edDt.getHours() < 10) ? "0" + edDt.getHours() : edDt.getHours()) + ":" + ((edDt.getMinutes() < 10) ? "0" + edDt.getMinutes() : edDt.getMinutes());
        }

        $scope.plotSelections = $analysis.getPlotSelections;
        $scope.plot = {};
        $scope.availablePtsAndVars = [];
        $scope.availablePts = [];
        $scope.availableVars = [];
        $scope.selectedPt = null;
        $scope.chartInstance = null;
        $scope.showSpinner = false;
        $scope.spinnerText = "";

        $scope.showMessage = function (msg, msgType) {
            $scope.displayMessage = "true";
            $scope.message = msg; //btn-info or btn-warning or btn-error
            $scope.messageClass = msgType;
        };
        $scope.clearMessage = function () {
            $scope.displayMessage = "false";
            $scope.message = "";
            $scope.messageClass = "";
        };

        $scope.clearMessage();
        for (var i = 0; i < UserSelections.getAssetArray().length; i++) {
            if (UserSelections.getAssetArray()[i].type === "enterprise" &&
                UserSelections.getAssetArray()[i].sourceSystemEnum === "System1" &&
                UserSelections.getAssetArray()[i].enterpriseId === $scope.eId) {
                findNodeFromEnterprise(UserSelections.getAssetArray()[i]);
            }
            if ($scope.n) {
                break;
            }
        }
        if ($scope.cId && $scope.eId && $scope.nId && $scope.n && ($scope.n.nodeTypeEnum === 'machine' || $scope.n.nodeTypeEnum === 'machine_train')) {
            showAnalysisSpinner("Loading points and variables for the selected node");
            $analysis.getPtsAndVars($scope.cId, $scope.eId, $scope.nId).then(function (data) {

                //debugger;
                hideAnalysisSpinner();
                $scope.clearMessage();
                $scope.availablePtsAndVars = data;
                $scope.availablePts = Object.keys($scope.availablePtsAndVars);
            }, function () {
                hideAnalysisSpinner();
                $scope.showMessage("Unexpected error in processing the request. Please retry or contact the site administrator.", "btn-warning");
            });

        } else {
            $scope.showMessage("Analysis is only available for trains or assets. Please select a System 1 train or asset from the hierarchy.", "btn-info");
        }

        var getEnterpriseConnectionStatus = function () {

            var options = {
                customerId: $scope.cId,
                enterpriseId: $scope.eId
            }

            $analysis.getEnterpriseConnectionStatus(options).then(
                // success
                function (data) {
                    var response = data.response;
                    //debugger;

                    if (response.communicatingStatus == "Not Communicating") $scope.statusMessage = response.communicationStatusMessage;
                },
                // error
                function (error) {
                    $log.error(error);
                }
            );
        };

        getEnterpriseConnectionStatus();


        $scope.setSelected = function (selectedPoint) {
            var _variables = $scope.availablePtsAndVars[selectedPoint.point];
            $scope.availableVars = _variables;
            $scope.selectedPt = selectedPoint.point;
            //Set styles for selected row
            if ($scope.lastSelected) {
                $scope.lastSelected.selected = '';
            }
            this.selected = 'selected';
            $scope.lastSelected = this;
        };

        $scope.storeVariable = function (selectedVar) {
            console.log("selectedPt " + $scope.selectedPt + " selectedVar " + selectedVar);
        };


        $scope.validateTimeRange = function (selectedVar) {
            if ($scope.startTime && $scope.endTime && $scope.dtStartDate && $scope.$$childHead.$$nextSibling.dtEndDate) {
                if (moment($scope.$$childHead.$$nextSibling.dtEndDate).isBefore($scope.dtStartDate)) {
                    $scope.showMessage("Please select a valid start and end date for the plot.", "btn-warning");
                    return false;
                }
                else {
                    /*
                     var startTime=$scope.startTime;
                     var endTime=$scope.endTime;
                     var startDate=$scope.dtStartDate;
                     var endDate=$scope.$$childHead.$$nextSibling.dtEndDate;

                     //Form the Date time string
                     var stDt = new Date(startDate);
                     var edDt = new Date(endDate);




                     //Form Time component from selected Timepicker control
                     var tt=startTime.split('\:');
                     var _stTm = moment();
                     _stTm.set('hour',parseInt(tt[0]));
                     _stTm.set('minute',parseInt(tt[1]));

                     var stTm = new Date(_stTm);

                     var tt=endTime.split('\:');
                     var _edTm = moment();
                     _edTm.set('hour',parseInt(tt[0]));
                     _edTm.set('minute',parseInt(tt[1]));

                     var edTm=new Date(_edTm);
                     */

                    //$scope.frmStartDate=formDate(formatDateAsPerPreference(stDt),formatTimeAsPerPreference(stTm));
                    //$scope.frmEndDate=formDate(formatDateAsPerPreference(edDt),formatTimeAsPerPreference(edTm));

                    //$scope.frmStartDate=formDate(stDt,stTm);
                    //$scope.frmEndDate=formDate(edDt,edTm);

                    formatISOEndPointDates();


                    return true;
                }


            } else {
                return false;
            }
        };

        $scope.plotChart = function () {
            $scope.clearMessage();
            showAnalysisSpinner("Loading plot data for selected variables...");
            //Validate if the time range is correct
            if ($scope.validateTimeRange()) {
                for (var pt in $scope.availablePtsAndVars) {
                    for (var j = 0; j < $scope.availablePtsAndVars[pt].length; j++) {
                        if ($scope.availablePtsAndVars[pt][j].selected) {
                            var foundAlready = false;
                            for (var i = 0; i < $scope.plotSelections.length; i++) {
                                var ps = $scope.plotSelections[i];
                                if (ps.cId === $scope.cId && ps.eId === $scope.eId && ps.vId === $scope.availablePtsAndVars[pt][j].nodeId) {
                                    foundAlready = true;
                                    //variable was already in selected plot
                                    if (ps.sDt != $scope.frmStartDate || ps.eDt != $scope.frmEndDate) {
                                        //previous selected plot is for diff time range. re-query the data for new time range
                                        ps.sDt = $scope.frmStartDate;
                                        ps.eDt = $scope.frmEndDate;
                                        ps.data = null;
                                        break;
                                    }
                                }
                            }
                            if (!foundAlready) {

                                $scope.plotSelections.push({
                                    cId: $scope.cId,
                                    eId: $scope.eId,
                                    nId: $scope.nId,
                                    pId: $scope.selectedPt,
                                    vId: $scope.availablePtsAndVars[pt][j].nodeId,
                                    sDt: $scope.frmStartDate,
                                    eDt: $scope.frmEndDate,
                                    vNm: $scope.availablePtsAndVars[pt][j].name,
                                    vUn: $scope.availablePtsAndVars[pt][j].units || "Unknown",
                                    data: null
                                });
                            }
                        }
                    }
                }
                //re-scan the plot selections to make sure any plot selections from different trains all have same date
                for (var i = 0; i < $scope.plotSelections.length; i++) {
                    var ps = $scope.plotSelections[i];
                    if (ps.sDt != $scope.frmStartDate || ps.eDt != $scope.frmEndDate) {
                        //previous selected plot is for diff time range. re-query the data for new time range
                        ps.sDt = $scope.frmStartDate;
                        ps.eDt = $scope.frmEndDate;
                        ps.data = null;
                    }
                }
                var needDataFromServerToPlot = false;
                for (var i = 0; i < $scope.plotSelections.length; i++) {
                    if (!($scope.plotSelections[i] && $scope.plotSelections[i].data)) {
                        needDataFromServerToPlot = true;
                        showAnalysisSpinner("Loading plot data for variable " + $scope.plotSelections[i].vNm);
                        $analysis.getAnalysisData($scope.plotSelections[i].cId, $scope.plotSelections[i].eId, $scope.plotSelections[i].vId, $scope.plotSelections[i].sDt, $scope.plotSelections[i].eDt).then(function (data) {
                            for (var j = 0; j < $scope.plotSelections.length; j++) {
                                var ps = $scope.plotSelections[j];
                                if (ps.cId === data.cId && ps.eId === data.eId && ps.vId === data.vId && ps.sDt === data.sDt && ps.eDt === data.eDt) {
                                    $scope.plotSelections[j].data = data;
                                    if (!(data && data.length > 0 && data[0].data.length > 0)) {
                                        $scope.showMessage("Failed to get the plot data for " + ps.vNm, "btn-warning");
                                        hideAnalysisSpinner();
                                    }
                                    break;
                                }
                            }
                            var allDataRequestProcessed = true;
                            for (var k = 0; k < $scope.plotSelections.length; k++) {
                                if (!($scope.plotSelections[k] && $scope.plotSelections[k].data)) {
                                    allDataRequestProcessed = false;
                                    console.log("allDataRequestProcessed=" + allDataRequestProcessed);
                                }
                            }
                            if (allDataRequestProcessed) {
                                hideAnalysisSpinner();
                                processPlotSelections();
                            }
                        }, function () {
                            // error handling
                            hideAnalysisSpinner();
                            $scope.showMessage("Unexpected error in processing the request. Please retry or contact the site administrator.", "btn-warning");
                        });
                    }
                }
                if (!needDataFromServerToPlot) {
                    hideAnalysisSpinner();
                    //All the data is already present. Just plot the data
                    processPlotSelections();
                }

            } else {
                hideAnalysisSpinner();
                $scope.showMessage("Please select a valid start and end date for the plot.", "btn-warning");
            }
        };

        function showAnalysisSpinner(txt) {
            $scope.showSpinner = "true";
            if (txt) {
                $scope.spinnerText = txt;
            } else {
                $scope.spinnerText = "Loading...";
            }
        };

        function hideAnalysisSpinner() {
            $scope.showSpinner = "false";
            $scope.spinnerText = "";
        };

        var formDate = function (_date, _time) {
            console.log(moment([_date.getFullYear(), _date.getMonth(), _date.getDate(), _time.getHours(), _time.getMinutes(), "00"]).toISOString());
            return moment([_date.getFullYear(), _date.getMonth(), _date.getDate(), _time.getHours(), _time.getMinutes(), "00"]).toISOString();
        };

        $scope.clearPlot = function () {
            for (var pt in $scope.availablePtsAndVars) {
                for (var j = 0; j < $scope.availablePtsAndVars[pt].length; j++) {
                    $scope.availablePtsAndVars[pt][j].selected = false;
                }
            }
            var tmp = [];
            if (UserSelections.getCurrentUser().preference.plotSelections) {
                for (var idx = 0; idx < UserSelections.getCurrentUser().preference.plotSelections.length; idx++) {
                    tmp.push(UserSelections.getCurrentUser().preference.plotSelections[idx]);
                }
            }
            $scope.plotSelections.splice(0);
            processPlotSelections();
            UserSelections.getCurrentUser().preference.plotSelections = tmp;
            $scope.clearMessage();
        };

        $scope.savePlotSession = function () {
            var plotSelectionsCopy = [];
            for (var idx = 0; idx < $scope.plotSelections.length; idx++) {
                plotSelectionsCopy.push({
                    cId: $scope.plotSelections[idx].cId,
                    eId: $scope.plotSelections[idx].eId,
                    nId: $scope.plotSelections[idx].nId,
                    pId: $scope.plotSelections[idx].pId,
                    vId: $scope.plotSelections[idx].vId,
                    sDt: $scope.plotSelections[idx].sDt,
                    eDt: $scope.plotSelections[idx].eDt,
                    vNm: $scope.plotSelections[idx].vNm,
                    vUn: $scope.plotSelections[idx].vUn,
                    data: null
                });

            }
            UserSelections.getCurrentUser().preference.plotSelections = plotSelectionsCopy;
            $guid.getGuidToken().then(function (tkn) {
                //debugger;
                $users.updateUser(UserSelections.getCurrentUser(), null, tkn).then(function (resp) {
                    //debugger;
                    //Success message
                    $scope.alerts.push({"id": 'success', "msg": 'Plot session successfully saved.'});
                    $scope.showAlert = true;
                    setTimeout(function () {
                        $scope.alerts.pop()
                    }, 1000);


                }, function () {
                    //Error handler
                    setTimeout(function () {
                        $scope.alerts.pop()
                    }, 1000);

                })
            }, function () {
                //Error handler
            });
        };

        $scope.open = function () {
            $timeout(function () {
                $scope.opened = true;

            });
        };
        //Show success alert after saving the session variables
        $scope.alerts = [];
        /* $scope.alerts = [
         { "id": 'success', "msg": 'Plot session successfully saved.' }
         ];*/
        $scope.showAlert = false;
        $scope.closeAlert = function (index) {
            //   $scope.alerts.splice(index, 1);
            $scope.alerts.pop();
        };

        $scope.loadSavedVariables = function () {
            if (UserSelections.getCurrentUser().preference.plotSelections != null && UserSelections.getCurrentUser().preference.plotSelections.length > 0) {
                var _savedVariables = UserSelections.getCurrentUser().preference.plotSelections;
            } else {
                var _savedVariables = ctxGlobal.getPlotSelections();
            }
            showAnalysisSpinner("Loading saved variables");
            //  if(UserSelections.getCurrentUser().preference.plotSelections) {
            if (_savedVariables.length > 0) {
                //  $scope.plotSelections = UserSelections.getCurrentUser().preference.plotSelections;
                $scope.plotSelections = _savedVariables;
                var needDataFromServerToPlot = false;
                for (var i = 0; i < $scope.plotSelections.length; i++) {
                    //set the plot date to the date in plot selections
                    if (i === 0) {
                        if ($scope.currentUser && $scope.currentUser.preference) {
                            $rootScope.selectedTz = $rootScope.currentUser.preference.tzOption
                        } else {
                            $rootScope.selectedTz = UserSelections.getTimezone();
                        }
                        /*
                         var savedSDt = new Date($scope.plotSelections[0].sDt);
                         var savedEDt = new Date($scope.plotSelections[0].eDt);

                         if (isUTC() ){
                         $scope.dtStartDate = savedSDt.getUTCFullYear()+'-'+((savedSDt.getUTCMonth() < 9) ? "0" + (savedSDt.getUTCMonth() + 1 ): savedSDt.getUTCMonth() + 1)+'-'+((savedSDt.getUTCDate() < 10) ? "0" + savedSDt.getUTCDate() : savedSDt.getUTCDate());
                         $scope.dtEndDate = savedEDt.getUTCFullYear()+'-'+((savedEDt.getUTCMonth() < 9) ? "0" + (savedEDt.getUTCMonth() + 1 ): savedEDt.getUTCMonth() + 1)+'-'+((savedEDt.getUTCDate() < 10) ? "0" + savedEDt.getUTCDate() : savedEDt.getUTCDate());
                         $scope.startTime = ((savedSDt.getUTCHours() < 10) ? "0" + savedSDt.getUTCHours() : savedSDt.getUTCHours()) +  ":" + ((savedSDt.getUTCMinutes() < 10) ? "0" + savedSDt.getUTCMinutes() :savedSDt.getUTCMinutes());
                         $scope.endTime = ((savedEDt.getUTCHours() < 10) ? "0" + savedEDt.getUTCHours() : savedEDt.getUTCHours()) +  ":" + ((savedEDt.getUTCMinutes() < 10) ? "0" + savedEDt.getUTCMinutes() :savedEDt.getUTCMinutes());
                         }else if ($rootScope.selectedTz && $rootScope.selectedTz =='tzLocal' ){
                         $scope.dtStartDate = savedSDt.getFullYear()+'-'+((savedSDt.getMonth() < 9) ? "0" +( savedSDt.getMonth() + 1 ): savedSDt.getMonth() + 1)+'-'+((savedSDt.getDate() < 10) ? "0" + savedSDt.getDate() : savedSDt.getDate());
                         $scope.dtEndDate = savedEDt.getFullYear()+'-'+((savedEDt.getMonth() < 9) ? "0" +( savedEDt.getMonth() + 1 ): savedEDt.getMonth() + 1)+'-'+((savedEDt.getDate() < 10) ? "0" + savedEDt.getDate() : savedEDt.getDate());
                         $scope.startTime = ((savedSDt.getHours < 10) ? "0" + savedSDt.getHours() : savedSDt.getHours()) +  ":" + ((savedSDt.getMinutes() < 10) ? "0" + savedSDt.getMinutes() :savedSDt.getMinutes());
                         $scope.endTime = ((savedEDt.getHours() < 10) ? "0" + savedEDt.getHours() : savedEDt.getHours()) +  ":" + ((savedEDt.getMinutes() < 10) ? "0" + savedEDt.getMinutes() :savedEDt.getMinutes());
                         }

                         console.log("$scope.dtStartDate = " + $scope.dtStartDate);
                         console.log("$scope.dtEndDate = " + $scope.dtEndDate);
                         console.log("$scope.startTime = " + $scope.startTime);
                         console.log("$scope.endTime = " + $scope.endTime);

                         */

                        setDatesFromPlot();
                        formatISOEndPointDates();
                    }
                    if (!($scope.plotSelections[i] && $scope.plotSelections[i].data)) {
                        needDataFromServerToPlot = true;
                        $analysis.getAnalysisData($scope.plotSelections[i].cId, $scope.plotSelections[i].eId, $scope.plotSelections[i].vId, $scope.plotSelections[i].sDt, $scope.plotSelections[i].eDt).then(function (data) {
                            //debugger;
                            for (var j = 0; j < $scope.plotSelections.length; j++) {
                                var ps = $scope.plotSelections[j];
                                if (ps.cId === data.cId && ps.eId === data.eId && ps.vId === data.vId && ps.sDt === data.sDt && ps.eDt === data.eDt) {
                                    ps.data = data;
                                    if (!(data && data.length > 0 && data[0].data.length > 0)) {
                                        $scope.showMessage("Failed to get the plot data for " + ps.vNm, "btn-warning");
                                    }
                                    break;
                                }
                            }
                            var allDataRequestProcessed = true;
                            for (var k = 0; k < $scope.plotSelections.length; k++) {
                                if (!($scope.plotSelections[k] && $scope.plotSelections[k].data)) {
                                    allDataRequestProcessed = false;
                                }
                            }
                            if (allDataRequestProcessed) {
                                processPlotSelections();
                            }
                        }, function () {
                            // error handling
                            $scope.showMessage("Unexpected error in processing the request. Please retry or contact the site administrator.", "btn-warning");
                        });
                    }
                }
                if (!needDataFromServerToPlot) {
                    //All the data is already present. Just plot the data
                    processPlotSelections();
                }
            }
            else {
                $scope.showSpinner = false;
                $scope.showMessage("No plots have been saved.", "btn-warning");
            }
        };

        function computePlotDataFromResponse(ps) {
            var plotValues = ps.data;
            var aSeries = {};
            if (plotValues && plotValues[0].data && plotValues[0].data.length > 0) {
                aSeries.name = ps.vNm;
                aSeries.marker = {enabled: false};
                aSeries.tooltip = {
                    valueSuffix: ' (' + ps.vUn + ')'
                };
                aSeries.data = [];
                for (var dIdx = 0; dIdx < plotValues[0].data.length; dIdx++) {
                    aSeries.data.push({
                        "x": Date.parse(plotValues[0].data[dIdx].date),
                        "y": parseFloat(plotValues[0].data[dIdx].actual),
                        "id": dIdx
                    });
                }
            }
            return aSeries;
        };


        function findNodeFromEnterprise(obj) {
            if (obj.nodeId && obj.nodeId === $scope.nId) {
                $scope.n = obj;
            }
            if (obj.enterpriseId === $scope.eId) {
                for (var x in obj.childNodes) {
                    findNodeFromEnterprise(obj.childNodes[x]);
                    if ($scope.n) {
                        break;
                    }
                }

            }
        };

        $rootScope.$watch('dtEndDate', function (newVal, oldVal) {
            //console.log('$rootScope.$watch(dtEndDate',newVal, oldVal);
            if (hasPlotSelections()) {
                setDatesFromPlot();
            }
        });

        function processPlotSelections() {
            if ($scope.plotSelections && $scope.plotSelections.length > 0) {
                var plotTemp = [];
                var yaxisTemp = [];
                for (var j = 0; j < $scope.plotSelections.length; j++) {
                    var ps = $scope.plotSelections[j];
                    var series = computePlotDataFromResponse(ps);
                    //find if the data needs a new yaxis
                    var existingAxis = -1;
                    for (var axis = 0; axis < yaxisTemp.length; axis++) {
                        if (yaxisTemp[axis] && ps.vUn === yaxisTemp[axis].title.text) {
                            existingAxis = axis;
                            break;
                        }
                    }
                    if (existingAxis == -1) {
                        //new yaxis
                        yaxisTemp.push({
                            id: ps.vUn,
                            opposite: (yaxisTemp.length % 2 != 0),
                            offset: (yaxisTemp.length % 2 == 0) ? (yaxisTemp.length / 2) * 50 : ((yaxisTemp.length - 1) / 2) * 50,
                            labels: {
                                formatter: function () {
                                    return this.value;
                                },
                                x: (yaxisTemp.length % 2 == 0) ? -8 : 10,
                                y: 3,
                                align: (yaxisTemp.length % 2 == 0) ? "right" : "left"
                            },
                            title: {
                                text: ps.vUn,
                                align: 'high',
                                rotation: 0,
                                offset: -20,
                                x: (yaxisTemp.length % 2 == 0) ? -2 + (yaxisTemp.length) * -2 : 30 + (yaxisTemp.length) * 5,
                                y: -15
                            }
                        });
                        series.yAxis = ps.vUn;
                    } else {
                        //existing yaxis
                        series.yAxis = ps.vUn;
                    }
                    plotTemp.push(series);
                }
                $scope.plot.yaxis = yaxisTemp;
                $scope.plot.series = plotTemp;
            } else {
                if ($scope.plot.yaxis) {
                    $scope.plot.yaxis.splice(0);
                }
                if ($scope.plot.series) {
                    $scope.plot.series.splice(0);
                }
            }
            hideAnalysisSpinner();

        };

        var initDates = function () {

            $scope.frmEndDate = new moment();
            $scope.frmStartDate = new moment().subtract(7, 'days');

            //console.log('init dates: ', $scope.frmStartDate, $scope.frmEndDate);

            formatFormDates();

        };

        $scope.$watch('[endTime, dtEndDate, startTime, dtStartDate]', function (newVal, oldVal) {
            console.log('date picker watch', newVal, oldVal);
            updateDatesFromForm();
        }, true);

        var isUTC = function () {
            return $rootScope.selectedTz && $rootScope.selectedTz == 'tzGmt';
        };

        var validDateFormFormat = function (date) {
            var formattedDate = new moment(date).format('YYYY-MM-DD');
            //console.log('validDateFormFormat: ', new moment(date).format('YYYY-MM-DD'));
            return formattedDate;

        };

        var updateDatesFromForm = function () {
            if (isUTC()) {
                $scope.frmStartDate = new moment($scope.dtStartDate + ' ' + $scope.startTime).utc();
                $scope.frmEndDate = new moment($scope.dtEndDate + ' ' + $scope.endTime).utc();

            } else {
                $scope.frmStartDate = new moment($scope.dtStartDate + ' ' + $scope.startTime);
                $scope.frmEndDate = new moment($scope.dtEndDate + ' ' + $scope.endTime);
            }

        };

        var setDatesFromPlot = function () {
            //console.log('setDatesFromPlot: ', $scope.plotSelections[0].eDt, $scope.plotSelections[0].sDt);
            $scope.frmEndDate = new moment($scope.plotSelections[0].eDt);
            $scope.frmStartDate = new moment($scope.plotSelections[0].sDt);

            formatFormDates();
        };

        var formatFormDates = function () {

            if (isUTC()) {
                $scope.dtEndDate = $scope.frmEndDate.utc().format('YYYY-MM-DD');
                $scope.dtStartDate = $scope.frmStartDate.utc().format('YYYY-MM-DD');

                $scope.startTime = $scope.frmStartDate.utc().format('HH:mm');
                $scope.endTime = $scope.frmEndDate.utc().format('HH:mm');

            } else {
                $scope.dtEndDate = $scope.frmEndDate.format('YYYY-MM-DD');
                $scope.dtStartDate = $scope.frmStartDate.format('YYYY-MM-DD');

                $scope.startTime = $scope.frmStartDate.format('HH:mm');
                $scope.endTime = $scope.frmEndDate.format('HH:mm');
            }

            //console.log(' formatFormDates ', $scope.dtStartDate ,  $scope.dtEndDate, $scope.startTime, $scope.endTime );

        };

        var formatDateISO = function (date) {
            var isoDate = null;

            if (isUTC()) {
                isoDate = new Date(date + ':00 UTC');
                return isoDate.toISOString();
            } else {
                isoDate = new Date(date).toJSON().toString();
                return isoDate;
            }

        };

        var formatISOEndPointDates = function () {
            var start = validDateFormFormat($scope.dtStartDate);
            var end = validDateFormFormat($scope.dtEndDate);

            $scope.frmStartDate = formatDateISO(start + ' ' + $scope.startTime);
            $scope.frmEndDate = formatDateISO(end + ' ' + $scope.endTime);
            //console.log('formatISOEndPointDates:',  $scope.frmStartDate, $scope.frmEndDate);
        };

        var hasPlotSelections = function () {
            return $scope.plotSelections && $scope.plotSelections.length > 0 && $scope.plotSelections[0];
        };


        // If there are any pre existing plot selections, plot them first
        if ($scope.plotSelections && $scope.plotSelections.length > 0) {
            processPlotSelections();
        }
        else {
            initDates();
        }

        $scope.$on('nodeChanged', function (evt, obj) {
            $scope.nId = obj.nodeId;
            if ($scope.customerId && $scope.enterpriseId && $scope.nId && ($scope.nodeSelectedType === 'machine' || $scope.nodeSelectedType === 'machine_train')) {
                showAnalysisSpinner("Loading points and variables for the selected node");
                $analysis.getPtsAndVars($scope.customerId, $scope.enterpriseId, $scope.nId).then(function (data) {
                    //debugger;
                    var response = data.response;
                    hideAnalysisSpinner();
                    $scope.availablePtsAndVars = response;
                    $scope.availablePts = Object.keys($scope.availablePtsAndVars);
                    $scope.clearMessage();
                }, function () {
                    hideAnalysisSpinner();
                    $scope.showMessage("Unexpected error in processing the request. Please retry or contact the site administrator.", "btn-warning");
                });
            }
            else {
                $scope.showMessage("Analysis is only available for trains or assets. Please select a System 1 train or asset from the hierarchy.", "btn-info");
            }
        });
    }]
    )});
