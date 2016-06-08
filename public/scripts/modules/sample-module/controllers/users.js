/**
 * Renders all the widgets on the tab and triggers the datasources that are used by the widgets.
 * Customize your widgets by:
 *  - Overriding or extending widget API methods
 *  - Changing widget settings or options
 */
'use strict';

define(['angular', 'controllers-module', 'vruntime'], function(angular, controllers) {

	// Controller definition
	controllers.controller('UsersCtrl', ['$log', '$scope', '$rootScope', '$users', '$modal', '$guid',
	function($log, $scope, $rootScope, $users, $modal, $guid) {

		// ================================================
		// PRIVATE METHODS

		/**
		 * Get the list of user roles and inject it into the scope.
		 */
		$scope.userRoles = {};
		var getUserRoles = function() {
			$scope.userRoles.length = 0;
			$users.getUserRoles().then(
			// success
			function(data) {
				var response = data.response;
				$scope.userRoles = response;
			},
			// error
			function(error) {
				$log.error(error);
			});
		};

		/**
		 * Get the list of users and inject it into the scope
		 */
		$scope.users = {};
		var getUsers = function() {
			$scope.users.length = 0;
			$users.getUsers().then(
			// success
			function(data) {
				var response = data.response;
				$scope.users = response;
			},
			// error
			function(error) {
				$log.error(error);
			});
		};

		/**
		 * Update a user
		 * @param  {obj} user A user object
		 * @return {obj}      The same user object (for chaining)
		 */
		var updateUser = function(user) {
			$guid.getGuidToken().then(
			// success
			function(data) {
				$scope.guidToken = data.response;
				$users.updateUser(user, null, $scope.guidToken).then(
				// success
				function(data) {

					// update the users list.
					getUsers();
					return user;
				},
				// error
				function(error) {
					$rootScope.notify($scope, error.statusText);
					$log.error(error);
					return error;
				});
			},
			// error
			function(error) {
				console.log(error);
				//alert("Failed to Save Changes   "+error.statusText);
				$rootScope.notify($scope, error.statusText);
				return error;
			});
		};

		/**
		 * Update a user with password reset
		 * @param  {obj} user A user object
		 * @return {obj}      The same user object (for chaining)
		 */
		var updateUserWithPasswordReset = function(user, oldPassword) {

			$guid.getGuidToken().then(
			// success
			function(data) {
				$scope.guidToken = data.response;
				$users.updateUser(user, oldPassword, $scope.guidToken).then(
				// success
				function(data) {
					$log.info(data.response);
					// update the users list.
					getUsers();
					return user;
				},
				// error
				function(error) {

					//alert("Failed to Save Changes   "+error.statusText);
					$rootScope.notify($scope, error.statusText);
					$log.error(error);
					return error;
				});
			},
			// error
			function(error) {
				console.log(error);
				//alert("Failed to Save Changes   "+error.statusText);
				$rootScope.notify($scope, error.statusText);
				return error;
			});
		};

		/**
		 * Create a user
		 * @param  {obj} user A user object
		 * @return {obj}      The same user object (for chaining)
		 */
		var createNewUser = function(user) {

			$guid.getGuidToken().then(
			// success
			function(data) {
				$scope.guidToken = data.response;
				$users.createUser(user, $scope.guidToken).then(
				// success
				function(data) {

					$log.info(data.response);
					// update the users list.
					getUsers();
					return user;
				},
				// error
				function(error) {
					$rootScope.notify($scope, error.statusText);
					$log.error(error);
					//alert("Failed to Save Changes   "+error.statusText);

					return error;
				});
			},
			// error
			function(error) {
				console.log(error);
				//alert("Failed to Save Changes   "+error.statusText);
				$rootScope.notify($scope, error.statusText);
				return error;
			});

		};

		// ================================================
		// PUBLIC METHODS

		/**
		 * Open the create user modal. When the modal is dismissed
		 * save the new user via the $user service.
		 */
		$scope.createUser = function() {
			$users.getDefaultUserPreference().then(function(data) {
				$scope.defaultUserPreference = data;

			});
			// clear the user object
			$scope.newUser = {
				customers : []
			};

			$scope.newUser.tempPassword = "";
			$scope.newUser.tempEmail = "";
			$scope.selectedCustomers = $scope.newUser.customers || [];
			$scope.modalInstanceCreateUser = $modal.open({
				templateUrl : 'assets/views/admin/createUser.html',
				controller : createUserModalCtrl,
				backdrop : 'static',
				scope : $scope
			});
			$scope.modalInstanceCreateUser.result.then(function() {
				//console.log($scope.newUser)
			});
		};

		var createUserModalCtrl = function($scope, $modalInstance) {
			$scope.ok = function() {
				//$scope.updateOk =true;
				//console.log($scope.newUser)
				$scope.newUser.password = $scope.newUser.tempPassword;
				$scope.newUser.email = $scope.newUser.tempEmail;
				$scope.newUser.uala = false;
				$scope.newUser.preference = $scope.defaultUserPreference;
				$scope.newUser.customers = $scope.selectedCustomers;
				$scope.newUser.customers.sort();
				$scope.newUser.tempPassword = '';
				$scope.newUser.tempEmail = '';
				delete $scope.newUser.tempPassword;
				delete $scope.newUser.tempEmail;
				//console.log($scope.newUser)
				delete $scope.newUser.confirmPassword;
				createNewUser($scope.newUser);
				$modalInstance.close();
			};
			$scope.cancel = function() {
				// $scope.updateOk =false;
				$scope.newUser = {};
				$scope.users.length = 0;
				getUsers();
				$modalInstance.dismiss('cancel');
			};
		};
		$scope.disableEdit = function(user) {
			if ($rootScope.currentUser.role == "SuperAdministrator") {
				return false;
			} else if ($rootScope.currentUser.userId == user.userId) {
				return false;
			} else if ($rootScope.currentUser.role == "Administrator" && user.role != "SuperAdministrator" && user.role != "Administrator") {
				return false;
			} else {
				return true;
			}
		};
		/**
		 * Open the edit user modal. When the modal is dismissed
		 * update the user via the $user service.
		 * @param  {obj} user A user object
		 */
		$scope.editUser = function(user) {
			$scope.user = user;
			$scope.showDelete = false;
			$scope.disableRoles = false;
			if ($rootScope.currentUser.userId == $scope.user.userId) {
				$scope.showDelete = false;
				$scope.disableRoles = true;
			} else if ($rootScope.currentUser.role == "SuperAdministrator" && $scope.user.role == "SuperAdministrator") {
				$scope.disableRoles = true;
				$scope.showDelete = false;
			} else if ($rootScope.currentUser.role == "SuperAdministrator" && $scope.user.role != "SuperAdministrator") {
				$scope.disableRoles = false;
				$scope.showDelete = true;
			} else if ($rootScope.currentUser.role == "Administrator" && $scope.user.role != "SuperAdministrator" && $scope.user.role != "Administrator") {
				$scope.disableRoles = false;
				$scope.showDelete = true;
			}

			$scope.resetPasswordField = false;
			if ($scope.user.customers)
				$scope.selectedCustomers = $scope.user.customers;
			else
				$scope.selectedCustomers = [];

			$scope.modalInstanceEditUser = $modal.open({
				templateUrl : 'assets/views/admin/editUser.html',
				controller : editUserModalCtrl,
				scope : $scope
			});
			$scope.modalInstanceEditUser.result.then(function() {

			});
		};
		var editUserModalCtrl = function($scope, $modalInstance) {
			$scope.user.newUserId = $scope.user.userId;
			$scope.user.userName = $scope.user.name;
			$scope.user.userEmail = $scope.user.email;
			$scope.user.userRole = $scope.user.role;
			$scope.ok = function() {
				$scope.user.name = $scope.user.userName;
				$scope.user.role = $scope.user.userRole;
				$scope.user.userId = $scope.user.newUserId;
				$scope.user.email = $scope.user.userEmail;
				$scope.user.customers = $scope.selectedCustomers;
				$scope.user.customers.sort();
				$scope.user.password = $scope.user.newPassword;
				delete $scope.user.userName;
				delete $scope.user.userEmail;
				delete $scope.user.newUserId;
				delete $scope.user.userRole;
				delete $scope.user.newPassword;
				delete $scope.user.confirmPassword;
				updateUser($scope.user);

				/*if ($scope.editPswd){
				 $scope.user.password = $scope.user.newPassword;
				 delete $scope.user.newPassword;
				 delete $scope.user.confirmPassword;

				 console.log($scope.user)
				 updateUser($scope.user)
				 }
				 else {
				 $scope.user.password = $scope.user.newPassword;
				 delete $scope.user.newPassword;
				 delete $scope.user.confirmPassword;
				 console.log($scope.user)
				 updateUserWithPasswordReset($scope.user, null);
				 }*/
				$modalInstance.close();
			};
			$scope.cancel = function() {
				$scope.users.length = 0;
				getUsers();
				$modalInstance.dismiss('cancel');
			};
			//$scope.editPswd =false;
			$scope.editPswd = false;
			$scope.setEditPswd = function() {
				delete $scope.user.newPassword;
				delete $scope.user.confirmPassword;
				$scope.editPswd = !$scope.editPswd;
			};

			$scope.deleteUser = function(user) {
				if (window.confirm('Are you sure you want to delete ' + user.name + '?')) {
					$guid.getGuidToken().then(
					// success
					function(data) {
						$scope.guidToken = data.response;
						$users.deleteUser(user, $scope.guidToken).then(
						// successuser
						// close the modal
						// $modalInstance.dismiss('cancel');
						function(response) {
							// kill the user attribute
							//debugger;

							if (response.data.response == true) {
								$modalInstance.close();
								$scope.user = null;
								$log.info('deleted user', user, response);
								// update the users list.
								getUsers();
							}

						},
						// error
						function(error) {
							$rootScope.notify($scope, error.statusText);
							$log.error(error);
						});
					},
					// error
					function(error) {
						console.log(error);
						return error;
					});
				} else {
					// Do nothing, the modal will stay open.
				}
			};
		};

		$scope.selectedCustomers = [];
		$scope.sync = function(bool, item) {
			if (bool) {
				// add item
				$scope.selectedCustomers.push(item);
			} else {
				// remove item
				for (var i = 0; i < $scope.selectedCustomers.length; i++) {
					if ($scope.selectedCustomers[i].key == item.key) {
						$scope.selectedCustomers.splice(i, 1);
					}
				}
			}
		};
		$scope.isChecked = function(key) {
			var match = false;
			for (var i = 0; i < $scope.selectedCustomers.length; i++) {
				if ($scope.selectedCustomers[i].key == key) {
					match = true;
				}
			}
			return match;
		};
		/**
		 * Given a role id, return the name of the role.
		 * @param  {string} id The role ID
		 * @return {string}    The role name
		 */
		$scope.getRoleName = function(id) {
			if ($scope.userRoles && id) {
				var role = _.find($scope.userRoles, function(r) {
					return r.id === id;
				});
				return role.name;
			} else {
				return null;
			}
		};

		/**
		 * Open a modal window with the same scope as this controller
		 * @param  {string}   type The modal type. This should match the filename (without the extension)
		 *                         for the partials in /views/admin/, ie 'createUser', 'createEnterprise', etc.
		 * @param  {Function} cb   A callback function to be executed when the modal is dismissed
		 * @return {Function}      The callback
		 */
		$scope.openModal = function(type, cb) {
			$scope.modalInstance = $modal.open({
				templateUrl : 'assets/views/admin/' + type + '.html',
				scope : $scope
			});
			// when modal dismissed, this function fires
			$scope.modalInstance.result.then(function() {
				return cb();
			});
		};

		// ================================================
		// INITIALIZE

		getUsers();
		getUserRoles();

		// ================================================
		// EVENT LISTENERS

		$rootScope.$watch('customer', function(newVal, oldVal) {
			if (newVal && newVal.customers) {
				$scope.availableCustomers = newVal.customers;
			}
		});

	}]);

});
