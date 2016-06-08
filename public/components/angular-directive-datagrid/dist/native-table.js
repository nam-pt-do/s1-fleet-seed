'use strict';

angular.module("template/pagination/pagination.html", []).run(["$templateCache", function($templateCache) {
    $templateCache.put("template/pagination/pagination.html",
        "<div class=\"pagination\"><ul>\n" +
            "  <li ng-repeat=\"page in pages\" ng-class=\"{active: page.active, disabled: page.disabled}\">" +
            "<a ng-click=\"selectPage(page.number)\">" +
            "<i class=\"icon-arrow-left\" ng-if=\"page.text == '<'\"></i>" +
            "<i class=\"icon-arrow-right\" ng-if=\"page.text == '>'\"></i>" +
            "<span ng-if=\"page.text != '>' && page.text != '<'\">{{page.text}}</span>" +
            "</a></li>\n" +
            "  </ul>\n" +
            "</div>\n" +
            "");
}]);

angular.module('datagridModule', ['ui.bootstrap.pagination']);
angular.module('datagridModule').directive('nativeTable', function($filter) {
    return {
        restrict: 'EA',
        scope: {              // set up directive's isolated scope
            tableData: "=",
            filtered: "=",
            pageLengths: "=",
            searchField: "=?",
            showSearch: "=?"
        },
        template:             // replacement HTML (can use our scope vars here)
            '<div class="wrapper">' +
                '<!-- filter -->' +
                '<form class="pull-right" ng-show="showSearch">' +
                    '<div class="input-append">' +
                        '<input type="text" class="input-medium search-query" ng-model="searchText">' +
                        '<button class="btn btn-icon"><i class="icon-search"></i></button>' +
                    '</div>' +
                '</form>' +

                '<div ng-transclude></div>'+

                '<div class="table-controls">' +
                    '<!-- numeration -->' +
                    '<div class="pull-left">' +
                        '<div class="dataTables_length">' +
                        '<label>' +
                        'Show' +
                        '<select size="1" ng-model="itemsPerPage" ng-options="value for value in pageLengths">' +
                        '<option value="10">10</option>' +
                        '<option value="25">25</option>' +
                        '</select>' +
                        'entries' +
                        '</label>' +
                        '</div>' +
                    '</div>' +

                    '<!-- pagination -->' +
                    '<div class="pull-right" ng-if="(tableData | filter:searchText).length > 0">' +
                            '<div class="dataTables_info">' +
                                '<strong>{{(currentPage-1)*itemsPerPage + 1}}</strong>' +
                                '&nbsp;-&nbsp;' +
                                '<!-- Note the two possibilities here, depending on whether you\'re on the last page or not -->' +
                                '<strong ng-if="currentPage < numPages">{{(currentPage)*itemsPerPage}}</strong>' +
                                '<strong ng-if="currentPage === numPages">{{(tableData | filter:searchText).length}}</strong>' +
                                '&nbsp;of&nbsp;' +
                                '<strong>{{(tableData | filter:searchText).length}}</strong>' +
                            '</div>' +
                            '<!-- angular-ui bootstrap pagination directive -->' +
                            '<div class="dataTables_paginate paging_bootstrap" pagination ' +
                            'total-items="(tableData | filter:searchText).length"' +
                            'items-per-page="itemsPerPage"' +
                            'num-pages="numPages"' +
                            'max-size="6"' +
                            'next-text=">"' +
                            'on-select-page="setPage(page)"' +
                            'previous-text="<"' +
                            'page="currentPage">' +
                            '</div>' +
                    '</div>' +
                '</div>' +
            '</div>',
        replace: true,        // replace original markup with template
        transclude: true,    // wrap the existing HTML content that exists between the element tabs for this directive.
        controller: function($scope, $log){
            var that = this; //creates an instance of the controller that can be shared across directives.
            // Settings that belong in the scope so they can be seen by the template
            $scope.strictSearchTable = false;
            $scope.searchText = "";
            // Initial Pagination Settings
            $scope.currentPage = 1;
            $scope.itemsPerPage = 10;
            if($scope.showSearch == undefined){
                $scope.showSearch = true;
            }

            // Initial Sort Settings. Shared across directives
            this.sortBy = '';
            this.sortOrder = ''; // values are '' or 'reverse'

            if($scope.searchField != null){
                $scope.$watch('searchField', function(queryString){
                    $scope.searchText = queryString;
                    $scope.applyFilters();
                });
            } else {
                $scope.$watch('searchText', function(queryString){

                        if (queryString=='Active' || queryString=='active')
                            $scope.strictSearchTable =true;
                        else
                            $scope.strictSearchTable = false;
                    $scope.applyFilters();
                });
            }

            $scope.$watch('itemsPerPage', function(){
                $scope.applyFilters();
            });

            //needed for the pagination directive
            $scope.setPage = function(newPage){
                $scope.currentPage = newPage;
                $scope.applyFilters();
            };

            $scope.applyFilters = function(){
               // $log.info("applyFilters called", that);
                if($scope.tableData && ($scope.tableData.$resolved || $scope.tableData.length > 0)){
                    var filtered = $filter('filter')($scope.tableData, $scope.searchText, $scope.strictSearchTable);
                    filtered = $filter('orderBy')(filtered, that.sortBy, that.sortOrder === 'reverse');
                    //filtered = $filter('startFrom')(filtered, ($scope.currentPage - 1) * $scope.itemsPerPage);
                    //removes dependency on startFrom filter
                    filtered = filtered.slice( ($scope.currentPage - 1) * $scope.itemsPerPage );

                    $scope.filtered = $filter('limitTo')(filtered, $scope.itemsPerPage);
                } else {
                    $scope.filtered = null;
                }
            };

            //set the sortBy string without sorting the data
            this.setSort = function(sortName){
                that.sortBy = sortName;
            };

            // Simple toggle sort function
            this.toggleSort = function(column){
                //$log.info("toggleSort called", column);
                if(that.sortBy === column){
                    that.sortOrder = this.sortOrder === '' ? 'reverse' : '';
                } else {
                    that.sortBy = column;
                    that.sortOrder = ''; // default for new is desc
                }
                //$log.info("sortOrder is now", that.sortOrder);
                $scope.applyFilters();
            };

            this.sortAscending = function(){
                that.sortOrder = '';
                $scope.applyFilters();
            };

            this.sortDescending = function(){
                that.sortOrder = 'reverse';
                $scope.applyFilters();
            };

            if($scope.tableData && $scope.tableData.$promise){
                $scope.tableData.$promise.then(function(){
                    $scope.applyFilters();
                });
            }

            $scope.$watch("tableData", function(newData){
                if($scope.tableData){
                    $scope.applyFilters();
                }
            });
        }
    }
}).directive('nativeTh', function() {
    return {
        restrict: 'EA',
        require: '^nativeTable',
        scope: {
            nativeTh: '@',
            defaultSort: "@"
        },
        link: function (scope, element, attrs, tableCtrl) {
            //$log.info("native th link", tableCtrl);
            if(scope.defaultSort){
                tableCtrl.setSort(scope.nativeTh);
                if(scope.defaultSort == "desc"){
                    tableCtrl.sortDescending();
                    element.addClass("sorting_desc");
                } else {
                    tableCtrl.sortAscending();
                    element.addClass("sorting_asc");
                }
            }

            element.on('click', function(){
                element.parent().children().removeClass("sorting_desc").removeClass("sorting_asc");
                scope.$apply(function(){
                    tableCtrl.toggleSort(scope.nativeTh);
                });

                if(tableCtrl.sortOrder === 'reverse'){
                    element.addClass("sorting_desc");
                } else {
                    element.addClass("sorting_asc");
                }
            });
        }
    }
});
