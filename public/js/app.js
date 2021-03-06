'use strict';

var ServerMonitorViewer = angular.module('ServerMonitorViewer',[
		'ngRoute',
		// 'ngTouch',
		'ngAria',
		'ngMessages',
		'ngAnimate',
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
		'ngOboe',
		'ngMaterial',
		'ngMessages'
	]);

ServerMonitorViewer
.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider, tmhDynamicLocaleProvider) {
		$routeProvider
				.when('/home', {templateUrl: 'partials/home/home', controller: 'HomeCtrl', controllerAs: 'vm', access: {restricted: false}})
				.when('/server/:servername/:alias/:db', {params: {servername: {raw:true}},templateUrl: 'partials/home/server', controller: 'ServerCtrl', controllerAs: 'vm', access: {restricted: false}})
				.when('/reporting/:servername/:alias/:db', {templateUrl: 'partials/home/reporting', controller: 'ReportCtrl', controllerAs: 'vm', access: {restricted: false}})
				.when('/serverblocking/:alias/:db', {templateUrl: 'partials/home/server_blocking', controller: 'BlockingCtrl', controllerAs: 'vm', access: {restricted: false}})
				.otherwise({redirectTo: '/home', access: {restricted: false}});
				// .when('/home', {templateUrl: 'partials/home_semanticui/home', controller: 'HomeCtrl', controllerAs: 'vm', access: {restricted: false}})
				// .when('/server/:servername/:alias/:db', {params: {servername: {raw:true}},templateUrl: 'partials/home_semanticui/server', controller: 'ServerCtrl', controllerAs: 'vm', access: {restricted: false}})
				// .when('/reporting/:servername/:alias/:db', {templateUrl: 'partials/home_semanticui/reporting', controller: 'ReportCtrl', controllerAs: 'vm', access: {restricted: false}})
				// .when('/serverblocking/:alias/:db', {templateUrl: 'partials/home_semanticui/server_blocking', controller: 'BlockingCtrl', controllerAs: 'vm', access: {restricted: false}})
				// .otherwise({redirectTo: '/home_semanticui', access: {restricted: false}});
		$locationProvider.html5Mode(true);
		//tmhDynamicLocaleProvider.localeLocationPattern('js/lib/angular/i18n/angular-locale_{{locale}}.js');
}])
.config(function($httpProvider) {
	$httpProvider.useApplyAsync(true);
})
.config(function($mdThemingProvider) {
	$mdThemingProvider.theme('default')
		.primaryPalette('deep-purple')
		.accentPalette('teal');
})
.run(function($rootScope) {
		$rootScope.$on("$locationChangeStart", function(event, next, current) {
				$rootScope = null;
		});
})
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
