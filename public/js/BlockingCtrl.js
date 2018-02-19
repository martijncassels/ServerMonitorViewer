'use strict';

/* Controllers */
angular

.module('ServerMonitorViewer.BlockingCtrl',[])

.controller('BlockingCtrl', BlockingCtrl);

BlockingCtrl.$inject = ['$scope', '$route','$http','$interval','$routeParams'];

function BlockingCtrl($scope,$route,$http,$interval,$routeParams) {
		var vm = this;
		vm.title = '';
    vm.blocking = [];
		vm.alias = '';

		vm.max = 60000;
		vm.dynamic = vm.max;

  	if($routeParams.servername=='HO-SQL01' && $routeParams.db=='FlowerCore') {
			vm.alias = 'HOL';
		}


		//- Get active license useage
		vm.blockingstarting = true;
		$http.get('/getblocking/'+vm.alias+'/'+$routeParams.db)
				.success(function(data) {
						_.each(data,function(value1,index){
							_.each(value1,function(value2,key){
								if(["MeasureTime"].indexOf(key) != -1){
									data[index][key] = moment(value2).utc().format('DD-MM-YYYY hh:mm:ss');
								}
							});
						});
						vm.blockingstarting = false;
						vm.blocking = data;
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});
}
