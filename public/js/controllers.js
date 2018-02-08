'use strict';

/* Controllers */
angular

.module('ServerMonitorViewer.controllers',[])

.controller('MainCtrl', MainCtrl)
.controller('HomeCtrl', HomeCtrl)
.controller('ServerCtrl', ServerCtrl);

MainCtrl.$inject = ['$scope','$http'];
HomeCtrl.$inject = ['$scope', '$route','$http','$interval'];
ServerCtrl.$inject = ['$scope', '$route','$http','$interval','$routeParams','$interval'];

function MainCtrl($scope,$http) {
	var vm = this;
	vm.title = '';

	$http.get('/listservers')
			.success(function(data) {
					vm.servers = data;
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
		vm.servers = [];
		vm.series = [];
		vm.data2 = [[],[]];
		vm.labels2 = [];

		vm.max = 60000;
		vm.dynamic = vm.max;

		// vm.max = (60000/1000);
		// vm.dynamic = vm.max;
		// var i = vm.max;
		// var counterBack = setInterval(function () {
		// 	i--;
		// 	if (i > 0) {
		// 		vm.dynamic = (i/1000);
		// 	} else {
		// 		clearInterval(counterBack);
		// 	}
		// }, 1000)

		$http.get('/getqueue')
				.success(function(data) {
						vm.mockdata = data.reverse();
						for(var i=0;i<vm.mockdata.length;i++){

							vm.data2[0].push(vm.mockdata[i].MetricValue);
							vm.data2[1].push(vm.mockdata[i].ThresholdValue);
							vm.labels2.push(vm.mockdata[i].RemoteQueuedMetricKey);
						}
						vm.series = ['MetricValue', 'ThresholdValue'];
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
				display: false
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
						console.log('updating '+data.length+' records...');
						var tmplength = 0;
						if (vm.data2[0].length) {
							tmplength = vm.data2[0].length;

							vm.labels2 = vm.labels2.slice(data.length);
							vm.data2[0] = vm.data2[0].slice(data.length);
							vm.data2[1] = vm.data2[1].slice(data.length);
							vm.mockdata = vm.mockdata.slice(data.length);
						}

						for (var i=0;vm.data2[0].length < tmplength;i++) {
							vm.labels2.push(data[i].RemoteQueuedMetricKey);
							vm.mockdata.push(data[i])

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

function ServerCtrl($scope,$route,$http,$interval,$routeParams) {
		var vm = this;
		vm.title = '';
		vm.mockdata = [];
		vm.licenses = [];
		vm.archivecounters = [];
		vm.archivecounterschartdata = [];
		vm.metricschartdata = [];
		vm.metricschartseries = [];
		vm.metricschartlabels = [];
		vm.metricsdatasetOverride = [];
		// vm.archivecounterschartdata['ArchiveCounterKey'] = [];
		// vm.archivecounterschartdata['OrderCount'] = [];
		// vm.archivecounterschartdata['OrderRowCount'] = [];
		// vm.archivecounterschartdata['PartyCount'] = [];
		// vm.archivecounterschartdata['PartyVirtualCount'] = [];
		// vm.archivecounterschartdata['PartyMutationCount'] = [];
		// vm.archivecounterschartdata['ExinvoiceCount'] = [];
		// vm.archivecounterschartdata['PricelistCount'] = [];
		// vm.archivecounterschartdata['PricelistRowCount'] = [];
		// vm.archivecounterschartdata['VPSupplylineCount'] = [];
		// vm.archivecounterschartdata['PartyTransactionCount'] = [];
		vm.archivecounterschartlabels = [];
		vm.archivecounterschartseries = ["ArchiveCounterKey","CounterTimestamp","OrderCount","OrderRowCount","PartyCount","PartyVirtualCount","PartyMutationCount","ExinvoiceCount","PricelistCount","PricelistRowCount","VPSupplylineCount","PartyTransactionCount"];
		vm.servers = [];
		vm.data = [[],[]];
		vm.labels = [];
		vm.vmptransactions = [];
		vm.vmptransactionsdata = [];
		vm.vmptransactionslabels = [];

		vm.max = 60000;
		vm.dynamic = vm.max;
		/*
		[index
			{ "RemoteQueuedMetricKey": 1,
			  "Timestamp": "2018-01-04 18:00:56"...}, obj
			{ "RemoteQueuedMetricKey": 2,
			  "Timestamp": "2017-04-10 18:01:23"...}
				key 					value
		]
		*/

		$http.get('/getcustomermetrics/'+$routeParams.servername)
				.success(function(data) {
						vm.mockdata = data;
						vm.mockdata = data.reverse();
						for(var i=0;i<vm.mockdata.length;i++){
							vm.data[0].push(vm.mockdata[i].MetricValue);
							vm.data[1].push(vm.mockdata[i].ThresholdValue);
							vm.labels.push(vm.mockdata[i].RemoteQueuedMetricKey);
						}
						_.each(data,function(obj,index){
							if(_.isMatch(obj,{Metric:'Lots_Real'})){
								if(typeof(vm.metricschartdata[0]) == 'undefined'){
									vm.metricschartseries.push('Lots_Real_Value');
									vm.metricschartseries.push('Lots_Real_Threshold');
									vm.metricschartdata[0] = [];
									vm.metricschartdata[1] = [];
								}
								vm.metricschartdata[0][index] = obj.MetricValue;
								vm.metricschartdata[1][index] = obj.ThresholdValue;
							}
							if(_.isMatch(obj,{Metric:'Lots_Virtual'})){
								if(typeof(vm.metricschartdata[2]) == 'undefined'){
									vm.metricschartseries.push('Lots_Virtual_Value');
									vm.metricschartseries.push('Lots_Virtual_Threshold');
									vm.metricschartdata[2] = [];
									vm.metricschartdata[3] = [];
								}
								vm.metricschartdata[2][index] = obj.MetricValue;
								vm.metricschartdata[3][index] = obj.ThresholdValue;
							}
							vm.metricschartlabels[index] = obj.Timestamp;
						});
						vm.metricsdatasetOverride = [{label: "Lots_Real_Value",type:'bar'},{label: "Lots_Real_Threshold",type:'line', fill: true},{label: "Lots_Virtual_Value",type:'bar'},{label: "Lots_Virtual_Threshold",type:'line', fill:true}];
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});

		switch($routeParams.servername) {
		case 'BA-SQL12':
				vm.customer = 'BAR';
				vm.db = 'Axerrio';
				break;
		case 'HO-SQL01':
				vm.customer = 'HOL';
				vm.db = 'FlowerCore';
				break;
		case 'VVB-SQL03':
				vm.customer = 'VVB';
				vm.db = 'ABSBloemen';
				break;
		case 'VVP-SQL01':
				vm.customer = 'VVP';
				vm.db = 'FCPotplants';
				break;
		default:
				vm.customer = '';
					vm.db = '';
		}

		$http.get('/getlicenses/'+vm.customer+'/'+vm.db)
				.success(function(data) {
						vm.licenses = data;
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});

		$http.get('/getvmptransactions/'+vm.customer+'/'+vm.db)
				.success(function(data) {
						vm.vmptransactions = data;

						for(var i=0;i<data.length;i++){
							vm.vmptransactionsdata.push(data[i].ToCalculate);
							vm.vmptransactionslabels.push(data[i].Description);
						}
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});

		$http.get('/getarchivecounters/'+vm.customer+'/'+vm.db)
				.success(function(data) {
						vm.archivecounters = data;
						// for (var i=0 ; i<data.length; i++){
						// 	for (var key in data[i]) {
						// 		if(key=='ArchiveCounterKey'){
						// 			vm.archivecounterschartdata['ArchiveCounterKey'][i] = data[i][key];
						// 		}
						// 		else if(key=='OrderCount'){
						// 			vm.archivecounterschartdata['OrderCount'].push(data[i][key]);
						// 		}
						// 		else if(key=='OrderRowCount'){
						// 			vm.archivecounterschartdata['OrderRowCount'][i] = data[i][key];
						// 		}
						// 		else if(key=='PartyCount'){
						// 			vm.archivecounterschartdata['PartyCount'][i] = data[i][key];
						// 		}
						// 		else if(key=='PartyMutationCount'){
						// 			vm.archivecounterschartdata['PartyMutationCount'][i] = data[i][key];
						// 		}
						// 		else if(key=='ExinvoiceCount'){
						// 			vm.archivecounterschartdata['ExinvoiceCount'][i] = data[i][key];
						// 		}
						// 		else if(key=='PricelistCount'){
						// 			vm.archivecounterschartdata['PricelistCount'][i] = data[i][key];
						// 		}
						// 		else if(key=='PricelistRowCount'){
						// 			vm.archivecounterschartdata['PricelistRowCount'][i] = data[i][key];
						// 		}
						// 		else if(key=='VPSupplylineCount'){
						// 			vm.archivecounterschartdata['VPSupplylineCount'][i] = data[i][key];
						// 		}
						// 		else if(key=='PartyTransactionCount'){
						// 			vm.archivecounterschartdata['PartyTransactionCount'][i] = data[i][key];
						// 		}
						// 	}
						// }
						// vm.archivecounterschartdata['ArchiveCounterKey'].reverse();
						// vm.archivecounterschartdata['OrderCount'].reverse();
						// vm.archivecounterschartdata['OrderRowCount'].reverse();
						// vm.archivecounterschartdata['PartyCount'].reverse();
						// vm.archivecounterschartdata['PartyVirtualCount'].reverse();
						// vm.archivecounterschartdata['PartyMutationCount'].reverse();
						// vm.archivecounterschartdata['ExinvoiceCount'].reverse();
						// vm.archivecounterschartdata['PricelistCount'].reverse();
						// vm.archivecounterschartdata['PricelistRowCount'].reverse();
						// vm.archivecounterschartdata['VPSupplylineCount'].reverse();
						// vm.archivecounterschartdata['PartyTransactionCount'].reverse();_.each(data,function(value1,index){

						_.each(data,function(value1,index){
							_.each(value1,function(value2,key){
								if(typeof(vm.archivecounterschartdata[Object.keys(value1).indexOf(key)]) == 'undefined'){
									vm.archivecounterschartdata[Object.keys(value1).indexOf(key)] = [];
								}
								if(typeof(vm.archivecounterschartdata[Object.keys(value1).indexOf(key)][index]) == 'undefined'){
									vm.archivecounterschartdata[Object.keys(value1).indexOf(key)][index] = [];
								}
								vm.archivecounterschartdata[Object.keys(value1).indexOf(key)][index] = value2;
							});
						});

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
			legend: {
				display: false
			},
			animation: {
				duration: 0
			},
		};


var interval = $interval(function () {vm.getLiveCustomerChartData()}, vm.max);
var interval2 = $interval(function () {vm.setcustomerprogressbarvalue()}, 1000);

vm.setcustomerprogressbarvalue = function() {
	if(vm.dynamic>0){
		vm.dynamic = (vm.dynamic - 1000);
	}
	else {
		vm.dynamic = 59000;
	}
}

vm.getLiveCustomerChartData = function() {
	if(vm.mockdata[vm.mockdata.length-1]!=undefined) {
		$http.get('/getcustomermutations/' + $routeParams.servername + '/' + vm.mockdata[vm.mockdata.length-1].RemoteQueuedMetricKey)
			.success(function(data) {
				console.log('updating '+data.length+' records...');
				var tmplength = 0;
				if (vm.data[0].length) {
					tmplength = vm.data[0].length;

					vm.labels = vm.labels.slice(data.length);
					vm.data[0] = vm.data[0].slice(data.length);
					vm.data[1] = vm.data[1].slice(data.length);
					vm.mockdata = vm.mockdata.slice(data.length);

					_.each(vm.metricschartdata,function(value,index){
						if(typeof(vm.metricschartdata[index]) == 'object'){
							vm.metricschartdata[index].slice(data.length);
						}
					});
				}

				for (var i=0;vm.data[0].length < tmplength;i++) {
					vm.labels.push(data[i].RemoteQueuedMetricKey);
					vm.mockdata.push(data[i])

					vm.data[0].push(data[i].MetricValue);
					vm.data[1].push(data[i].ThresholdValue);


					_.each(data[i],function(obj,index){
						if(_.isMatch(data[i],{Metric:'Lots_Real'})){
							if(typeof(vm.metricschartdata[0]) == 'undefined'){
								vm.metricschartseries.push('Lots_Real_Value');
								vm.metricschartseries.push('Lots_Real_Threshold');
								vm.metricschartdata[0] = [];
								vm.metricschartdata[1] = [];
							}
							vm.metricschartdata[0][index] = data[i].MetricValue;
							vm.metricschartdata[1][index] = data[i].ThresholdValue;
						}
						if(_.isMatch(data[i],{Metric:'Lots_Virtual'})){
							if(typeof(vm.metricschartdata[2]) == 'undefined'){
								vm.metricschartseries.push('Lots_Virtual_Value');
								vm.metricschartseries.push('Lots_Virtual_Threshold');
								vm.metricschartdata[2] = [];
								vm.metricschartdata[3] = [];
							}
							vm.metricschartdata[2][index] = data[i].MetricValue;
							vm.metricschartdata[3][index] = data[i].ThresholdValue;
						}
						vm.metricschartlabels[index] = data[i].Timestamp;
					});
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
		$interval.cancel(interval2);
	});
}

// helpers
function getRandomValue (data) {
	var l = data.length, previous = l ? data[l - 1] : 50;
	var y = previous + Math.random() * 10 - 5;
	return y < 0 ? 0 : y > 100 ? 100 : y;
}
