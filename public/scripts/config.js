/* global requirejs, define */
/* jshint camelcase: false */
/* jshint unused: false */

'use strict';
/**
* This file sets up the basic module libraries you'll need
* for your application.
*/
requirejs.onError = function(err) {
    //console.log(err.requireType);
    if (err.requireType === 'timeout') {
        //console.error('modules: ' + err.requireModules);
    }
    throw err;
};
/**
* RequireJS Config
* This is configuration for the entire application.
*/
require.config({
    enforceDefine: false,
    xhtml: false,
    //Cache buster
    //urlArgs : '_=' + Date.now(),
    waitSeconds: 15,
    config: {
        text: {
            env: 'xhr'
        }
    },
    paths: {
        'bower_components': '../bower_components',
        'px-datasource': '../bower_components/px-datasource/dist/px-datasource.min',

        'ng-bind-polymer': '../bower_components/ng-bind-polymer/ng-bind-polymer',

        // Named References
        vruntime: '../bower_components/vruntime/dist/vruntime-min',
        config: './config',
        app: './app',
		'controllers-module': 'modules/sample-module/controllers/module',
        'directives-module': 'modules/sample-module/directives/module',
        'filters-module': 'modules/sample-module/filters/module',
        'services-module': 'modules/sample-module/services/module',
        // angularjs + modules
        angular: '../bower_components/angular/angular',
        'angular-mocks': '../bower_components/angular-mocks/angular-mocks',
        'angular-resource': '../bower_components/angular-resource/angular-resource',
        'angular-route': '../bower_components/angular-route/angular-route',

        // angular ui router
        'angular-ui-router': '../bower_components/angular-ui-router/release/angular-ui-router.min',
		'ui-bootstrap':'../bower_components/angular-bootstrap/ui-bootstrap',
        'ui-bootstrap-tpls':'../bower_components/angular-bootstrap/ui-bootstrap-tpls',
        // Require JS Plugins
        text: '../bower_components/requirejs-plugins/lib/text',
        order: '../bower_components/requirejs-plugins/src/order',
        async: '../bower_components/requirejs-plugins/src/async',
        depend: '../bower_components/requirejs-plugins/src/depend',
        font: '../bower_components/requirejs-plugins/src/font',
        goog: '../bower_components/requirejs-plugins/src/goog',
        image: '../bower_components/requirejs-plugins/src/image',
        json: '../bower_components/requirejs-plugins/src/json',
        mdown: '../bower_components/requirejs-plugins/src/mdown',
        noext: '../bower_components/requirejs-plugins/src/noext',
        propertyParser: '../bower_components/requirejs-plugins/src/propertyParser',
        Markdown: '../bower_components/requirejs-plugins/lib/Markdown.Converter',
        css: '../bower_components/require-css/css',
        'css-builder': '../bower_components/require-css/css-builder',
        'normalize': '../bower_components/require-css/normalize',

        lodash: '../bower_components/lodash/dist/lodash.min',
        jquery: '../bower_components/jquery/dist/jquery.min',
        
        /*Legacy dependencies*/
       'bootstrap': '../bower_components/iids/dist/iidx/components/bootstrap/js',
        

        // IIDx additions
        'accordion' : '../bower_components/iids/dist/iidx/components/ge-bootstrap/js/ge-bootstrap/accordion',
        'bootstrap-affix' : '../bower_components/iids/dist/iidx/components/bootstrap/js/bootstrap-affix',
        'bootstrap-alert' : '../bower_components/iids/dist/iidx/components/bootstrap/js/bootstrap-alert',
        'bootstrap-button' : '../bower_components/iids/dist/iidx/components/bootstrap/js/bootstrap-button',
        'bootstrap-carousel' : '../bower_components/iids/dist/iidx/components/bootstrap/js/bootstrap-carousel',
        'bootstrap-collapse' : '../bower_components/iids/dist/iidx/components/bootstrap/js/bootstrap-collapse',
        'bootstrap-dropdown' : '../bower_components/iids/dist/iidx/components/bootstrap/js/bootstrap-dropdown',
        'bootstrap-modal' : '../bower_components/iids/dist/iidx/components/bootstrap/js/bootstrap-modal',
        'bootstrap-popover' : '../bower_components/iids/dist/iidx/components/bootstrap/js/bootstrap-popover',
        'bootstrap-scrollspy' : '../bower_components/iids/dist/iidx/components/bootstrap/js/bootstrap-scrollspy',
        'bootstrap-tab' : '../bower_components/iids/dist/iidx/components/bootstrap/js/bootstrap-tab',
        'bootstrap-tooltip' : '../bower_components/iids/dist/iidx/components/bootstrap/js/bootstrap-tooltip',
        'bootstrap-transition' : '../bower_components/iids/dist/iidx/components/bootstrap/js/bootstrap-transition',
        'bootstrap-typeahead' : '../bower_components/iids/dist/iidx/components/bootstrap/js/bootstrap-typeahead',

        'bar-declarative-visualizations' : '../bower_components/iids/dist/iidx/components/declarative-visualizations/js/declarative-visualizations/bar',
        'donut-declarative-visualizations' : '../bower_components/iids/dist/iidx/components/declarative-visualizations/js/declarative-visualizations/donut',
        'guagedeclarative-visualizations' : '../bower_components/iids/dist/iidx/components/declarative-visualizations/js/declarative-visualizations/gauge',
        'spiderweb-declarative-visualizations' : '../bower_components/iids/dist/iidx/components/declarative-visualizations/js/declarative-visualizations/spiderweb',
        'sortable' : '../bower_components/iids/dist/iidx/components/jqueryui-sortable-amd/js/jquery-ui-1.10.2.custom',
       brandkit: '../bower_components/iids/dist/iidx/components/brandkit/js/brandkit',
       charts: '../bower_components/iids/dist/iidx/components/charts/js/charts',
       'charts-theme': '../bower_components/iids/dist/iidx/components/charts/js/charts/theme',
       'moment': '../bower_components/iids/dist/iidx/components/momentjs/min/moment.min',
       	highcharts: '../bower_components/highcharts/lib/highcharts.src',
        highstock: '../bower_components/highcharts/lib/highstock.src',
        'exportchart': '../bower_components/highcharts/lib/modules/exporting.src',
        // Invididual chart modules so we don't load all the charts at once
        'area-chart' : '../bower_components/iids/dist/iidx/components/charts/js/charts/area',
        'area-stacked-chart' : '../bower_components/iids/dist/iidx/components/charts/js/charts/area-stacked',
        'bar-chart' : '../bower_components/iids/dist/iidx/components/charts/js/charts/bar',
        'bar-stacked-chart' : '../bower_components/iids/dist/iidx/components/charts/js/charts/bar-stacked',
        'column-chart' : '../bower_components/iids/dist/iidx/components/charts/js/charts/column',
        'column-stacked-chart' : '../bower_components/iids/dist/iidx/components/charts/js/charts/column-stacked',
        'donut-chart' : '../bower_components/iids/dist/iidx/components/charts/js/charts/donut',
        'line-chart' : '../bower_components/iids/dist/iidx/components/charts/js/charts/line',
        'pie-chart' : '../bower_components/iids/dist/iidx/components/charts/js/charts/pie',
        'scatter-chart' : '../bower_components/iids/dist/iidx/components/charts/js/charts/scatter',
        'spiderweb-chart' : '../bower_components/iids/dist/iidx/components/charts/js/charts/spiderweb',
        'spiderweb-comparison-chart' : '../bower_components/iids/dist/iidx/components/charts/js/charts/spiderweb-comparison',
        'spiderweb-tiny-chart' : '../bower_components/iids/dist/iidx/components/charts/js/charts/spiderweb-tiny',
        'stock-chart' : '../bower_components/iids/dist/iidx/components/charts/js/charts/stock',

        'native-table': '../bower_components/angular-directive-datagrid/dist/native-table',

    },
    priority: [
        'jquery',
        'angular',
        'angular-resource',
        'angular-route',
        'bootstrap'
    ],
    shim: {
    	vruntime: {
            deps: ['jquery', 'angular']
        },
        'angular': {
            deps: ['jquery'],
            exports: 'angular'
        },
        'angular-route': ['angular'],
        'angular-resource': ['angular', 'angular-route', 'angular-ui-router'],
        'angular-sanitize': ['angular'],
        'angular-mocks': {
            deps: ['angular', 'angular-route', 'angular-resource', 'angular-ui-router'],
            exports: 'mock'
        },
        'angular-ui-router': ['angular'],
        'native-table' : ['angular'],
        'directives/v-runtime.directives' : {
    		deps: ['angular']
    	},
        underscore: {
            exports: '_'
        },
        'px-datasource': {
            deps: ['angular', 'lodash']
        },
        'app': {
            deps: ['angular']
        },
        'exportchart' : {
        	deps: ['highstock']
        },
        'bootstrap-transition' : {
            deps : [ 'jquery' ],
            exports : 'bootstrap-transition'
        },
        'bootstrap-affix' : [ 'jquery' ],
        'bootstrap-alert' : [ 'jquery' ],
        'bootstrap-button' : [ 'jquery' ],
        'bootstrap-carousel' : [ 'jquery', 'bootstrap-transition' ],
        'bootstrap-collapse' : [ 'jquery', 'bootstrap-transition' ],
        'bootstrap-dropdown' : [ 'jquery' ],
        'bootstrap-modal' : {
            deps : [ 'jquery', 'bootstrap-transition' ],
            exports : '$.fn.modal'
        },
        'bootstrap-popover' : [ 'jquery', 'bootstrap-tooltip' ],
        'bootstrap-scrollspy' : [ 'jquery' ],
        'bootstrap-tab' : [ 'jquery' ],
        'bootstrap-typeahead' : [ 'jquery' ],
        'bootstrap-tooltip' : {
            deps : [ 'jquery', 'bootstrap-transition' ],
            exports : 'tooltip'
        },
		
        'ui-bootstrap' : {
            deps : ['angular', 'jquery']
        },
        'ui-bootstrap-tpls' : {
            deps : ['angular', 'jquery', 'ui-bootstrap']
        },

    }
});
