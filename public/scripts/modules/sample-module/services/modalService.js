/*global define */
define(['angular', 'services-module'], function(angular, services) {
    'use strict';

    /* Services */
    services.service('modalService', ['$rootScope', '$modal', function ($rootScope, $modal) {

        var self = {

            modalData: null,
            plotNewModalInstance: null,
            controller: null,
            templateName: ""
        };

        self.open = function (obj) {

            self.controller = obj.ctrl;
            self.templateUrl = 'assets/views/analysis/' + obj.tpl;
            self.scope = obj.scope;
            self.resolve = {
                modalType: obj.type,
                msg: obj.displayMsg,
                callback: obj.callBack
            };

            self.plotNewModalInstance = $modal.open({
                templateUrl: self.templateUrl,
                controller: self.controller,
                windowClass: 'analysisChartlModal span8',
                scope: self.scope,
                backdrop: 'static',
                resolve: {
                    modalInfo: function () {
                        if (self.resolve) {
                            return self.resolve;
                        }
                    }
                }
            });
        };
        return self;
    }])
});
