'use strict';

/* Controllers */
angular

.module('ServerMonitorViewer.controllers',[])

.controller('MainCtrl', MainCtrl)
.controller('HomeCtrl', HomeCtrl)
.controller('ServerCtrl', ServerCtrl);

MainCtrl.$inject = ['$scope','$http','_'];
HomeCtrl.$inject = ['$scope', '$route','$http','$interval'];
ServerCtrl.$inject = ['$scope', '$route','$http','$interval','$routeParams','$interval'];

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
		//vm.servers = [];
		vm.series = [];
		vm.data2 = [[],[]];
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

function ServerCtrl($scope,$route,$http,$interval,$routeParams) {
		var vm = this;
		vm.title = '';
		vm.mockdata = [];
		vm.series = ['MetricValue','ThresholdValue']
		vm.licenses = [];
		vm.archivecounters = [];
		vm.archivecounterschartdata = [];
		vm.archivecounterschartdataselection = [];
		vm.archivecounterschartseries = ["ArchiveCounterKey","CounterTimestamp","OrderCount","OrderRowCount","PartyCount","PartyVirtualCount","PartyMutationCount","ExinvoiceCount","PricelistCount","PricelistRowCount","VPSupplylineCount","PartyTransactionCount"];
		vm.archivecounterschartseriesselection = ["ArchiveCounterKey","CounterTimestamp","OrderCount","OrderRowCount","PartyCount","PartyVirtualCount","PartyMutationCount","ExinvoiceCount","PricelistCount","PricelistRowCount","VPSupplylineCount","PartyTransactionCount"];
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
		vm.etradeservercounters = [];
		vm.etradeservercounterdata = [[],[]];
		vm.etradeservercounterlabels = [];
		vm.customerentitycounts = [];
		vm.customerentitycountdata = [];
		vm.customerentitycountseries = ["ID","Timestamp","TotalLots","RealLots","VirtualLots","VirtualLotsToBeDeleted","TotalOrders","TotalOrderRows","ABSOrders","ABSOrderRows","WebShopOrders","WebShopOrderRows","ProductionOrders","ProductionOrderRows","PCCPTotal","PCCPToBeCalculated","VPSupplyLineTotal","TotalPricelists","TotalPricelistRows"];
		vm.customerentitycountseriesselection = ["ID","Timestamp","TotalLots","RealLots","VirtualLots","VirtualLotsToBeDeleted","TotalOrders","TotalOrderRows","ABSOrders","ABSOrderRows","WebShopOrders","WebShopOrderRows","ProductionOrders","ProductionOrderRows","PCCPTotal","PCCPToBeCalculated","VPSupplyLineTotal","TotalPricelists","TotalPricelistRows"];
		vm.max = 60000;
		vm.dynamic = vm.max;

		$http.get('/getcustomermetrics/'+$routeParams.servername+'/'+$routeParams.alias)
				.success(function(data) {
						_.each(data,function(value1,index){
							_.each(value1,function(value2,key){
								if(["Timestamp"].indexOf(key) != -1){
									data[index][key] = moment(value2).format('DD-MM-YYYY hh:mm:ss');
								}
							});
						});
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
							vm.db = 'none';
				}
		/*
		switch($routeParams.alias) {
		case 'UFE':
			vm.db = 'none';
			break;
		case 'AVH':
			vm.db = 'none';
			break;
		case 'BHF':
			vm.db = 'none';
			break;
		case 'DRC':
			vm.db = 'none';
			break;
		case 'FAR':
			vm.db = 'none';
			break;
		case 'PRF':
			vm.db = 'none';
			break;
		case 'CAT':
			vm.db = 'none';
			break;
		case 'ALG':
			vm.db = 'FlowerCore';
			break;
		case 'IPP':
			vm.db = 'Axerrio';
			break;
		case 'B2K':
			vm.db = 'B2K_ABS';
			break;
		case 'BUS':
			vm.db = 'BUS_ABS';
			break;
		case 'HBM':
			vm.db = 'HBM_ABS';
			break;
		case 'FGG':
			vm.db = 'FGG_ABS';
			break;
		case 'A4Y':
			vm.db = 'A4Y_ABS';
			break;
		case 'BYF':
			vm.db = 'BYF_ABS';
			break;
		case 'DHC':
			vm.db = 'none';
			break;
		case 'DUD':
			vm.db = 'ABSDutchDirect';
			break;
		case 'GTX':
			vm.db = 'FloraBoxGermany';
			break;
		case 'BRU':
			vm.db = 'BRU_ABS';
			break;
		case 'LIN':
			vm.db = 'none';
			break;
		case 'PFC':
			vm.db = 'none';
			break;
		case 'PJO':
			vm.db = 'none';
			break;
		case 'PKF':
			vm.db = 'none';
			break;
		case 'SMA':
			vm.db = 'ABSSmalbil';
			break;
		case 'UNI':
			vm.db = 'none';
			break;
		case 'PHY':
			vm.db = 'ABSPHY';
			break;
		case 'EZF':
			vm.db = 'EZF_ABS';
			break;
		case 'BAR':
			vm.db = 'Axerrio';
			break;
		case 'BEA':
			vm.db = 'none';
			break;
		case 'FCA':
			vm.db = 'FlowerCore';
			break;
		case 'BLO':
			vm.db = 'BLO_ABS';
			break;
		case 'CEL':
			vm.db = 'Axerrio';
			break;
		case 'GRA':
			vm.db = 'Axerrio';
			break;
		case 'HUS':
			vm.db = 'ABSHUS';
			break;
		case 'HOL':
			vm.db = 'FlowerCore';
			break;
		case 'VIL':
			vm.db = 'VIL_ABS';
			break;
		case 'VPR':
			vm.db = 'VPR_ABS';
			break;
		case 'VKL':
			vm.db = 'VKL_ABS';
			break;
		case 'VKA':
			vm.db = 'VKA_ABS';
			break;
		case 'KEM':
			vm.db = 'Axerrio';
			break;
		case 'TUN':
			vm.db = 'Axerrio';
			break;
		case 'VAB':
			vm.db = 'Axerrio';
			break;
		case 'VAS':
			vm.db = 'Axerrio';
			break;
		case 'VAT':
			vm.db = 'Axerrio';
			break;
		case 'VBI':
			vm.db = 'Axerrio';
			break;
		case 'VGA':
			vm.db = 'Axerrio';
			break;
		case 'VIN':
			vm.db = 'Axerrio';
			break;
		case 'VIS':
			vm.db = 'Axerrio';
			break;
		case 'VNO':
			vm.db = 'Axerrio';
			break;
		case 'VRI':
			vm.db = 'Axerrio';
			break;
		case 'VSO':
			vm.db = 'Axerrio';
			break;
		case 'VST':
			vm.db = 'Axerrio';
			break;
		case 'VVB':
			vm.db = 'ABSBloemen';
			break;
		case 'VNY':
			vm.db = 'Axerrio';
			break;
		case 'VVD':
			vm.db = 'Axerrio';
			break;
		case 'VVE':
			vm.db = 'Axerrio';
			break;
		case 'VVS':
			vm.db = 'VVSA';
			break;
		case 'VVG':
			vm.db = 'Axerrio';
			break;
		case 'VVH':
			vm.db = 'Axerrio';
			break;
		case 'VVL':
			vm.db = 'AXERRIO';
			break;
		case 'VVM':
			vm.db = 'Axerrio';
			break;
		case 'VVN':
			vm.db = 'Axerrio';
			break;
		case 'VVP':
			vm.db = 'FCPotplants';
			break;
		case 'VVZ':
			vm.db = 'Axerrio';
			break;
		default:
			vm.db = 'none';
		}
		*/

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

		//- get etrade server counters
		vm.etradeservercountersstarting = true;
		$http.get('/getetradeservercounter/'+$routeParams.alias+'/'+vm.db)
				.success(function(data) {
					_.each(data,function(value1,index){
						_.each(value1,function(value2,key){
							if(["LoggedTimestamp"].indexOf(key) != -1){
								data[index][key] = moment(value2).format('DD-MM-YYYY hh:mm:ss');
							}
						});
					});
					//console.log(data);
					// if(data.name=="SequelizeDatabaseError") {
					// 	vm.etradeservercountererror = true;
					// }
					//else {
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
					_.each(data,function(value1,index){
						_.each(value1,function(value2,key){
							if(["Timestamp"].indexOf(key) != -1){
								data[index][key] = moment(value2).format('DD-MM-YYYY hh:mm:ss');
							}
						});
					});
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
						_.each(data,function(value1,index){
							_.each(value1,function(value2,key){
								if(["CounterTimestamp"].indexOf(key) != -1){
									data[index][key] = moment(value2).format('DD-MM-YYYY hh:mm:ss');
								}
							});
						});
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
							vm.archivecounterschartdataselection.push(vm.archivecounterschartdata[i]);
						}
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});
		//- function to select/view data in chart
		vm.toggleArchiveSelection = function toggleArchiveSelection(serie,name) {
			var idx = vm.archivecounterschartdataselection.indexOf(serie);
	    if (idx > -1) {
				vm.archivecounterschartdataselection.splice(idx, 1);
				vm.archivecounterschartseriesselection.splice(idx, 1);
	    }
	    else {
				vm.archivecounterschartdataselection.push(serie);
				vm.archivecounterschartseriesselection.push(name);
	    }
	  };

		//- get entitycounters
		vm.customerentitycountsstarting = true;
		$http.get('/getcustomerentitycounts/'+$routeParams.alias+'/'+vm.db)
				.success(function(data) {
					_.each(data,function(value1,index){
						_.each(value1,function(value2,key){
							if(["Timestamp"].indexOf(key) != -1){
								data[index][key] = moment(value2).format('DD-MM-YYYY hh:mm:ss');
							}
						});
					});
					vm.customerentitycountsstarting = true;
						vm.customerentitycountdataselection = [];
						vm.customerentitycounts = data;
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
							vm.customerentitycountdataselection.push(vm.customerentitycountdata[i]);
						}
				})
				.error(function(data) {
						console.log('Error: ' + data);
						vm.error = data;
				});

		//- function to select/view data in chart
	  vm.toggleEntitySelection = function toggleEntitySelection(serie,name) {
			var idx = vm.customerentitycountdataselection.indexOf(serie);
	    if (idx > -1) {
				vm.customerentitycountdataselection.splice(idx, 1);
				vm.customerentitycountseriesselection.splice(idx, 1);
	    }
	    else {
				vm.customerentitycountdataselection.push(serie);
				vm.customerentitycountseriesselection.push(name);
	    }
	  };

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
				display: true
			},
			animation: {
				duration: 0
			}
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
				_.each(data,function(value1,index){
					_.each(value1,function(value2,key){
						if(["Timestamp"].indexOf(key) != -1){
							data[index][key] = moment(value2).format('DD-MM-YYYY hh:mm:ss');
						}
					});
				});
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
