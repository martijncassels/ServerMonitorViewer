'use strict';

/* Controllers */
angular

.module('ServerMonitorViewer.controllers',[])

.controller('MainCtrl', MainCtrl)
.controller('ServerCtrl', ServerCtrl);

MainCtrl.$inject = ['$scope','$rootScope','AuthService', '$route','$http','$interval'];
ServerCtrl.$inject = ['$scope','$rootScope','AuthService', '$route','$http','$interval','$routeParams'];

function MainCtrl($scope,$rootScope,AuthService,$route,$http,$interval) {
		var vm = this;
		vm.title = '';
		vm.mockdata = [];
		vm.servers = [];
		vm.data = [[],[]];
		vm.labels = [];
		vm.series = [];
		vm.data2 = [[],[]];
		vm.labels2 = [];

		$http.get('/listservers')
				.success(function(data) {
						vm.servers = data;
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});

		$http.get('/getqueue')
				.success(function(data) {
						vm.mockdata = data;
						//console.log(data);
						for(var i=0;i<vm.mockdata.length;i++){
							vm.data[0].push(vm.mockdata[i].MetricValue);
							vm.data[1].push(vm.mockdata[i].ThresholdValue);
							//vm.labels.push(vm.mockdata[i].Timestamp);
							vm.labels.push('');

							vm.data2[0].push(vm.mockdata[i].MetricValue);
							vm.data2[1].push(vm.mockdata[i].ThresholdValue);
							vm.labels2.push('');
						}
						vm.series = ['MetricValue', 'ThresholdValue'];
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});

		// $interval(callAtInterval, 2000);
    //
		// function callAtInterval(){
		// 	vm.data2.push(Math.floor((Math.random() * 100) + 1));
		// 	vm.labels2.push('');
		// 	}


		//vm.labels = ["January", "February", "March", "April", "May", "June", "July"];
		//vm.series = ['Series A', 'Series B'];
		// vm.data = [
		// 	[65, 59, 80, 81, 56, 55, 40],
		// 	[28, 48, 40, 19, 86, 27, 90]
		// ];
		vm.onClick = function (points, evt) {
			//console.log(points, evt);
		};
		vm.datasetOverride = [{ yAxisID: 'y-axis-1', fill: +1 }, { yAxisID: 'y-axis-2', fill: false }];
		vm.options = {
			scales: {
				gridLines: {
					display: false
				},
				yAxes: [
					{
						id: 'y-axis-1',
						type: 'linear',
						display: true,
						position: 'left'
					}
				]
			},
			tooltips: {
        enabled: true
      },
			legend: {
        display: false
      }
		};
		vm.options2 = {
      animation: {
        duration: 0
      },
      elements: {
        line: {
          borderWidth: 0.5
        },
        point: {
          radius: 0
        }
      },
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          display: false
        }],
        yAxes: [{
          display: false
        }],
        gridLines: {
          display: false
        }
      },
      tooltips: {
        enabled: false
      }
    };
		// Update the dataset at 25FPS for a smoothly-animating chart
    // $interval(function () {
    //   getLiveChartData();
    // }, 40);
    //
    // function getLiveChartData () {
    //   if (vm.data2[0].length) {
    //     vm.labels2 = vm.labels2.slice(1);
    //     vm.data2[0] = vm.data2[0].slice(1);
    //   }
    //
    //   while (vm.data2[0].length < 300) {
    //     vm.labels2.push('');
    //     vm.data2[0].push(getRandomValue(vm.data2[0]));
    //   }
    // }
		$interval(function () {
			getLiveChartData();
		}, 60000);

		function getLiveChartData () {
			$http.get('/getmutations/'+vm.mockdata[0].RemoteQueuedMetricKey)
				.success(function(data) {
					if (vm.data2[0].length) {
						vm.labels2 = vm.labels2.slice(1,data.length);
						vm.data2[0] = vm.data2[0].slice(1,data.length);
					}

					while (vm.data2[0].length < vm.data2[0].length+data.length) {
						vm.data2.reverse();
						vm.labels2.reverse();

						vm.labels2.push('');
						// vm.data2[0].push(data);

						vm.data2[0].push(data[0].MetricValue);
						vm.data2[1].push(data[0].ThresholdValue);

						vm.data2.reverse();
						vm.labels2.reverse();
					}
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});
			}
}

function ServerCtrl($scope,$rootScope,AuthService,$route,$http,$interval,$routeParams) {
		var vm = this;
		vm.title = '';
		vm.mockdata = [];
		vm.servers = [];
		vm.data = [[],[]];
		vm.labels = [];

		$http.get('/getcustomermetrics/'+$routeParams.servername)
				.success(function(data) {
						vm.mockdata = data;
						//console.log(data);
						for(var i=0;i<vm.mockdata.length;i++){
							vm.data[0].push(vm.mockdata[i].MetricValue);
							vm.data[1].push(vm.mockdata[i].ThresholdValue);
							//vm.labels.push(vm.mockdata[i].Timestamp);
							vm.labels.push('');
						}
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});

		vm.onClick = function (points, evt) {
			//console.log(points, evt);
		};
		vm.datasetOverride = [{ yAxisID: 'y-axis-1', fill: +1 }, { yAxisID: 'y-axis-2', fill: false }];
		vm.options = {
			scales: {
				gridLines: {
					display: false
				},
				yAxes: [
					{
						id: 'y-axis-1',
						type: 'linear',
						display: true,
						position: 'left'
					}
				]
			},
			legend: {
        display: false
      }
		};
}

// helpers
function getRandomValue (data) {
	var l = data.length, previous = l ? data[l - 1] : 50;
	var y = previous + Math.random() * 10 - 5;
	return y < 0 ? 0 : y > 100 ? 100 : y;
}
