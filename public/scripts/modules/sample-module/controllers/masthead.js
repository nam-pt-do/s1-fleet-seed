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
], function (angular, controllers) {

    // Controller definition
    controllers.controller('MastheadCtrl', ['$rootScope', '$scope', '$location', '$log', 'UserSelections', '$modal', '$users', 'api', '$guid','toastr',
            function ($rootScope, $scope, $location, $log, UserSelections, $modal, $users, api, $guid,toastr) {

                //toastr.error('Toastr Trial Failing Services Message - This pop-up will persist until you click on it', 'Error on Fleet');


                /**
                 * RESPONSIVE LAYOUT
                 */
                var updateUser = function (user) {
                    $guid.getGuidToken().then(
                        // success
                        function (data) {
                            //debugger;
                            $scope.guidToken = data.response;
                            $users.updateUser(user, null, $scope.guidToken).then(
                                // success
                                function (response) {
                                    $log.info(response);
                                    // update the users list.
                                    return user;
                                },
                                // error
                                function (error) {
                                    $log.error(error);
                                    alert("Failed to Save Changes  " + error.statusText);
                                    return error;
                                }
                            );
                        },
                        // error
                        function (error) {
                            alert("Failed to Save Changes   " + error.statusText);
                            console.log(error);
                            return error;
                        });
                };

                //$scope.authMode = 'SSO';
                /**
                 * Update a user with password reset
                 * @param  {obj} user A user object
                 * @return {obj}      The same user object (for chaining)
                 */
                var updateUserWithPasswordReset = function (user, oldPassword) {

                    $guid.getGuidToken().then(
                        // success
                        function (data) {
                            $scope.guidToken = data.response;
                            $users.updateUser(user, oldPassword, $scope.guidToken).then(
                                // success
                                function (data) {
                                    $log.info(data.response);
                                    if (!data.response.userId)
                                        alert("Changes could not be saved, please try again. The username or password is incorrect.");
                                    // update the users list.
                                    else
                                        return user;
                                },
                                // error
                                function (error) {
                                    $log.error(error);
                                    alert("Failed to Save Changes   " + error.statusText);
                                    return error;
                                }
                            );
                        },
                        // error
                        function (error) {
                            console.log(error);
                            alert("Failed to Save Changes   " + error.statusText);
                            return error;
                        });
                };

                var aboutModalCtrl = function ($scope, $modalInstance) {
                    $scope.fleetVersion = $rootScope.fleetVersion;
                    $scope.close = function () {
                        $modalInstance.close();
                    };
                };

                var userProfileModalCtrl = function ($scope, $modalInstance) {
                    $scope.user.userName = $scope.user.name;
                    $scope.user.userEmail = $scope.user.email;
                    $scope.ok = function () {
                        $scope.user.name = $scope.user.userName;
                        $scope.user.email = $scope.user.userEmail;
                        delete $scope.user.userName;
                        delete $scope.user.userEmail;
                        if (!$scope.user.newPassword || !$scope.editPswd) {
                            delete $scope.user.newPassword;
                            delete $scope.user.oldPassword;
                            delete $scope.user.confirmPassword;
                            //console.log($scope.user)
                            updateUser($scope.user)
                        }
                        else {
                            $scope.user.password = $scope.user.newPassword;
                            var oldPassword = $scope.user.oldPassword;
                            delete $scope.user.newPassword;
                            delete $scope.user.oldPassword;
                            delete $scope.user.confirmPassword;
                            updateUserWithPasswordReset($scope.user, oldPassword);
                        }
                        $modalInstance.close();
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };

                    $scope.editPswd = false;
                    $scope.setEditPswd = function () {
                        $scope.editPswd = !$scope.editPswd;
                        delete $scope.user.newPassword;
                        delete $scope.user.oldPassword;
                        delete $scope.user.confirmPassword;
                    };
                };

                var eulaModalInstanceCtrl = function ($scope, $modalInstance) {
                    $scope.ok = function () {
                        $scope.eulaOptionSelected = true;
                        $scope.user.uala = true;
                        UserSelections.setEULA($scope.eulaOptionSelected);
                        $modalInstance.close();
                    };
                    $scope.cancel = function () {
                        $scope.eulaOptionSelected = false;
                        $scope.logout();
                        $modalInstance.dismiss('cancel');
                    };
                };


                /**
                 * APPLICATION NAME
                 *
                 * This attribute contains the name of the application and is
                 * used in the masthead text next to the GE meatball.
                 * @type {String}
                 */
                $scope.appName = 'System 1 Fleet Management';


                /**
                 * Given a severity ID this function returns a human-readable
                 * serverity string. It's used for the wording of the label
                 * on an alert badge.
                 * @param  {int} severityId
                 * @return {string}
                 */
                $scope.severityLabelString = function (severityId) {
                    switch (severityId) {
                        case 0:
                            return 'Info';
                        case 1:
                            return 'OK';
                        case 2:
                            return 'Moderate';
                        case 3:
                            return 'Urgent';
                    }
                };


                $scope.authMode = api.authMode;


                $scope.navbarIsHidden = true;

                $scope.toggleNavbarVisibility = function () {
                    $scope.navbarIsHidden = !$scope.navbarIsHidden;
                };

                $scope.aboutFleet = function () {
                    $scope.modalInstanceUser = $modal.open({
                        templateUrl: 'assets/views/admin/about.html',
                        controller: aboutModalCtrl,
                        scope: $scope
                    });
                    // when modal dismissed, this function fires
                    $scope.modalInstanceUser.result.then(function () {

                    });
                };



                $scope.setUserProfile = function (user) {
                    $scope.user = user;
                    $scope.modalInstanceUser = $modal.open({
                        templateUrl: 'assets/views/admin/userProfile.html',
                        controller: userProfileModalCtrl,
                        scope: $scope
                    });
                    // when modal dismissed, this function fires
                    $scope.modalInstanceUser.result.then(function () {

                    });
                };

                $scope.logout = function () {
                    var baseUrl = window.location.origin;
                    var logoffUrl = baseUrl + "/logout";
                    window.location.assign(logoffUrl)
                };
                $rootScope.loadEULA = function (user) {
                    $scope.user = user;
                    if (!$scope.user.uala || $scope.user.uala == false || UserSelections.getEULA() == false) {
                        $scope.eulaOptionSelected = false;
                        $scope.openEulaModal('eula', function () {
                        });
                    }
                };
                $scope.openEulaModal = function (type, cb) {
                    $scope.modalInstanceEula = $modal.open({
                        templateUrl: 'assets/views/admin/' + type + '.html',
                        scope: $scope,
                        backdrop: 'static',
                        keyboard: false,
                        //backdropClass:eulaBackdrop,
                        controller: eulaModalInstanceCtrl
                    });
                    // when modal dismissed, this function fires
                    $scope.modalInstanceEula.result.then(function () {
                        updateUser($scope.user);
                    });
                };


            }]
    )
});
