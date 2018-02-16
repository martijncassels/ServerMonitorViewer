'use strict';

/* Controllers */
angular

.module('ServerMonitorViewer.ServerSingleCtrl',[])

.controller('ServerSingleCtrl', ServerSingleCtrl);

ServerSingleCtrl.$inject = ['$scope', '$route','$http','$interval','$routeParams','$interval'];

function ServerSingleCtrl($scope,$route,$http,$interval,$routeParams) {
		var vm = this;
		vm.title = '';
    vm.blocking = [];

		vm.max = 60000;
		vm.dynamic = vm.max;

    //- temporary switch to set db name and linkedserver name,
    //- need to figure this out, maybe via [axerrio].[RegisteredServer]?
    switch($routeParams.alias) {
        case 'BAR':
            vm.db = 'Axerrio';
            break;
        case 'HOL':
            vm.db = 'FlowerCore';
            break;
        case 'HUS':
            vm.db = 'ABSHUS';
            break;
        case 'VVB':
            vm.db = 'ABSBloemen';
            break;
        case 'VVP':
            vm.db = 'FCPotplants';
            break;
        case 'FCA':
            vm.db = 'FlowerCore';
            break;
        default:
              vm.db = 'none';
        }

		//- Get active license useage
		vm.blockingstarting = true;
		$http.get('/getblocking/'+$routeParams.alias+'/'+vm.db)
				.success(function(data) {
						vm.blockingstarting = false;
						vm.blocking = data;
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});
}
