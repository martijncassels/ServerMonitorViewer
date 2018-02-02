'use strict';

var ServerMonitorViewer = angular.module('ServerMonitorViewer',[
    'ngRoute',
    'ngTouch',
    'ServerMonitorViewer.controllers',
    'ServerMonitorViewer.Logincontrollers',
    // 'ServerMonitorViewer.Factorycontrollers',
    // 'ServerMonitorViewer.Messagecontrollers',
    // 'ServerMonitorViewer.Profilecontrollers',
    // 'ServerMonitorViewer.Workshopcontrollers',
    'ServerMonitorViewer.filters',
    'ServerMonitorViewer.services',
    'ServerMonitorViewer.directives',
    'chart.js',
    'ui.bootstrap',
    'underscore']);

ServerMonitorViewer
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/home', {templateUrl: 'partials/home/home', controller: 'MainCtrl', controllerAs: 'vm', access: {restricted: false}})
        .when('/server/:servername', {templateUrl: 'partials/home/server', controller: 'ServerCtrl', controllerAs: 'vm', access: {restricted: false}})
        .when('/login', {templateUrl: 'partials/login/login', controller: 'loginController', access: {restricted: false}})
        .when('/logout', {controller: 'logoutController', access: {restricted: false}})
        .when('/register', {templateUrl: 'partials/login/register', controller: 'registerController', access: {restricted: false}})
        .otherwise({redirectTo: '/home', access: {restricted: false}});
    $locationProvider.html5Mode(true);
}])
// .config(function (reCAPTCHAProvider) {
//     // required: please use your own key :)
//     reCAPTCHAProvider.setPublicKey('6LfOCjMUAAAAAHMViY5YidDnok6bo260mHfzumud');

//     // optional: gets passed into the Recaptcha.create call
//     reCAPTCHAProvider.setOptions({
//         theme: 'clean'
//     });
// })
.run(function ($rootScope, $location, $route, AuthService) {
  $rootScope.$on('$routeChangeStart',
    function (event, next, current) {
      AuthService.getUserStatus()
      .then(function(data){
        //$rootScope.isLoggedIn = data.data.status;
        if (next.access.restricted && !AuthService.isLoggedIn()){
        //if (!AuthService.isLoggedIn()){
          $location.path('/login');
          $route.reload();
        }
      });
  });
})
;
