
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
    controllers.controller('MappingCtrl', ['$log', '$scope','$mapping','$stateParams','$users',
            'UserSelections','$modal','$state', '$rootScope','$guid', '$timeout', function ($log, $scope,$mapping,$stateParams,$users,
                                                    UserSelections,$modal,$state, $rootScope,$guid, $timeout) {

        // ================================================
        // PUBLIC METHODS
        $scope.mappedData=!$scope.mappedData?[]:$scope.mappedData.length=0;
        if($scope.message){
            delete $scope.message;
        }
        UserSelections.setUploadMessage('')
        $scope.customerId = UserSelections.getSelectedCustomer()|| '';
        $scope.assetType =UserSelections.getHierarchyOption()||"System1";
        $scope.alerts=[];
        $scope.showUploading = false;
        $scope.getMappingHierarchy = function(customerId,assetType){

        $mapping.getMappingHierarchy(customerId,assetType).then(
            // success
            function(response){
                $scope.mappedData = response;
            },
            // error
            function(error){
                $log.error(error);
            }
        )};

        $scope.getMappingHierarchy($scope.customerId, $scope.assetType);

        $scope.download=function(){
            var dt = new Date();
            if(!$scope.customerId){
                $scope.customerId = UserSelections.getSelectedCustomer();
            }
            window.open('/customer/'+escape($scope.customerId)+'/mapping/download?assetType='+$scope.assetType + '&ts=' + dt.getTime());
        };
        $scope.prepareUpload = function(event){
            if($scope.message){
                 $scope.message='';
                UserSelections.setUploadMessage('')
            }
            var fd = new FormData();
            $scope.changeData =true;
            $scope.showUploading = true;
            //fd.append( "fileInput", $("#file")[0].files[0]);
            fd.append( "file", $("#file")[0].files[0]);
            if(!$scope.customerId){
                $scope.customerId = UserSelections.getSelectedCustomer();
                if (!$scope.customerId){
                    $scope.message = 'Please Select Customer';
                    $scope.alertType='warning';
                    UserSelections.setUploadMessage( $scope.message,$scope.alertType)
                    return;
                }else{
                    delete $scope.message;
                    UserSelections.setUploadMessage('')
                }
            }
            $guid.getGuidToken().then(
                // success
                function(data) {
                    $scope.guidToken = data.response;
                    $mapping.uploadFile(fd, $scope.customerId,$scope.assetType,$scope.guidToken).then(
                        function(uploadresponse){
                           //console.log("mapping response",uploadresponse.data.response)
                            $scope.message = uploadresponse.data.response;
                            $scope.alertType='success';
                            $scope.showUploading = false;
                            UserSelections.setUploadMessage( $scope.message,$scope.alertType)
                            $scope.getMappingHierarchy($scope.customerId, $scope.assetType);
                            $state.transitionTo($state.current, $stateParams, {
                                reload: true,
                                inherit: true,
                                notify: true });
                        },function(uploaderror){
                            //console.log("mapping response",uploaderror.data.response)
                            $scope.message = uploaderror.response;//TODO find out how to get the response message in here
                            $scope.showUploading = false;
                            if(!$scope.message || $scope.message==''){
                                $scope.message = 'Please Select File'
                            }
                            $scope.alertType = 'warning';
                            UserSelections.setUploadMessage( $scope.message,$scope.alertType);
                            return uploaderror;
                        });
                },
                // error
                function(guiderror){
                    console.log("service response",guiderror)
                    $scope.message = guiderror.data.response; $scope.alertType = 'danger';
                    UserSelections.setUploadMessage( $scope.message,$scope.alertType);
                    return guiderror;
                });
        };

        $scope.message = UserSelections.getUploadMessage();
        $scope.getMappingHierarchy($scope.customerId, $scope.assetType);

        $scope.assetByType = function(assetType){
            switch(assetType){
                case 'System1':
                case 'siHierarchy':
                    $scope.assetType='System1';
                    return 'System 1';
                case 'SmartSignal':
                case 'ssHierarchy':
                    $scope.assetType='SmartSignal';
                    return 'SmartSignal';
            }
        };

        $scope.mappingByType = function(mappingType){
            $scope.mappingType=mappingType;
            $scope.customerId=mappingType;
        };
        $scope.closeAlert = function(index) {
            delete $scope.message;
            UserSelections.setUploadMessage('')
        };
        $scope.assetType=UserSelections.getAssetType()|| $stateParams.assetType || 'System1';

        /**
         * Switch customer
         * @param  {obj} customer The customer object
         */

        $scope.setCustomer = function(customerId) {
            $scope.customerId = customerId;
            UserSelections.setSelectedCustomer(customerId);
            // reset the nodeId
            $rootScope.nodeId = null;
            $scope.getMappingHierarchy($scope.customerId, $scope.assetType);
            /*$state.go('assets.detail.overview', {
                customerId: $scope.customerId,
                fleetId: $scope.fleetId
            });*/
            $("#fleet").addClass('active');

        };
    }]
    )});
