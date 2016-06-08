/**
 * Created by 212394486 on 10/23/2015.
 */
'use strict';
define(['angular', 'services-module'], function (angular, services) {

    services.service('hello', ['$q', function ($q) {

        return {
            sayHello: function () {

                var diff = $q.defer();
                console.log("hello");


                diff.resolve();
                return diff.promise;
            }
        }
    }])

});