'use strict';

/* Controllers */
angular

.module('ServerMonitorViewer.controllers',[])

.controller('MainCtrl', MainCtrl)
.controller('HomeCtrl', HomeCtrl);

MainCtrl.$inject = ['$scope','$http','_','$interval'];
HomeCtrl.$inject = ['$scope', '$route','$http','$interval','Helpers'];

function MainCtrl($scope,$http,_,$interval) {
	var vm = this;
	vm.title = '';
	vm.servers = [];
	vm.searchAlias= '';

	//- Get a list of all active servers in [axerrio].[registeredservers]
	//- for use in the side menu
	vm.getServers = function() {
		$http.get('/listservers')
				.success(function(data) {
						vm.servers = data;
						vm.servers2 = data;
						vm.orphans = [];
						vm.children = [];
						vm.new = [];

						angular.forEach(vm.servers, function(value,index){
							value.escaped = encodeURIComponent(value.Description);
						});
						//- Set siblings for all entries, common parent = Description (servername)
						for(var i=0;i<vm.servers.length;i++){
							if(i<vm.servers.length-1){
								if(vm.servers[i].Description == vm.servers[i+1].Description && vm.servers[i].Description!='none'){
									vm.servers[i].hasSiblings = true;
									vm.servers[i+1].hasSiblings = true;
								}
								else {
									vm.servers[i+1].hasSiblings = false;
								}
							}
							else {
								if(vm.servers[i].Description == vm.servers[i-1].Description && vm.servers[i].Description!='none') {
									vm.servers[i].hasSiblings = true;
									vm.servers[i-1].hasSiblings = true;
								}
								else {
									vm.servers[i].hasSiblings = false;
								}
							}
						}
						angular.forEach(vm.servers, function(value,index){
							if(value.hasSiblings){
								//- New entry
								if(typeof(vm.new[value.Description]) == 'undefined'){
									vm.new[value.Description] = [];
								}
								vm.new[value.Description].push(value);
								vm.children.push(value);
							}
							else if(!value.hasSiblings){
								vm.orphans.push(value);
							}
						});
						//_.indexBy(vm.children,'Description');
						vm.sorted = _.groupBy(vm.children,'Description');
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});
			}

	vm.getServers();
	var interval = $interval(function () {vm.getServers()}, 60000);

	$scope.$on('$destroy', function() {
		$interval.cancel(interval);
	});
}

function HomeCtrl($scope,$route,$http,$interval,Helpers) {
		var vm = this;
		vm.title = '';
		vm.mockdata = [];
		vm.series = [];
		vm.data2 = [[],[],[]];
		vm.labels2 = [];

		vm.max = 60000;
		vm.dynamic = vm.max;

		//- Get the initial RemoteQueuedMetrics from [axerrio].[RemoteQueuedMetric]
		$http.get('/getqueue')
				.success(function(data) {
						data = Helpers.parseTimestamps(data);
						vm.mockdata = data.reverse();
						for(var i=0;i<vm.mockdata.length;i++){
							vm.data2[0].push(vm.mockdata[i].MetricValue);
							vm.data2[1].push(vm.mockdata[i].ThresholdValue);
							// set next dataset to negative to plot this dataset on other side of x-axis!
							vm.data2[2].push(vm.mockdata[i].ThresholdValue-vm.mockdata[i].MetricValue);
							vm.labels2.push(vm.mockdata[i].RemoteQueuedMetricKey + ' ' + vm.mockdata[i].InstanceName);
						}
						vm.series = ['MetricValue', 'ThresholdValue','Difference'];
						//console.log(vm.mockdata[vm.mockdata.length-1]);
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});

		vm.onClick = function (points, evt) {
		};
		vm.datasetOverride = [{ yAxisID: 'y-axis-1', fill: +1 }, { yAxisID: 'y-axis-2', fill: false }];
		vm.options = {
			scales: {
				gridLines: {
					display: false
				},
				xAxes: [
					{
					display: true,

					}
				],
				yAxes: [
					{
						id: 'y-axis-1',
						type: 'linear',
						display: true,
						position: 'left',
						ticks: {
							beginAtZero: true,
							autoSkip: true
						}
					}
				]
			},
			tooltips: {
				enabled: true
			},
			animation: {
				duration: 0
			},
			legend: {
				display: true
			}
		};

		var interval = $interval(function () {vm.getLiveChartData()}, vm.max);
		var interval2 = $interval(function () {vm.setprogressbarvalue()}, 1000);

		vm.setprogressbarvalue = function() {
			if(vm.dynamic>0){
				vm.dynamic = (vm.dynamic - 1000);
			}
			else {
				vm.dynamic = 59000;
			}
		}

		vm.getLiveChartData = function() {
			if(vm.mockdata[vm.mockdata.length-1]!=undefined) {
				$http.get('/getmutations/'+vm.mockdata[vm.mockdata.length-1].RemoteQueuedMetricKey)
					.success(function(data) {
						var tmpdata = data.reverse();
						data = Helpers.parseTimestamps(data);
						console.log('updating '+tmpdata.length+' record(s)...');
						var tmplength = 0;
						if (vm.data2[0].length) {
							tmplength = vm.data2[0].length;

							//- remove data in array if there is data to insert
							vm.labels2 = vm.labels2.slice(tmpdata.length);
							vm.data2[0] = vm.data2[0].slice(tmpdata.length);
							vm.data2[1] = vm.data2[1].slice(tmpdata.length);
							vm.mockdata = vm.mockdata.slice(tmpdata.length);
						}

						//- push new data into array
						for (var i=0;vm.data2[0].length < tmplength;i++) {
							vm.labels2.push(tmpdata[i].RemoteQueuedMetricKey + ' ' + vm.mockdata[i].InstanceName);
							vm.mockdata.push(tmpdata[i]);
							vm.data2[0].push(tmpdata[i].MetricValue);
							vm.data2[1].push(tmpdata[i].ThresholdValue);
						}
					})
					.error(function(data) {
							console.log('Error: ' + data);
							vm.error = data;
					});
				} // end $http
			} // end if

		$scope.$on('$destroy', function() {
			$interval.cancel(interval);
			//$scope.refresh();
		});
}


// helpers
function getRandomValue (data) {
	var l = data.length, previous = l ? data[l - 1] : 50;
	var y = previous + Math.random() * 10 - 5;
	return y < 0 ? 0 : y > 100 ? 100 : y;
}
