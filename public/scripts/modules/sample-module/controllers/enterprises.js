
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
    controllers.controller('EnterprisesCtrl', ['$log', '$scope', '$rootScope', '$modal', '$enterprises','$guid', function ($log, $scope, $rootScope, $modal, $enterprises,$guid) {

    // ================================================
    // PRIVATE METHODS

    $scope.showSpinner = false;
    $scope.spinnerText='Loading Enterprises';
    $scope.enterprises ={};
    var getEnterprisesForCurrentUser = function(user){
        $scope.enterprises.length=0;
        $enterprises.getEnterprises({
            userId: user
        }).then(
            // success
            function(data){
                var response = data.response;
                _.forEach(response,function(obj){
                    
                    if($rootScope.selectedTz == 'tzLocal'){
                        
                        obj.lastConfigSyncDateTime = moment(obj.lastConfigSyncDateTime).utc(obj.lastConfigSyncDateTime).local().format("YYYY-MM-DD HH:mm:ss");
                        obj.lastEventSyncDateTime = moment(obj.lastEventSyncDateTime).utc(obj.lastEventSyncDateTime).local().format("YYYY-MM-DD HH:mm:ss");
                    }
                  
                    if(obj.lastConfigSyncDateTime!==null && obj.lastEventSyncDateTime!==null && typeof(obj.lastConfigSyncDateTime)=='string' && typeof(obj.lastEventSyncDateTime)=='string'){
                        obj.disableEdit=false;
                    }
                    else{
                        obj.disableEdit=true;
                    }
                    if(obj.proxyStatus=='true' || obj.statusEnum == 'Active'){
                        obj.disableDelete=true;
                    }else{
                        obj.disableDelete=false;
                    }
                });
                $scope.enterprises = response;
                $scope.showSpinner=false;
            },
            // error
            function(error){
                $log.error(error);
            }
        );
    };

        /**
         * Update an enterprise
         * @param  {obj} enterprise An enterprise object
         * @return {obj}            The same enterprise object (for chaining)
         */
    var updateEnterprise = function(enterprise){
        $guid.getGuidToken().then(
            // success
            function(data){
                //console.log(response);
                $scope.guidToken= data.response;
                $enterprises.updateEnterprise(enterprise,$scope.guidToken).then(
                    // success
                    function(response){
                        $log.info(response);
                        getEnterprisesForCurrentUser($scope.currentUserId)
                        return enterprise;
                    },
                    // error
                    function(error){
                        $log.error(error);
                        alert("Failed to Save Changes   "+error.statusText);
                        return error;
                    }
                );
            },
            // error
            function(error){
                console.log(error);
                return error;
            });

    };
    
    
    var deleteEnterprise = function(enterprise){
        $guid.getGuidToken().then(
            // success
            function(data){
                $scope.guidToken= data.response;
                $enterprises.deleteEnterprise(enterprise,$scope.guidToken).then(
                    // success
                    function(data){
                        $log.info(data.response);
                        getEnterprisesForCurrentUser($scope.currentUserId)
                        return enterprise;
                    },
                    // error
                    function(error){
                        $log.error(error);
                        alert("Failed to Save Changes  " + error.statusText);
                        return error;
                    }
                );
            },
            // error
            function(error){
                console.log(error);
                return error;
            });
    };

    // ================================================
    // PUBLIC METHODS AND VARS

    $scope.statuses = ['Active', 'Inactive'];

    /**
     * Open the edit enterprise modal. When the modal is dismissed
     * update the enterprise via the $enterprise service.
     * @param  {obj} enterprise An enterprise object
     */
    $scope.editEnterprise = function(enterprise){
        $scope.enterprise = angular.copy(enterprise);
        $scope.thisenterprise = enterprise;
        $scope.modalInstanceEditEnterprise = $modal.open({
            templateUrl: 'assets/views/admin/editEnterprise.html',
            controller: modalInstanceEditEnterpriseCtrl,
            backdrop:'static',
            scope: $scope
        });
        $scope.modalInstanceEditEnterprise.result.then(function () {

        });
    };
    

    /**
     * Open a modal window with the same scope as this controller
     */
    var modalInstanceEditEnterpriseCtrl = function($scope, $modalInstance){

        $scope.ok = function(){
        	var updateEditEnterprise = angular.copy($scope.enterprise);
        	delete updateEditEnterprise.lastConfigSyncDateTime;
        	delete updateEditEnterprise.lastEventSyncDateTime;
            updateEnterprise(updateEditEnterprise);
            $modalInstance.close();
        };

        $scope.delEnterprise = function(){
            $scope.showConfirmation = true;	
        };

        $scope.confirmDelete = function() { 
            deleteEnterprise($scope.enterprise);
            $modalInstance.close();
        };

        $scope.rejectDelete = function() {
            $scope.showConfirmation = false;
        };

        $scope.cancel = function () {
            $scope.enterprise =$scope.thisenterprise;
            $modalInstance.dismiss('cancel');
        };
    };
    
    /**
     * Open a modal window with the same scope as this controller
     */
    var modalInstanceDeleteEnterpriseCtrl = function($scope, $modalInstance){
        $scope.ok = function(){
            deleteEnterprise($scope.enterprise);
            $modalInstance.close();
        };
        $scope.cancel = function () {
            $scope.enterprise =$scope.thisenterprise;
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.mnRefresh = function(){
        //$rootScope.refreshAllAssets();
        $scope.showSpinner=true;

        $scope.refreshInterval=$scope.currentUser.preference.refreshInterval;
        setTimeout($scope.mnRefresh, $scope.refreshInterval * 60000);
        if($scope.currentUserId){
            getEnterprisesForCurrentUser($scope.currentUserId);
        }
    };


    // ================================================
    // INITIALIZE

    // ================================================
    // EVENT LISTENERS

    // Once we have a user, get the asset tree for that user
    $rootScope.$watch('currentUser', function(newVal, oldVal){
      if(newVal){
          $scope.currentUserId=newVal.userId;
          getEnterprisesForCurrentUser(newVal.userId);
      }
    });


  }]
    )});
