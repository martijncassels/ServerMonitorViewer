'use strict';

/* Controllers */
angular

.module('ServerMonitorViewer.controllers',[])

.controller('MainCtrl', MainCtrl)
.controller('HomeCtrl', HomeCtrl);

MainCtrl.$inject = ['$scope','$http','_'];
HomeCtrl.$inject = ['$scope', '$route','$http','$interval'];

function MainCtrl($scope,$http,_) {
	var vm = this;
	vm.title = '';
	vm.servers = [];

	//- Get a list of all active servers in [axerrio].[registeredservers]
	//- for use in the side menu
	$http.get('/listservers')
			.success(function(data) {
					vm.servers = data;
					vm.servers2 = data;
					vm.orphans = [];
					vm.children = [];
					vm.new = [];
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

function HomeCtrl($scope,$route,$http,$interval) {
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
						_.each(data,function(value1,index){
							_.each(value1,function(value2,key){
								if(["Timestamp"].indexOf(key) != -1){
									data[index][key] = moment(value2).format('DD-MM-YYYY hh:mm:ss');
								}
							});
						});
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
				xAxes: [{
					display: false
				}],
				yAxes: [
					{
						id: 'y-axis-1',
						type: 'linear',
						display: true,
						position: 'left',
						ticks: {
							beginAtZero: true
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
						data.reverse();
						_.each(data,function(value1,index){
							_.each(value1,function(value2,key){
								if(["Timestamp"].indexOf(key) != -1){
									data[index][key] = moment(value2).format('DD-MM-YYYY hh:mm:ss');
								}
							});
						});
						console.log('updating '+data.length+' records...');
						var tmplength = 0;
						if (vm.data2[0].length) {
							tmplength = vm.data2[0].length;

							//- remove data in array if there is data to insert
							vm.labels2 = vm.labels2.slice(data.length);
							vm.data2[0] = vm.data2[0].slice(data.length);
							vm.data2[1] = vm.data2[1].slice(data.length);
							vm.mockdata = vm.mockdata.slice(data.length);
						}

						//- push new data into array
						for (var i=0;vm.data2[0].length < tmplength;i++) {
							vm.labels2.push(data[i].RemoteQueuedMetricKey);
							vm.mockdata.push(data[i]);
							vm.data2[0].push(data[i].MetricValue);
							vm.data2[1].push(data[i].ThresholdValue);
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
		});
}


// helpers
function getRandomValue (data) {
	var l = data.length, previous = l ? data[l - 1] : 50;
	var y = previous + Math.random() * 10 - 5;
	return y < 0 ? 0 : y > 100 ? 100 : y;
}
