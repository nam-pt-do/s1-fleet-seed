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
        vruntime: '../components/vruntime/dist/vruntime-min',
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
		'ui-bootstrap':'../components/angular-bootstrap/ui-bootstrap',
        'ui-bootstrap-tpls':'../components/angular-bootstrap/ui-bootstrap-tpls',
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
       'bootstrap': '../components/iids/dist/iidx/components/bootstrap/js',
        

        // IIDx additions
        'accordion' : '../components/iids/dist/iidx/components/ge-bootstrap/js/ge-bootstrap/accordion',
        'bootstrap-affix' : '../components/iids/dist/iidx/components/bootstrap/js/bootstrap-affix',
        'bootstrap-alert' : '../components/iids/dist/iidx/components/bootstrap/js/bootstrap-alert',
        'bootstrap-button' : '../components/iids/dist/iidx/components/bootstrap/js/bootstrap-button',
        'bootstrap-carousel' : '../components/iids/dist/iidx/components/bootstrap/js/bootstrap-carousel',
        'bootstrap-collapse' : '../components/iids/dist/iidx/components/bootstrap/js/bootstrap-collapse',
        'bootstrap-dropdown' : '../components/iids/dist/iidx/components/bootstrap/js/bootstrap-dropdown',
        'bootstrap-modal' : '../components/iids/dist/iidx/components/bootstrap/js/bootstrap-modal',
        'bootstrap-popover' : '../components/iids/dist/iidx/components/bootstrap/js/bootstrap-popover',
        'bootstrap-scrollspy' : '../components/iids/dist/iidx/components/bootstrap/js/bootstrap-scrollspy',
        'bootstrap-tab' : '../components/iids/dist/iidx/components/bootstrap/js/bootstrap-tab',
        'bootstrap-tooltip' : '../components/iids/dist/iidx/components/bootstrap/js/bootstrap-tooltip',
        'bootstrap-transition' : '../components/iids/dist/iidx/components/bootstrap/js/bootstrap-transition',
        'bootstrap-typeahead' : '../components/iids/dist/iidx/components/bootstrap/js/bootstrap-typeahead',

        'bar-declarative-visualizations' : '../components/iids/dist/iidx/components/declarative-visualizations/js/declarative-visualizations/bar',
        'donut-declarative-visualizations' : '../components/iids/dist/iidx/components/declarative-visualizations/js/declarative-visualizations/donut',
        'guagedeclarative-visualizations' : '../components/iids/dist/iidx/components/declarative-visualizations/js/declarative-visualizations/gauge',
        'spiderweb-declarative-visualizations' : '../components/iids/dist/iidx/components/declarative-visualizations/js/declarative-visualizations/spiderweb',
        'sortable' : '../components/iids/dist/iidx/components/jqueryui-sortable-amd/js/jquery-ui-1.10.2.custom',
       brandkit: '../components/iids/dist/iidx/components/brandkit/js/brandkit',
       charts: '../components/iids/dist/iidx/components/charts/js/charts',
       'charts-theme': '../components/iids/dist/iidx/components/charts/js/charts/theme',
       'moment': '../components/iids/dist/iidx/components/momentjs/min/moment.min',
       	highcharts: '../components/highcharts/lib/highcharts.src',
        highstock: '../components/highcharts/lib/highstock.src',
        'exportchart': '../components/highcharts/lib/modules/exporting.src',
        // Invididual chart modules so we don't load all the charts at once
        'area-chart' : '../components/iids/dist/iidx/components/charts/js/charts/area',
        'area-stacked-chart' : '../components/iids/dist/iidx/components/charts/js/charts/area-stacked',
        'bar-chart' : '../components/iids/dist/iidx/components/charts/js/charts/bar',
        'bar-stacked-chart' : '../components/iids/dist/iidx/components/charts/js/charts/bar-stacked',
        'column-chart' : '../components/iids/dist/iidx/components/charts/js/charts/column',
        'column-stacked-chart' : '../components/iids/dist/iidx/components/charts/js/charts/column-stacked',
        'donut-chart' : '../components/iids/dist/iidx/components/charts/js/charts/donut',
        'line-chart' : '../components/iids/dist/iidx/components/charts/js/charts/line',
        'pie-chart' : '../components/iids/dist/iidx/components/charts/js/charts/pie',
        'scatter-chart' : '../components/iids/dist/iidx/components/charts/js/charts/scatter',
        'spiderweb-chart' : '../components/iids/dist/iidx/components/charts/js/charts/spiderweb',
        'spiderweb-comparison-chart' : '../components/iids/dist/iidx/components/charts/js/charts/spiderweb-comparison',
        'spiderweb-tiny-chart' : '../components/iids/dist/iidx/components/charts/js/charts/spiderweb-tiny',
        'stock-chart' : '../components/iids/dist/iidx/components/charts/js/charts/stock',

        'native-table': '../components/angular-directive-datagrid/dist/native-table',

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
