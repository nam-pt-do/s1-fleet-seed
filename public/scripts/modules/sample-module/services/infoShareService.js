/*global define */
define(['angular', 'services-module'], function(angular, services) {
    'use strict';

    /* Services */
    services.factory('infoShare', ['$rootScope', function($rootScope){

        var allSites = "All Sites";
        var allLineups = "All Lineups";
        var allCustomers = "All Customers";
        var allMachines = "All Machines";
        var allCategories = "All Categories";


        // Variables for Filter Dropdowns
        var infoShare = infoShare || {
            "userId": "demo",
            "customerId":"",
            "role":"",
            "customerdetail" : {
                //"sites": []
            },
            "selectedCustomer" : "",
            "selectedSite" : "",
            "selectedSiteName": allSites,
            "defaultSite":"All Sites",
            "selectedLineup" : "",
            "selectedLineupName": allLineups,
            "defaultLineup":"All Lineups",
            "selectedMachine":"",
            "selectedCategory":"",
            "eulaStatus":"",
            "customers": [
                {
                    "customerId": "",
                    "customerName": "",
                    "sites" : []
                }
            ],
            "sites" : [
            {
                "siteId": "All Sites",
                "siteName": "All Sites",
                "lineups" : []
            }
            ] ,
            "lineups" : [
                {
                    "lineupId": "All Lineups",
                    "lineupName": "All Lineups",
                    "machine": []

                }
            ],
            "machines":[
                {
                    "id": "All Machines",
                    "name": "All Machines",
                    "icentName": "AllMachines"
                }
            ],
            "categories":[
                {
                    "categoryId": "All Categories",
                    "categoryName": "All Categories"
                }
            ],
            "showicenter" : false,
            "showcustomer" : true,
            "userView": "showiCenter",
            "selectedObj": {
                "customer" : {
                    "customerId": "APLCANA",
                    "sites" : []
                },
                "site" : {
                    "siteId": "All Sites",
                    "siteName": "All Sites",
                    "lineups" : []
                },
                "lineup" : {
                    "lineupId": "All Lineups",
                    "lineupName": "All Lineups",
                    "machine": []
                },
                "machine" : {
                    "id": "All Machines",
                    "name": "All Machines"
                },
                "category" : {
                    "categoryId": "All Categories",
                    "categoryName": "All Categories"
                }
            },
            "isGERole" : false,
            "dashboardInfo": {},
            "selectedCase" : null,
            "wsCaseObj" : null,
            "userObj" : null,
            "wsUserLastVisitedTime" : null,
            "curWsGroup" : null
    };

        return infoShare;
}])
});