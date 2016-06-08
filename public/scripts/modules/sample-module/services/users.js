/** This service contains methods for retrieving the currently logged-in user
 * and managing existing users.
 */
'use strict';
define(['angular', 'services-module'], function(angular, services) {

	services.service('$users', ['$log', '$http', 'api', '$rootScope', '$q', 'ctxGlobal', 'UserSelections', 'PredixUserService',
	function($log, $http, api, $rootScope, $q, ctxGlobal, UserSelections, predixUserService) {

		return {
			/**
			 * GET the current user
			 * @return {object}      Response
			 */
			getCurrentUser : function() {
				var dt = new Date();
				var defaultPrefs;

				$http.get('/stub/defaultPreference.json').success(function(res) {
					defaultPrefs = res;
				});
				predixUserService.isAuthenticated().then(function(userInfo) {

					//debugger;
					/*
					 var data = response.data.response;
					 if (data.preference) {
					 var toStrng = data.preference;
					 data.preference = JSON.parse(toStrng);
					 } else if (defaultPrefs) {
					 data.preference = defaultPrefs;
					 }*/
					defaultPrefs = preferences;
					if (data.preference) {
						var toStrng = data.preference;
						data.preference = JSON.parse(toStrng);
					} else if (defaultPrefs) {
						data.preference = defaultPrefs;
					}
					return data;
				}, function() {
					deferred.reject({
						code : 'UNAUTHORIZED'
					});
				});
			},
			/**
			 * Get application environment information
			 * @return {object}      Response
			 */
			/**
			 * Get application environment information
			 * @return {object}      Response
			 */
			getAppInfo : function() {
				return $http({
					url : '/appInfo',
					headers : {},
					method : 'GET'
				}).then(function(response) {
					return response.data;
				});
			},
			/**
			 * Get the list of available user roles
			 * @return {object}      Response
			 */
			getUserRoles : function(options) {
				//debugger;
				return $http({
					url : '/api/v2/proxy',
					headers : {
						'Service-End-Point' : api.url + 'fmsuserservice/role'
					},
					method : 'GET'
				}).then(function(response) {
					return response.data;
				});
			},
			/**
			 * GET the list of users
			 * @return {object}      Response
			 */
			getUsers : function(options) {
				var dt = new Date();
				return $http({
					// url: 'stub/users.json',
					url : '/api/v2/proxy' + "?ts=" + dt.getTime(),
					headers : {
						'Service-End-Point' : api.url + 'fmsuserservice/user'
					},
					method : 'GET'
				}).then(function(response) {
					return response.data;
				});
			},
			/**
			 * Create a new user
			 * @param  {object} user A user object
			 * @return {response}      The service response.
			 */
			createUser : function(user, token) {
				var dt = new Date();
				return $http({
					url : '/api/v2/proxy' + "?ts=" + dt.getTime(),
					headers : {
						'Service-End-Point' : api.url + 'fmsuserservice/user/token/' + token
					},
					data : user,
					method : 'POST'
				}).then(function(response) {
					if (response.data.preference) {
						response.data.preference = JSON.parse(response.data.preference);
					}

					// parse response and check for ERROR msg
					console.log("server response:");
					console.log("  status: " + response.data.status);
					if (response.data.status === "500") {
						var lines = response.data.response.split("\n", 3);
						// line[0] = generic service error
						// line[1] = message from java code
						// line[1+] = stacktrace
						var errmsg = lines[1];
						alert("Failed service call: " + errmsg);
					}
					return response.data;
				});
			},
			/**
			 * Update an existing user
			 * @param  {object} user A user object
			 * @return {response}      The service response.
			 */
			updateUser : function(user, oldPassword, token) {
				var dt = new Date();
				var epUrl = api.url + 'fmsuserservice/user/' + user.userId;
				if (user.password) {
					user.changePassword = true;
					user.oldPassword = oldPassword;
				}
				if ( typeof (user.preference) == "string") {
					user.preference = JSON.parse(user.preference);
				}
				return $http({
					url : '/api/v2/proxy' + "?ts=" + dt.getTime(),
					headers : {
						'Service-End-Point' : api.url + 'fmsuserservice/user/' + user.userId + '/token/' + token
					},
					data : user,
					method : 'PUT'
				}).then(function(response) {
					if (response.data.response.preference) {
						response.data.preference = JSON.parse(response.data.response.preference);
					}
					return response.data;
				});
			},
			/**
			 * Delete an existing user
			 * @param  {object} user A user object
			 * @return {response}      The service response.
			 */
			deleteUser : function(user, token) {
				var dt = new Date();
				return $http({
					url : '/api/v2/proxy' + "?ts=" + dt.getTime(),
					headers : {
						'Service-End-Point' : api.url + 'fmsuserservice/user/' + user.userId + '/token/' + token
					},
					method : 'DELETE'
				}).then(function(response) {

					// parse response and check for ERROR msg
					if (response.data.status === "500") {
						var lines = response.data.response.split("\n", 1);
						// line[0] = error
						var errmsg = lines[0];
						alert("Failed service call: " + errmsg);
					}

					return response;
				});
			},

			getDefaultUserPreference : function() {
				return $http({
					url : 'stub/defaultPreference.json',
					method : 'GET'
				}).then(function(response) {
					return response.data;
				});
			},

			/**
			 * Get the existing user
			 */
			resolveUserInfo : function() {

				var deferred = $q.defer();
				var self = this;

				if ($rootScope.currentUser && $rootScope.currentUser.userId) {
					deferred.resolve();
					return;
				}

				this.getAppInfo().then(function(response) {

					api.url = response.serviceURL;
					api.authMode = response.authMode;

					ctxGlobal.setAuthMode(response.authMode);
					// Get the user and inject it into $rootScope
					// so our controllers can pick it up.

					$rootScope.admin = false;
					$rootScope.admin = ['SuperAdministrator', 'Administrator'];
					$rootScope.fleetVersion = response.fleetVersion;

					var checkRole = function() {
						var currentUserRole = UserSelections.getCurrentUser().role;
						var _exist = $rootScope.admin.indexOf(currentUserRole);
						if (_exist > -1) {
							$rootScope.showAdmin = true;
							//setting up Tabs depending on user role
							//App is Global variable defined inside MainCtrl
							App.tabs.push({
								state : 'admin',
								label : 'Administration'
							});
						}
					};

					predixUserService.isAuthenticated().then(
					// success
					function(response) {
						if ( typeof (response) == "string") {
							console.log('Bad response' + response);
							// window.location.replace("http://localhost:9000/#/login");
						} else {
							console.log('After getCurrentUser');
							var defaultPrefs;
							$rootScope.currentUser = response;
							UserSelections.setCurrentUser($rootScope.currentUser);

							//this for testing
							var tempEulaResponse = response.uala;
							if (!tempEulaResponse) {
								//$rootScope.loadEULA($rootScope.currentUser)
							}
							UserSelections.setCurrentUser($rootScope.currentUser);
							if (!$rootScope.currentUser.preference) {
								$rootScope.currentUser.preference = $rootScope.defaultPreferences;
								self.getDefaultUserPreference().then(function(data) {

									//debugger;
									$rootScope.defaultUserPreference = data;
									$rootScope.currentUser.preference = $rootScope.defaultUserPreference;
									UserSelections.setCurrentUserPrefs($rootScope.currentUser.preference);
									UserSelections.setWidgetOptions($rootScope.currentUser.preference.index);
									UserSelections.setHierarchyOption($rootScope.currentUser.preference.hierarchyOption);
									UserSelections.setDashTab($rootScope.currentUser.preference.overviewStyle == 'viewWidget' ? 'dashboard' : 'table');
									UserSelections.setSortType($rootScope.currentUser.preference.widgetSort);
									UserSelections.setGridSort($rootScope.currentUser.preference.overviewGridSort, $rootScope.currentUser.preference.overviewGridSortOrder);
									$rootScope.selectedTz = $rootScope.currentUser.preference.tzOption;
									UserSelections.setTimezone($rootScope.currentUser.preference.tzOption);
									//ctxGlobal.setPlotSelections(UserSelections.getCurrentUser().preference.plotSelections);

								});
							} else {
								UserSelections.setCurrentUserPrefs($rootScope.currentUser.preference);
								UserSelections.setWidgetOptions($rootScope.currentUser.preference.index);
								UserSelections.setHierarchyOption($rootScope.currentUser.preference.hierarchyOption);
								UserSelections.setGridSort($rootScope.currentUser.preference.overviewGridSort, $rootScope.currentUser.preference.overviewGridSortOrder);
								ctxGlobal.setPlotSelections($rootScope.currentUser.preference.plotSelections);
								$rootScope.selectedTz = $rootScope.currentUser.preference.tzOption;
								UserSelections.setTimezone($rootScope.currentUser.preference.tzOption);

							}
							checkRole();
							//debugger;
							deferred.resolve();
						}
					},
					// error
					function(error) {
						deferred.reject({code: 'UNAUTHORIZED'});
						$log.error(error);
					});
				},
				// error
				function(error) {
					console.log("Failed to get the environment info. App startup failed.");
					$log.error(error);
				});
				return deferred.promise;
			}
		};

	}]);
});
