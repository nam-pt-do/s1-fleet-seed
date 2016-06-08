/**
 * Load controllers, directives, filters, services before bootstrapping the application.
 * NOTE: These are named references that are defined inside of the config.js RequireJS configuration file.
 */
define([
    'jquery',
    'angular',
    'vruntime',
    'main',
    'modules/sample-module/directives/main',
    'modules/sample-module/filters/main',
    'modules/sample-module/services/main',
    'modules/sample-module/controllers/main',
    'routes',
    'native-table',
    'interceptors',
    'px-datasource',
    'ng-bind-polymer'
], function ($, angular,vRuntime,main,directives,filters,services,controllers,routes,nativeTable,interceptors) {
    'use strict';

    /**
     * Application definition
     * This is where the AngularJS application is defined and all application dependencies declared.
     * @type {module}
     */
    var predixApp = angular.module('predixApp', [
    	'app.controllers', 
        'app.directives', 
        'app.services', 
        'app.filters',
        'app.routes',
        'app.interceptors',
        'ui.bootstrap',
        'datagridModule',
        'sample.module',
        'predix.datasource',
        'px.ngBindPolymer'
    ]);
    
    predixApp.run(['$location', '$rootScope', function($location, $rootScope) {
         
        // Application DataSources are defined here 
        //vRuntime.datasource.create("myDS", "localhost:9090/service/data", {});    
    }]);


    predixApp.value('api', {
            //url and mode will be set by a appInfo service call.
            url: 'https://localhost:9443/service/',
            authMode: 'LOCAL'
        }
    );

    /**
     * Main Controller
     * This controller is the top most level controller that allows for all
     * child controllers to access properties defined on the $rootScope.
     */
    predixApp.controller('MainCtrl', ['$scope','$http', '$rootScope', 'PredixUserService', function ($scope, $http, $rootScope, predixUserService) {

        //Global application object
        window.App = $rootScope.App = {
            version: '1.0',
            name: 'Predix Seed',
            session: {},
            tabs: [
                //{icon: 'fa-tachometer', state: 'dashboards', label: 'Dashboards'},
                {icon: 'fa-tachometer', state: 'assets/overview', label: 'Dashboard'},
                {icon: 'fa-tachometer', state: 'timeseries_px', label: 'Time Series Px'},
                {icon: 'fa-tachometer', state: 'timeseries', label: 'Time Series'
            }
                
                // {icon: 'fa-file-o', state: 'blankpage', label: 'Blank Page', subitems: [
                    // {state: 'blanksubpage', label: 'Blank Sub Page'}
                // ]}
            ]
        };
			$http.get('../stub/defaultPreference.json').success(function (res) {
                $rootScope.defaultPreferences = res;
            });
        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
            if (angular.isObject(error) && angular.isString(error.code)) {
                switch (error.code) {
                    case 'UNAUTHORIZED':
                        //redirect
                        predixUserService.login(toState);
                        break;
                    default:
                        //go to other error state
                }
            }
            else {
                // unexpected error
            }
        });
    }]);


    //Set on window for debugging
    window.predixApp = predixApp;

    //Return the application  object
    return predixApp;
});
