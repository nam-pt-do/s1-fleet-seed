
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
    controllers.controller('AdminCtrl', ['$scope','UserSelections',function ($scope,UserSelections) {
    // ================================================
    // PUBLIC METHODS

    /**
     * Given a customer id, return the name of the customer from
     * $scope.availableCustomers
     * @param  {string} id The customer ID
     * @return {string}    The customer name
     */
    $scope.getCustomerName = function(id){
      if($scope.availableCustomers){
        var customer = _.find($scope.availableCustomers, function(c){
          return c.id === id;
        });
        return customer.name;
      }
      return null;
    };

    $scope.hideFeatures = UserSelections.getCurrentUserPrefs().hideFeatures;

    // ================================================
    // INITIALIZE

    // ================================================
    // EVENT LISTENERS

  }])
});
