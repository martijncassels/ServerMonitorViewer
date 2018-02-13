'use strict';

var ServerMonitorViewer = angular.module('ServerMonitorViewer',[
    'ngRoute',
    'ngTouch',
    'ServerMonitorViewer.controllers',
    'ServerMonitorViewer.filters',
    'ServerMonitorViewer.services',
    'ServerMonitorViewer.directives',
    'chart.js',
    'ui.bootstrap',
    'underscore']);

ServerMonitorViewer
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/home', {templateUrl: 'partials/home/home', controller: 'HomeCtrl', controllerAs: 'vm', access: {restricted: false}})
        .when('/server/:servername/:alias', {templateUrl: 'partials/home/server', controller: 'ServerCtrl', controllerAs: 'vm', access: {restricted: false}})
        .otherwise({redirectTo: '/home', access: {restricted: false}});
    $locationProvider.html5Mode(true);
}]);
