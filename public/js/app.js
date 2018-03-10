'use strict';

var ServerMonitorViewer = angular.module('ServerMonitorViewer',[
		'ngRoute',
		'ngTouch',
		'ServerMonitorViewer.controllers',
		'ServerMonitorViewer.BlockingCtrl',
		'ServerMonitorViewer.ReportCtrl',
		'ServerMonitorViewer.ServerCtrl',
		'ServerMonitorViewer.filters',
		'ServerMonitorViewer.services',
		'ServerMonitorViewer.directives',
		'chart.js',
		'ui.bootstrap',
		'angularMoment',
		'underscore']);

ServerMonitorViewer
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
		$routeProvider
				.when('/home', {templateUrl: 'partials/home/home', controller: 'HomeCtrl', controllerAs: 'vm', access: {restricted: false}})
				.when('/server/:servername/:alias/:db', {params: {servername: {raw:true}},templateUrl: 'partials/home/server', controller: 'ServerCtrl', controllerAs: 'vm', access: {restricted: false}})
				.when('/reporting/:servername/:alias/:db', {templateUrl: 'partials/home/reporting', controller: 'ReportCtrl', controllerAs: 'vm', access: {restricted: false}})
				.when('/serverblocking/:alias/:db', {templateUrl: 'partials/home/server_blocking', controller: 'BlockingCtrl', controllerAs: 'vm', access: {restricted: false}})
				.otherwise({redirectTo: '/home', access: {restricted: false}});
		$locationProvider.html5Mode(true);
}]);
