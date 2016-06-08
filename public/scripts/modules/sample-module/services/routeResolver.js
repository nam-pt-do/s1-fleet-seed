/*global define */
define(['angular', 'services-module'], function(angular, services) {
    'use strict';

    /* Services */
    services.service('routeResolver', ['$rootScope', '$q', 'userData', 'infoShare', function ($rootScope, $q, userData, infoShare) {
        return {
            resolve: function () {

                var __RS = $rootScope;
                var __RSInfo = infoShare;
                var dfr = $q.defer();
                var filterData;
                var featureDate;

                userData.read().then(function (data) {

                    var role;
                    var dimensionValue;
                    var dimensionValueCust;
                    var userData = data.user;
                    var dimensionRoleValue = userData.role;

                    filterData = data.customerList;
                    featureDate = data.featureList;

                    role = dimensionValue = userData.role;
                    dimensionValueCust = userData.customerId;

                    __RSInfo.userObj = userData;

                    //infoshare
                    __RSInfo.customerId = userData.customerId;
                    __RSInfo.userId = userData.userId;
                    __RSInfo.showicenter = false;
                    __RSInfo.showcustomer = false;

                    __RS.userRole = role;

                    __RS.role = {isGERole: true};
                    __RS.isGERole = true;
                    __RSInfo.isGERole = true;
                    __RS.selectedUserView = true;
                    __RS.userView = {iCenter: true};

                    var customerData = filterData;
                    var siteListArray = __RSInfo.sites;
                    var selectedObj = __RSInfo.selectedObj;
                    var featureResult = featureDate;

                    //*************************************************
                    //** Bootstrapping global filter for the fist time
                    //*************************************************

                    __RS.selectedCustomerTitle = customerData[0].customerName;
                    __RSInfo.customerdetail = __RSInfo.customers = customerData;

                    selectedObj.customer.customerId = customerData[0].customerId;
                    selectedObj.customer.sites = customerData[0].sites;

                    siteListArray.splice(1);

                    __RSInfo.sites = siteListArray.concat(selectedObj.customer.sites);

                    dfr.resolve();
                });
                return dfr.promise;
            }
        };
    }])
});
