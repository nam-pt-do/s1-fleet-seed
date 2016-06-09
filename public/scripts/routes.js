/**
 * Router Config
 * This is the router definition that defines all application routes.
 */
define(['angular', 'angular-ui-router'], function(angular) {
    'use strict';
    return angular.module('app.routes', ['ui.router']).config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {

        //Turn on or off HTML5 mode which uses the # hash
        $locationProvider.html5Mode(true).hashPrefix('!');

        /**
         * Router paths
         * This is where the name of the route is matched to the controller and view template.
         */
        $stateProvider
        	
			.state('secure', {
							template: '<ui-view>',
							abstract: true,
							resolve: {
								userInfo: ['$users', function ($users) {
									return $users.resolveUserInfo();
								}]
							}
						})
			
            /*
            .state('secure', {
                            template: '<ui-view/>',
                            abstract: true,
                            resolve: {
                                authenticated: ['$q', 'PredixUserService','$users', function ($q, predixUserService,$users) {
                                    console.log($users);
                                    var deferred = $q.defer();
                                    predixUserService.isAuthenticated().then(function(userInfo){
                                        deferred.resolve(userInfo);
                                    }, function(){
                                        deferred.reject({code: 'UNAUTHORIZED'});
                                    });
                                    return deferred.promise;
                                }]
                            }
                        })*/
            
            .state('assets', {
                parent: 'secure',
                url: '/assets',
                templateUrl: 'views/dashboard.html',
                controller: 'DashboardCtrl'
            })
            .state('assets.overview', {
                url: '/overview',
                parent : 'assets',
                templateUrl: 'views/overview/overview.html',
                controller: 'DetailCtrl'

            })
            .state('timeseries', {
                url: '/timeseries',
                parent : 'secure',
                templateUrl: 'views/overview/timeseries.html',
                controller: 'TimeSeriesCtrl'
            })            
            .state('timeseries_px', {
                url: '/timeseries_px',
                parent : 'secure',
                templateUrl: 'views/overview/s1-ts.html'
            })            
            ;


        $urlRouterProvider.otherwise(function ($injector) {
            var $state = $injector.get('$state');
            document.querySelector('px-app-nav').markSelected('/assets');
            $state.go('assets.overview');
        });

    }]);
});
