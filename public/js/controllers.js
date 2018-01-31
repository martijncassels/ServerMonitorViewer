'use strict';

/* Controllers */
angular

.module('ServerMonitorViewer.controllers',[])

.controller('MainCtrl', MainCtrl);

MainCtrl.$inject = ['$scope','$rootScope','AuthService', '$route'];

function MainCtrl($scope,$rootScope,AuthService,$route) {
    var vm = this;
    vm.title = 'Whatif...!';
    vm.templateurl = '';

}
