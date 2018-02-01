'use strict';

/* Controllers */
angular

.module('ServerMonitorViewer.controllers',[])

.controller('MainCtrl', MainCtrl);

MainCtrl.$inject = ['$scope','$rootScope','AuthService', '$route'];

function MainCtrl($scope,$rootScope,AuthService,$route) {
		var vm = this;
		vm.title = '';

		vm.labels = ["January", "February", "March", "April", "May", "June", "July"];
		vm.series = ['Series A', 'Series B'];
		vm.data = [
			[65, 59, 80, 81, 56, 55, 40],
			[28, 48, 40, 19, 86, 27, 90]
		];
		vm.onClick = function (points, evt) {
			//console.log(points, evt);
		};
		vm.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
		vm.options = {
			scales: {
				yAxes: [
					{
						id: 'y-axis-1',
						type: 'linear',
						display: true,
						position: 'left'
					},
					{
						id: 'y-axis-2',
						type: 'linear',
						display: true,
						position: 'right'
					}
				]
			}
		};
}
