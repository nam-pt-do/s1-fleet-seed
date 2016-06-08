
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
        ['$log', '$scope', '$state', '$timeout', '$stateParams', '$analysis', '$alarms','$users','UserSelections',
        function ($log, $scope, $state, $timeout, $stateParams, $analysis, $alarms,$users,UserSelections) {

        //Get Points for selected Machine
        var selectedMachineId;
        var selectedVariables=[];
        var arr=[];
        $scope.selVariable=[];
        
        $scope.selection = {ids: {}};
        var getMachineService=function(sourceID){
            //var nodeID=$scope.nodeId;
            var nodeID=$scope.enterpriseId;
            var customerId=$scope.customerId;

            $log.info("Node ID: "+nodeID + " Customer ID "+customerId);
            $analysis.getPointsAndVariables(customerId,nodeID,sourceID).then(
                //Success
                function(response){
                    //debugger;
                    $log.info("Analysis Response: "+ response);
                    arr=[];
                    //Get Keys from this response
                    arr=response;
                    $scope.availablePoints=Object.keys(arr);
                }
        )};

        $scope.setSelected = function(selectedPoint) {
               // window.alert("Clicked ROw!"+selectedPoint.point);
                //Get the variables for the selected Point
                var _variables=arr[selectedPoint.point];
                $scope.pointVariables=_variables;

                //Set styles for selected row
                if ($scope.lastSelected) {
                    $scope.lastSelected.selected = '';
                }
                this.selected = 'selected';
                $scope.lastSelected = this;
            };

        //Methods to plot the chart
        var getTimeStrings = function(range){
            var t = {};
            switch(range){
                case '1day':
                    t.start = moment().subtract('hour', 24).toISOString();
                    t.end =  moment().toISOString();
                    break;

                case '1week':
                    t.start = moment().subtract('week', 1).toISOString();
                    t.end =  moment().toISOString();
                    break;

                case '1month':
                    t.start =  moment().subtract('month', 1).toISOString();
                    t.end =  moment().toISOString();
                    break;

                case '3months':
                    t.start =  moment().subtract('month', 3).toISOString();
                    t.end =  moment().toISOString();
                    break;

                case '1m':
                    t.start =  moment().subtract('month', 1).toISOString();
                    t.end =  moment().toISOString();
                    break;

                case '6m':
                    t.start =  moment().subtract('month', 1).toISOString();
                    t.end =  moment().toISOString();
                    break;

                case '1y':
                    t.start =  moment().subtract('month', 12).toISOString();
                    t.end =  moment().toISOString();
                    break;

                default:
                    t.start = null;
                    t.end =  null;
                    break;
            }
            return t;
        };
        var alarmPlotParams=function(_start,_end){
            var params = {
                customerId: $stateParams.customerId,
                enterpriseId: $scope.enterpriseId,
                isActive: $scope.range === 'active',
                startTime: _start,
                endTime:_end,
                consolidate: $scope.consolidate

               /* startTime : '2014-08-28T18:38:10.880Z'
                ,endTime :'2014-08-29T18:38:10.881Z'*/
            };

            // For enterprises, don't send the nodeId
            if($scope.nodeType !== 'enterprise'){
                params.nodeId = $scope.nodeId;
            }

            return params;
        };

        var formDate=function(_date, _time){
            return moment([_date.getFullYear(),_date.getMonth(),_date.getDate(),_time.split('\:')[0],_time.split('\:')[1],"00"]).toISOString();
        };

        $scope.open = function() {
            $timeout(function() {
                $scope.opened = true;

            });
        };


        $scope.plotChart=function(nodes){
            //Get list of selected variable points and get series data for each of these variables. This will provide data for various series.
            //Get list of all checked variables from the scope.selection
            var sel=_.filter(nodes,{'selected':true});
            selectedVariables.push( _.chain(sel).pluck('nodeId').unique().valueOf());
            $scope.maintainVariables=_.chain(selectedVariables).flatten().unique().valueOf();

            //Date Time Validation
            if($scope.startTime && $scope.endTime && $scope.dtStartDate && $scope.$$childHead.$$nextSibling.dtEndDate){
                $scope.validationError="false";
                var startTime=$scope.startTime;
                var endTime=$scope.endTime;

                var startDate=$scope.dtStartDate;
                var endDate=$scope.$$childHead.$$nextSibling.dtEndDate;

                //Form the Date time string
                $scope.frmStartDate=formDate(startDate,startTime);
                $scope.frmEndDate=formDate(endDate,endTime);

                //TODO-Validate Date - End Date cannot be greater than Start Date

                //Pass parameters and make service call for the plot
                var sourceID=selectedVariables[0];
                getWaveform( $scope.frmStartDate, $scope.frmEndDate,sourceID);
            }
            else{
                $scope.validationError="true";
            }

            if($scope.validationError){

            }
        };

        var getWaveform = function(stDate,enDate,sourceID){
            var options=alarmPlotParams(stDate,enDate);
            // $scope.chartAnalysisData=sourceID;
            var eventTime=$scope.lastOcurrenceTime;
            var updatedResponse=[], timeSwitchData=[];
            var plotType='alarm-plot';

            _.forEach(sourceID,function(srcID){
                //Get series data for each of the selected variables(source ID)
                $alarms.getAlarmPlot(plotType, options,srcID).then(
                    // success
                    function(response){
                        //debugger;
                        //Determine if adding a new series or plotting a new chart
                        var _action;
                        if($scope.chartAnalysisData){
                            //Adding series
                            _action='addSeries';
                        }
                        else{
                            _action='addChart';
                        }
                        updatedResponse.push({sourceID:srcID,response:response, action:_action});
                        $scope.chartAnalysisData = updatedResponse;
                    },
                    // error
                    function(error){
                        $log.error(error);
                    }
                );
            });
        };

        $scope.clearPlot=function(){
            $scope.chartAnalysisData=[{action:'clearPlot'}];
        };

        $scope.storeVariable=function(selectedNode){
            selectedVariables.push($scope.selection.ids);
          //  $scope.selVariable.push(selectedNode);
          //  saveSession(selectedVariables);
            //TODO - Pop the id from selectedVariable array if user un-checks the variable
        };


        //Save Plot Session
        //Save the variables in some array for future use.
        $scope.savePlotSession=function(){
            $scope.currentUser.preference.analysisVariables=$scope.maintainVariables;
            $scope.currentUser.preference.analysisStartDate=$scope.frmStartDate;
            $scope.currentUser.preference.analysisEndDate=$scope.frmEndDate;

            UserSelections.setCurrentUserPrefs($scope.currentUser.preference);

        };

        $scope.loadSavedVariables=function(){
            $scope.maintainVariables=  UserSelections.getCurrentUserPrefs().analysisVariables;
            $scope.frmStartDate=UserSelections.getCurrentUserPrefs().analysisStartDate;
            $scope.frmEndDate=UserSelections.getCurrentUserPrefs().analysisEndDate;

           getWaveform($scope.frmStartDate, $scope.frmEndDate,$scope.maintainVariables);
        };

        var validateDates=function(startDate,endDate){
            if(startDate<endDate){
                return 0;
            }
            else{
                return 1;
            }
        };
        //Watchers
        $scope.$on('nodeChanged', function(evt, obj){
            console.log("Machine ID:"+ obj.nodeId);
            getMachineService(obj.nodeId);
        });


         // ================================================
        // INITIALIZE

    }])
    });
