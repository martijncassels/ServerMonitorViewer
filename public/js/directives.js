'use strict';

/* Directives */

angular

.module('ServerMonitorViewer.directives',[])

.directive('appVersion', appVersion)
.directive('commentForm', commentForm)
.directive('loading', loading);

appVersion.$inject = ['version'];
loading.$inject = ['$http'];

function appVersion(version) {
    	return function(scope, elm, attrs) {
      		elm.text(version);
    	}
  	}

function commentForm() {
  		return {
  			restrict: 'E',
    		templateUrl: 'commentForm'
  		};
}

function loading($http) {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs)
            {
                scope.isLoading = function () {
                    return $http.pendingRequests.length > 0;
                };

                scope.$watch(scope.isLoading, function (v)
                {
                    // if(v){
                    //     elm.show();
                    // }else{
                    //     elm.hide();
                    // }
                    if (v) {
                            elm.css('display', 'block');
                        } else {
                            elm.css('display', 'none');
                        }
                });
            }
        };

    }
  // .directive('pagination', function() {
  //   return {
  //     restrict: 'E',
  //     scope: {
  //       numPages: '=',
  //       currentPage: '=',
  //       onSelectPage: '&'
  //     },
  //     templateUrl: 'pagination.html',
  //     replace: true,
  //     link: function(scope) {
  //       scope.$watch('numPages', function(value) {
  //         scope.pages = [];
  //         for(var i=1;i<=value;i++) {
  //           scope.pages.push(i);
  //         }
  //         if ( scope.currentPage > value ) {
  //           scope.selectPage(value);
  //         }
  //       });
  //       scope.noPrevious = function() {
  //         return scope.currentPage === 1;
  //       };
  //       scope.noNext = function() {
  //         return scope.currentPage === scope.numPages;
  //       };
  //       scope.isActive = function(page) {
  //         return scope.currentPage === page;
  //       };
  //
  //       scope.selectPage = function(page) {
  //         if ( ! scope.isActive(page) ) {
  //           scope.currentPage = page;
  //           scope.onSelectPage({ page: page });
  //         }
  //       };
  //
  //       scope.selectPrevious = function() {
  //         if ( !scope.noPrevious() ) {
  //           scope.selectPage(scope.currentPage-1);
  //         }
  //       };
  //       scope.selectNext = function() {
  //         if ( !scope.noNext() ) {
  //           scope.selectPage(scope.currentPage+1);
  //         }
  //       };
  //     }
  //   };
  // })
