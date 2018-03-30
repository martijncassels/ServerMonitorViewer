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
		'underscore',
		'angular.filter',
		'tmh.dynamicLocale',
		'ngOboe']);

ServerMonitorViewer
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider,tmhDynamicLocaleProvider) {
		$routeProvider
				.when('/home', {templateUrl: 'partials/home/home', controller: 'HomeCtrl', controllerAs: 'vm', access: {restricted: false}})
				.when('/server/:servername/:alias/:db', {params: {servername: {raw:true}},templateUrl: 'partials/home/server', controller: 'ServerCtrl', controllerAs: 'vm', access: {restricted: false}})
				.when('/reporting/:servername/:alias/:db', {templateUrl: 'partials/home/reporting', controller: 'ReportCtrl', controllerAs: 'vm', access: {restricted: false}})
				.when('/serverblocking/:alias/:db', {templateUrl: 'partials/home/server_blocking', controller: 'BlockingCtrl', controllerAs: 'vm', access: {restricted: false}})
				.otherwise({redirectTo: '/home', access: {restricted: false}});
		$locationProvider.html5Mode(true);
		//tmhDynamicLocaleProvider.localeLocationPattern('js/lib/angular/i18n/angular-locale_{{locale}}.js');
}])
.run(function($rootScope, $interval) {
		// add the register task to the rootScope. This will allow for autoUnregister when the
		// scope is destroyed to prevent tasks from leaking.

		var ScopeProt = Object.getPrototypeOf($rootScope);
		ScopeProt.$interval = function(func, time){
				 var timer = $interval(func,time);
				 this.on('$destroy', function(){ $timeout.cancel(timer); });
				 return timer;
		};
});
