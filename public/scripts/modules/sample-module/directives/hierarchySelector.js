/*global define */
define(['angular', 'directives-module'], function (angular, directives) {
    'use strict';

    /* Directives  */
    directives.directive('hierarchySelector', ['$rootScope', '$state', '$stateParams', '$log', '$timeout', '$assets', 'UserSelections', 'ctxGlobal',
        function ($rootScope, $state, $stateParams, $log, $timeout, $assets, UserSelections, ctxGlobal) {
            return {
                restrict: 'A',
                scope: {
                    callBack: "&"
                },
                templateUrl: 'assets/views/hierarchySelector.html',
                link: function ($scope, element, attrs) {

                    /** Older System 1 Analysis Variables **/
                    var assetArray = [];
                    var allAssetsStatus = [];
                    $scope.showRefreshAlert = false;
                    $scope.showDropDownSpinner = false;
                    $scope.filteredSystemAsset = [];
                    $scope.filteredSmartAsset = [];
                    $scope.resetToCustomer = false;
                    $scope.matchStatePartial = $rootScope.matchStatePartial;
                    UserSelections.setGotoAlarmParams({});

                    var mergeAssetsHealth = function (data, health) {
                        var current, v, i;
                        if (data === undefined) {
                            return;
                        }
                        if (!angular.isArray(data)) {
                            data = data.childNodes;
                        }
                        for (i = 0; i < data.length; i++) {
                            current = data[i];
                            if (typeof(current) === 'object') {
                                // console.log('current',current, nodeId);
                                if (current) {
                                    for (v = 0; v < health.length; v++) {
                                        if (current.enterpriseId == health[v].enterpriseId && current.id === health[v].id) {
                                            current.highestNormalizedSevLevel = health[v].highestNormalizedSevLevel;
                                            current.ipNoData = health[v].imNoDataSev2 + health[v].ipNoDataSev2;
                                            if (health[v].nodeName)
                                                current.name = health[v].nodeName;
                                            if (( current.enterpriseId == $scope.enterpriseId ) && (current.id == $scope.nodeId || _.contains($scope.selectedNodePath, current.name) || _.contains($scope.selectedNodePath, current.id) || _.contains($scope.selectedNodePath, current.displayName)))
                                                current.collapsed = false;
                                            else current.collapsed = true;
                                        }
                                    }
                                }
                                mergeAssetsHealth(current, health);
                            }
                        }
                    };

                    var getAssetTree = function (options) {
                        $scope.showDropDownSpinner = true;
                        $assets.getHierarchy(options).then(
                            // success
                            function (response) {
                                assetArray.length = 0;
                                _.forEach(response, function (obj) {
                                    assetArray.push(obj)
                                });
                                getAssetStatus(options, assetArray);
                            },
                            // error
                            function (error) {
                                $log.error(error);
                            }
                        );
                    };

                    var recurse = function (data, nodeId) {
                        var current;
                        for (var key in data) {
                            current = data[key];
                            if (typeof(current) === 'object') {
                                if (current) {
                                    current.id === nodeId ? current.selected = true : current.selected = undefined;
                                    if (( current.enterpriseId == $scope.enterpriseId )
                                        && (current.id == $scope.nodeId
                                        || _.contains($scope.selectedNodePath, current.name)
                                        || _.contains($scope.selectedNodePath, current.id)
                                        || _.contains($scope.selectedNodePath, current.displayName)))
                                        current.collapsed = false;
                                    else {
                                        current.collapsed = true;
                                    }
                                }
                                recurse(current);
                            }
                        }
                    };

                    var getAssetStatus = function (options, assets) {
                        $scope.showDropDownSpinner = true;
                        $assets.getStatus({
                            customerId: $scope.customerId,
                            enterpriseId: $scope.enterpriseId,
                            nodeId: $scope.nodeId
                        }).then(
                            // success
                            function (response) {
                                allAssetsStatus.length = 0;
                                _.forEach(response, function (obj) {
                                    allAssetsStatus.push(obj);
                                });
                                UserSelections.saveAssetArr(allAssetsStatus);
                                mergeAssetsHealth(assets, allAssetsStatus);
                                $scope.assets = assets;
                                $scope.showDropDownSpinner = false;
                                UserSelections.setAssetArray($scope.assets);
                                ctxGlobal.assets = assets;
                                $scope.getfilteredAssets();
                            },
                            // error
                            function (error) {
                                $log.error(error);
                                $scope.showDropDownSpinner = false;
                            }
                        );
                    };

                    $scope.getfilteredAssets = function (arr, val, primarySystem) {

                        var tmpSysArr = [],
                            tmpSmartArr = [],
                            i;

                        for (i = 0; i < $scope.assets.length; i++) {
                            if ($scope.assets[i].sourceSystemEnum === "System1") {
                                tmpSysArr.push($scope.assets[i])
                            }
                            else {
                                tmpSmartArr.push($scope.assets[i]);
                            }
                        }

                        $scope.filteredSystemAsset = tmpSysArr;
                        $scope.filteredSmartAsset = tmpSmartArr;
                    };

                    $scope.selectNode = function () {
                        $("#fleet").removeClass('active');
                        setOpenAssetPath();
                    };

                    var setOpenAssetPath = function () {
                        $timeout(function () {
                            var path = [];
                            _.each($('.assetHierarchy .selected').parents('li'), function (node) {
                                $(node).collapsed = false;
                                path.unshift($(node).data('id'));
                            });
                        }, 0);
                    };

                    $scope.resetCustomerSelection = function (customerId) {
                        $scope.resetToCustomer = true;
                        $scope.customerId = customerId;
                        UserSelections.setSelectedCustomer(customerId);
                        delete $scope.selectedNode;
                        $scope.selectedNodeName = customerId;
                        delete $scope.enterpriseId;
                        delete $scope.nodeId;
                        delete $scope.selectedNodePath;
                        $scope.nodeSeverity = -1;
                        $scope.nodeNoDatapoints = 0;
                        $scope.nodeSelectedType = '';
                        recurse($scope.assets, '');
                    };

                    $scope.assetByType = function (assetType) {
                        switch (assetType) {
                            case 'System1':
                                $scope.primeHierarchy = 'System 1';
                                $scope.nextHierarchy = 'SmartSignal';
                                $scope.assetNotByType = "SmartSignal";
                                break;
                            case "SmartSignal":
                                $scope.primeHierarchy = 'SmartSignal';
                                $scope.nextHierarchy = 'System 1';
                                $scope.assetNotByType = 'System1'
                        }
                    };

                    // DetailCtrl sets $rootScope.nodeId, which we inherit here.
                    // Let's take care of nodeId-based nav here, so we don't have
                    // to worry about that in DetailCtrl.

                    $scope.$watchCollection('[enterpriseId, nodeId]', function (newVal, oldVal) {
                        if (newVal !== oldVal) {

                            var options = {
                                "customerId": $scope.customerId,
                                "enterpriseId": $scope.enterpriseId,
                                "nodeSelectedType": $scope.nodeSelectedType,
                                "nodeId": newVal[1]
                            };

                            $scope.nodeId = newVal[1];
                           // $rootScope.refreshAllAssets();
                            $scope.resetToCustomer = false;

                            $scope.selectedNode = $scope.nodeId;

                            ctxGlobal.setCustomerId($scope.customerId);
                            ctxGlobal.setEnterpriseId($scope.enterpriseId);
                            ctxGlobal.setNodeId($scope.nodeId);

                            $scope.callBack()(options);
                        }
                    });

                    $scope.init = function () {
                        $scope.customerId = $stateParams.customerId || UserSelections.getSelectedCustomer() || null;
                        UserSelections.setSelectedCustomer($scope.customerId);
                        ctxGlobal.setCustomerId($scope.customerId);
                        $scope.fleetId = 'default';
                        $rootScope.findCustomer($rootScope.currentUser);

                        // ================================================
                        // EVENT LISTENERS
                        // Once we have a user, get the asset tree for that user
                        // ======================================================
                        if (ctxGlobal.assets === undefined) {
                            // If the customerId isn't in the state/scope, get it from the user prefs.
                            // If it's not in either, just use the first one in the list
                            ctxGlobal.assets = [];
                            UserSelections.setCurrentUser($rootScope.currentUser);

                            getAssetTree({
                                customerId: $scope.customerId,
                                enterpriseId: $scope.enterpriseId,
                                nodeId: $scope.nodeId
                            });
                        }
                        else if (ctxGlobal.assets.length > 0) {

                            var option = {
                                customerId: $scope.customerId,
                                enterpriseId: $scope.enterpriseId,
                                nodeId: $scope.nodeId
                            };

                            var assetArray = ctxGlobal.assets;

                            getAssetStatus(option, assetArray);
                            $scope.resetCustomerSelection($scope.customerId);
                        }

                        $scope.assetType = UserSelections.getHierarchyOption() != "SmartSignal" ? "System1" : "SmartSignal";
                        $scope.assetByType($scope.assetType);
                        $scope.currentUser = $rootScope.currentUser;
                    };
                    $scope.init();
                }
            };
        }])
    return directives;
});