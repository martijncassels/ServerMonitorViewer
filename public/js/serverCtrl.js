'use strict';

/* Controllers */
angular

.module('ServerMonitorViewer.ServerCtrl',[])

.controller('ServerCtrl', ServerCtrl);

ServerCtrl.$inject = ['$scope','$route','$http','$interval','$routeParams','_','Helpers'];

function ServerCtrl($scope,$route,$http,$interval,$routeParams,_,Helpers) {
		var vm = this;
		vm.title = '';
		vm.alias = $routeParams.alias;
		vm.db = $routeParams.db;
		vm.servername = $routeParams.servername;
		vm.mockdata = [];
		vm.series = ['MetricValue','ThresholdValue']
		vm.licenses = [];
		vm.thresholds = [];
		vm.archivecounters = [];
		vm.archivecounterschartdata = [];
		//vm.archivecounterschartdataselection = [];
		vm.archivecounterschartseries = ["ArchiveCounterKey","CounterTimestamp","OrderCount","OrderRowCount","PartyCount","PartyVirtualCount","PartyMutationCount","ExinvoiceCount","PricelistCount","PricelistRowCount","VPSupplylineCount","PartyTransactionCount"];
		//vm.archivecounterschartseriesselection = ["ArchiveCounterKey","CounterTimestamp","OrderCount","OrderRowCount","PartyCount","PartyVirtualCount","PartyMutationCount","ExinvoiceCount","PricelistCount","PricelistRowCount","VPSupplylineCount","PartyTransactionCount"];
		vm.metricschartdata = [];
		vm.metricschartseries = [];
		vm.metricschartlabels = [];
		vm.metricsdatasetOverride = [];
		vm.getvirtualmarketplacemutations = [];
		vm.servers = [];
		vm.data = [[],[]];
		vm.labels = [];
		vm.pccpcalcss = [];
		vm.pccpcalcssdata = [];
		vm.pccpcalcsslabels = [];
		vm.cpu_ = [];
		vm.cpu_data = [];
		vm.cpu_labels = [];
		vm.cpu_chartdata = [];
		vm.cpu_series = 'CPU';
		vm.etradeservercounters = [];
		vm.etradeservercounterdata = [[],[]];
		vm.etradeservercounterlabels = [];
		vm.customerentitycounts = [];
		vm.customerentitycountdata = [];
		vm.customerentitycountseries = ["ID","Timestamp","TotalLots","RealLots","VirtualLots","VirtualLotsToBeDeleted","TotalOrders","TotalOrderRows","ABSOrders","ABSOrderRows","WebShopOrders","WebShopOrderRows","ProductionOrders","ProductionOrderRows","PCCPTotal","PCCPToBeCalculated","VPSupplyLineTotal","TotalPricelists","TotalPricelistRows"];
		//vm.customerentitycountseriesselection = ["ID","Timestamp","TotalLots","RealLots","VirtualLots","VirtualLotsToBeDeleted","TotalOrders","TotalOrderRows","ABSOrders","ABSOrderRows","WebShopOrders","WebShopOrderRows","ProductionOrders","ProductionOrderRows","PCCPTotal","PCCPToBeCalculated","VPSupplyLineTotal","TotalPricelists","TotalPricelistRows"];
		vm.max = 60000;
		vm.dynamic = vm.max;
		vm.isCollapsed = false;

		$http.get('/getcustomermetrics/'+$routeParams.servername+'/'+$routeParams.alias+'/'+$routeParams.db)
				.success(function(data) {
						data = Helpers.parseTimestamps(data);
						vm.mockdata = data;
						vm.mockdata.reverse();
						for(var i=0;i<vm.mockdata.length;i++){
							vm.data[0].push(vm.mockdata[i].MetricValue);
							vm.data[1].push(vm.mockdata[i].ThresholdValue);
							vm.labels.push(vm.mockdata[i].RemoteQueuedMetricKey);
						}
						//- iterate over all metrics
						_.each(data,function(obj,index){
							//- check kind of metric and push into array
							//- repeat this for a new metric
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
							vm.db = $routeParams.db;
				}

		//- Get active license useage
		vm.licensesstarting = true;
		$http.get('/getlicenses/'+$routeParams.alias+'/'+vm.db)
				.success(function(data) {
						vm.licensesstarting = false;
						vm.licenses = data;
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});

		//- Get disc space
		vm.diskspacestarting = true;
		$http.get('/getdiskspace/'+$routeParams.alias+'/'+vm.db)
				.success(function(data) {
						vm.diskspacestarting = false;
						vm.diskspace = data;
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});

		//- Get top 10 errors
		vm.top10errorsstarting = true;
		$http.get('/gettop10errors/'+$routeParams.alias+'/'+vm.db)
				.success(function(data) {
						vm.top10errorsstarting = false;
						vm.top10errors = data;
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});

		//- Get thresholds
		vm.thresholdsstarting = true;
		$http.get('/getthresholds/'+$routeParams.alias+'/'+vm.db)
				.success(function(data) {
						vm.thresholdsstarting = false;
						vm.thresholds = data;
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});
		vm.updateThreshold = function(key,value) {
			$http.put('/updatethreshold/' + $routeParams.alias + '/' + vm.db + '/' + key + '/' + value)
				.success(function(data) {
					vm.success = true;
				})
				.error(function(data) {
						vm.error = 'error updating message!';
						console.log('Error: ' + data);
				});
		}

		//- get vmp calculations
		vm.pccpcalcssdatastarting = true;
		$http.get('/getpccpcalcs/'+$routeParams.alias+'/'+vm.db)
				.success(function(data) {
						vm.pccpcalcssdatastarting = false;
						vm.pccpcalcss = data;

						for(var i=0;i<data.length;i++){
							vm.pccpcalcssdata.push(data[i].ToCalculate);
							vm.pccpcalcsslabels.push(data[i].Description);
						}
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});

		//- get cpu metrics
		vm.cpu_starting = true;
		$http.get('/getcpu/'+$routeParams.alias+'/'+vm.db+'/new')
				.success(function(data) {
					data = Helpers.parseTimestamps(data);
					var tmpdata = data.reverse();
					vm.cpu_starting = false;
					vm.cpu_ = data;

					_.each(data,function(value1,index){
						_.each(value1,function(value2,key){
							if(typeof(vm.cpu_chartdata[Object.keys(value1).indexOf(key)]) == 'undefined'){
								vm.cpu_chartdata[Object.keys(value1).indexOf(key)] = [];
							}
							if(typeof(vm.cpu_chartdata[Object.keys(value1).indexOf(key)][index]) == 'undefined'){
								vm.cpu_chartdata[Object.keys(value1).indexOf(key)][index] = [];
							}
							vm.cpu_chartdata[Object.keys(value1).indexOf(key)][index] = value2;
						});
					});
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});

		//- get etrade server counters
		vm.etradeservercountersstarting = true;
		$http.get('/getetradeservercounter/'+$routeParams.alias+'/'+vm.db)
				.success(function(data) {
					data = Helpers.parseTimestamps(data);

						vm.etradeservercountersstarting = false;
						vm.etradeservercounters = data;

						for(var i=0;i<data.length;i++){
							vm.etradeservercounterdata[0].push(data[i].NumberOfSuccesfullPurchases);
							vm.etradeservercounterdata[1].push(data[i].NumberOfFailedPurchases);
							vm.etradeservercounterlabels.push(data[i].Remark+", Timestamp: "+data[i].LoggedTimeStamp);
						}
						vm.etradeservercounterdata[0].reverse();
						vm.etradeservercounterdata[1].reverse();
						vm.etradeservercounterlabels.reverse();
					//}
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});

		//- get vmp mutation counters
		vm.getvirtualmarketplacemutationsstarting = true;
		$http.get('/getvirtualmarketplacemutations/'+$routeParams.alias+'/'+vm.db)
				.success(function(data) {
					data = Helpers.parseTimestamps(data);
					vm.getvirtualmarketplacemutationsstarting = false;
					vm.getvirtualmarketplacemutations = data;
					vm.getvirtualmarketplacemutationsdata = [[],[],[],[],[]];
					vm.getvirtualmarketplacemutationslabels = [];

						for(var i=0;i<data.length;i++){
							vm.getvirtualmarketplacemutationsdata[0].push(data[i].NewOrMutatedSupplylines);
							vm.getvirtualmarketplacemutationsdata[1].push(data[i].DeletedSupplylines);
							vm.getvirtualmarketplacemutationsdata[2].push(data[i].InsertedParties);
							vm.getvirtualmarketplacemutationsdata[3].push(data[i].InsertedPCCPs);
							vm.getvirtualmarketplacemutationsdata[4].push(data[i].PurchaseAttempts);
							vm.getvirtualmarketplacemutationslabels.push(data[i].Description+" "+data[i].Timestamp);
						}
						vm.getvirtualmarketplacemutationsdata[0].reverse();
						vm.getvirtualmarketplacemutationsdata[1].reverse();
						vm.getvirtualmarketplacemutationsdata[2].reverse();
						vm.getvirtualmarketplacemutationsdata[3].reverse();
						vm.getvirtualmarketplacemutationsdata[4].reverse();
						vm.getvirtualmarketplacemutationslabels.reverse();
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});

		//- get archivecounters
		vm.archivecountersstarting = true;
		$http.get('/getarchivecounters/'+$routeParams.alias+'/'+vm.db)
					.success(function(data) {
						data = Helpers.parseTimestamps(data);
						vm.archivecountersstarting = false;
						vm.archivecounters = data;
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
						for(var i=0;i<vm.archivecounterschartdata.length;i++){
							vm.archivecounterschartdata[i].reverse();
							//vm.archivecounterschartdataselection.push(vm.archivecounterschartdata[i]);
						}
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});

		//- get entitycounters
		vm.customerentitycountsstarting = true;
		$http.get('/getcustomerentitycounts/'+$routeParams.alias+'/'+vm.db)
				.success(function(data) {
					data = Helpers.parseTimestamps(data);
					// vm.customerentitycounts_setPage = function (pageNo) {
					// 	vm.customerentitycounts_currentPage = pageNo;
					// };
					vm.customerentitycountsstarting = true;
					//vm.customerentitycountdataselection = [];
					vm.customerentitycounts = data;
					vm.customerentitycounts_totalItems = vm.customerentitycounts.length;
					vm.customerentitycounts_currentPage = 1;
					vm.customerentitycounts_viewby = 10;
					vm.customerentitycounts_itemsPerPage = vm.customerentitycounts_viewby;
					vm.customerentitycounts_maxSize = 5;
					vm.setcustomerentitycounts_ItemsPerPage = function(num) {
						vm.customerentitycounts_itemsPerPage = num;
						vm.customerentitycounts_currentPage = 1; //reset to first page
					}
					_.each(data,function(value1,index){
						_.each(value1,function(value2,key){
							if(typeof(vm.customerentitycountdata[Object.keys(value1).indexOf(key)]) == 'undefined'){
								vm.customerentitycountdata[Object.keys(value1).indexOf(key)] = [];
							}
							if(typeof(vm.customerentitycountdata[Object.keys(value1).indexOf(key)][index]) == 'undefined'){
								vm.customerentitycountdata[Object.keys(value1).indexOf(key)][index] = [];
							}
							if(value2!=null){
								vm.customerentitycountdata[Object.keys(value1).indexOf(key)][index] = value2;
							}
							else {
								vm.customerentitycountdata[Object.keys(value1).indexOf(key)][index] = 0;
							}
						});
					});
					for(var i=0;i<vm.customerentitycountdata.length;i++){
						vm.customerentitycountdata[i].reverse();
						//vm.customerentitycountdataselection.push(vm.customerentitycountdata[i]);
					}
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});

		vm.onClick = function (points, evt) {
		};
		//vm.datasetOverride = [{ yAxisID: 'y-axis-1', fill: +1 }, { yAxisID: 'y-axis-2', fill: false }];
		vm.options = {
			scales: {
				gridLines: {
					display: false
				},
				xAxes: [{
					display: true,
					ticks: {
						beginAtZero: true,
						autoSkip: true,
						autoSkipPadding: 15,
						fontSize: 10
					}
				}],
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
			legend: {
				display: true
			},
			animation: {
				duration: 0
			}
		};
		vm.options2 = {
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
							beginAtZero: true,
						}
					}
				]
			},
			legend: {
				display: true
			},
			animation: {
				duration: 0
			}
		};


var interval = $interval(function () {
	vm.getLiveCustomerChartData();
	vm.getlivecpumutations();
}, vm.max);
var interval2 = $interval(function () {
	vm.setcustomerprogressbarvalue();
}, 1000);
var interval3 = $interval(function () {
	vm.getlivecustomerentitycountmutations();
}, (15*60000));

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
		$http.get('/getcustomermutations/'+$routeParams.servername+'/'+$routeParams.alias+'/'+$routeParams.db+'/'+vm.mockdata[vm.mockdata.length-1].RemoteQueuedMetricKey)
			.success(function(data) {
				var tmpdata = data.reverse();
				data = Helpers.parseTimestamps(data);
				console.log('updating '+tmpdata.length+' record(s)...');
				var tmplength = 0;
				if (vm.data[0].length) {
					tmplength = vm.data[0].length;

					vm.labels = vm.labels.slice(tmpdata.length);
					vm.data[0] = vm.data[0].slice(tmpdata.length);
					vm.data[1] = vm.data[1].slice(tmpdata.length);
					vm.mockdata = vm.mockdata.slice(tmpdata.length);

					_.each(vm.metricschartdata,function(value,index){
						if(typeof(vm.metricschartdata[index]) == 'object'){
							vm.metricschartdata[index].slice(tmpdata.length);
						}
					});
				}

				for (var i=0;vm.data[0].length < tmplength;i++) {
					vm.labels.push(tmpdata[i].RemoteQueuedMetricKey);
					vm.mockdata.push(tmpdata[i])

					vm.data[0].push(tmpdata[i].MetricValue);
					vm.data[1].push(tmpdata[i].ThresholdValue);


					_.each(tmpdata[i],function(obj,index){
						if(_.isMatch(tmpdata[i],{Metric:'Lots_Real'})){
							if(typeof(vm.metricschartdata[0]) == 'undefined'){
								vm.metricschartseries.push('Lots_Real_Value');
								vm.metricschartseries.push('Lots_Real_Threshold');
								vm.metricschartdata[0] = [];
								vm.metricschartdata[1] = [];
							}
							vm.metricschartdata[0][index] = tmpdata[i].MetricValue;
							vm.metricschartdata[1][index] = tmpdata[i].ThresholdValue;
						}
						if(_.isMatch(tmpdata[i],{Metric:'Lots_Virtual'})){
							if(typeof(vm.metricschartdata[2]) == 'undefined'){
								vm.metricschartseries.push('Lots_Virtual_Value');
								vm.metricschartseries.push('Lots_Virtual_Threshold');
								vm.metricschartdata[2] = [];
								vm.metricschartdata[3] = [];
							}
							vm.metricschartdata[2][index] = tmpdata[i].MetricValue;
							vm.metricschartdata[3][index] = tmpdata[i].ThresholdValue;
						}
						vm.metricschartlabels[index] = tmpdata[i].Timestamp;
					});
				}
			})
			.error(function(data) {
					console.log('Error: ' + data);
					vm.error = data;
			});
		} // end $http
	} // end if

	vm.getlivecustomerentitycountmutations = function() {
		if(vm.customerentitycounts[0]!=undefined) {
			$http.get('/getcustomerentitycountmutations/' + $routeParams.alias + '/' + vm.db + '/' + vm.customerentitycounts[0].ID)
				.success(function(data) {
					var tmpdata = data;
					vm.customerentitycounts.reverse();
					tmpdata = Helpers.parseTimestamps(tmpdata);
					console.log('updating '+tmpdata.length+' entitycount(s)...');
						for(var i=0;i<vm.customerentitycountdata.length;i++){
							vm.customerentitycountdata[i] = vm.customerentitycountdata[i].slice(tmpdata.length);
						}
						_.each(tmpdata,function(value1,index){
							vm.customerentitycounts = vm.customerentitycounts.slice(1);
							vm.customerentitycounts.push(value1);
							_.each(value1,function(value2,key){
								if(value2!=null){
									vm.customerentitycountdata[Object.keys(value1).indexOf(key)].push(value2);
								}
								else {
									vm.customerentitycountdata[Object.keys(value1).indexOf(key)][index] = 0;
								}
							});
						});
					vm.customerentitycounts.reverse();
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});
			} // end $http
		} // end if

		vm.getlivecpumutations = function() {
			if(vm.cpu_[vm.cpu_.length-1]!=undefined) {
				$http.get('/getcpu/'+$routeParams.alias+'/'+vm.db+'/'+vm.cpu_[vm.cpu_.length-1].MetricValueKey)
					.success(function(data) {
						var tmpdata = data;
						tmpdata = Helpers.parseTimestamps(tmpdata);
						//tmpdata.reverse();
						console.log('updating '+tmpdata.length+' cpu record(s)...');
						for(var i=0;i<vm.cpu_chartdata.length;i++){
							vm.cpu_chartdata[i] = vm.cpu_chartdata[i].slice(tmpdata.length);
						}

						_.each(tmpdata,function(value1,index){
							vm.cpu_.slice(1);
							vm.cpu_.push(value1);
							_.each(value1,function(value2,key){
								if(value2!=null){
									vm.cpu_chartdata[Object.keys(value1).indexOf(key)].push(value2);
								}
								else {
									vm.cpu_chartdata[Object.keys(value1).indexOf(key)][index] = 0;
								}
							});
						});
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
		$interval.cancel(interval3);
		$scope.refresh();
	});
}
