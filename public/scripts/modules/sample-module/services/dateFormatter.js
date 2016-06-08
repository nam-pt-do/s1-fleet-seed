/*global define */
define(['angular', 'services-module'], function (angular, services) {
    'use strict';

    /* Services */
    //Factory for global variables; includes customerId, enterpriseId, nodeId, user, fleet, state

    services.factory('dateFormatter', ['UserSelections', function (UserSelections) {

        return {
            getUTCFormat: function (dt) {
                var baseDate = new Date(dt);
                return (
                    /*  baseDate.getUTCFullYear()
                     +'-'+((baseDate.getUTCMonth() < 10) ? "0" + baseDate.getUTCMonth() : baseDate.getUTCMonth())
                     +'-'+((baseDate.getUTCDate() < 10) ? "0" + baseDate.getUTCDate() : baseDate.getUTCDate())
                     +' '+((baseDate.getUTCHours() < 10) ? "0" + baseDate.getUTCHours() : baseDate.getUTCHours())
                     +':'+((baseDate.getUTCMinutes()<10)?"0"+baseDate.getUTCMinutes():baseDate.getUTCMinutes())*/

                    moment(baseDate).utc(baseDate).format("YYYY-MM-DD HH:mm:ss")
                );
            },
            getLocalFormat: function (dt) {
                var baseDate = new Date(dt);
                return (
                    /* baseDate.getFullYear()
                     +'-'+((baseDate.getMonth() < 10) ? "0" + baseDate.getMonth() : baseDate.getMonth())
                     +'-'+((baseDate.getDate() < 10) ? "0" + baseDate.getDate() : baseDate.getDate())
                     +' '+((baseDate.getHours() < 10) ? "0" + baseDate.getHours() : baseDate.getHours())
                     +':'+((baseDate.getMinutes()<10)?"0"+baseDate.getMinutes():baseDate.getMinutes())
                     */
                    moment(baseDate).format("YYYY-MM-DD HH:mm:ss")
                );
            }, getUTCFormatCompleteDate: function (dt) {
                //var baseDate = new Date(dt);
                var alarmLocalTimeZone = moment(dt).utc(dt).local().format("YYYY-MM-DD HH:mm:ss");
                return (
                    //moment(dt).utc(dt).format("YYYY-MM-DD hh:mm:ss A")
                    alarmLocalTimeZone
                );


            }, getLocalFormatCompleteDate: function (dt) {
                var baseDate = new Date(dt);
                //var alarmLocalTimeZone = moment(baseDate).utc(baseDate).local().format("YYYY-MM-DD hh:mm:ss");
                var alarmLocalTimeZone = moment(dt).utc(dt).local().format("YYYY-MM-DD hh:mm:ss A")
                return (
                    //moment(dt).utc(dt).format("YYYY-MM-DD hh:mm:ss A")
                    alarmLocalTimeZone
                );

            }, getUTCFormatCompleteFullDate: function (dt) {
                var baseDate = new Date(dt);
                return (
                    moment(dt).utc(dt).format("YYYY-MM-DD HH:mm:ss")
                );
            }
        };
    }])
});
