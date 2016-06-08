
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
    controllers.controller('HelpCtrl', ['$log', '$scope', '$users', function ($log, $scope, $users) {


        // ================================================
        // PRIVATE METHODS & VARS

        // ================================================
        // PUBLIC METHODS & VARS

        $scope.restoreSettings = function(){
            // TODO
        };


        // ================================================
        // INITIALIZE

        // ================================================
        // EVENT LISTENERS

    }]
    )});