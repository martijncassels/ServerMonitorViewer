'use strict';

/* Controllers */
angular

.module('ServerMonitorViewer.ReportCtrl',[])

.controller('ReportCtrl', ReportCtrl);

ReportCtrl.$inject = ['$scope', '$route','$http','$interval','$routeParams'];

function ReportCtrl($scope,$route,$http,$interval,$routeParams) {
		var vm = this;
		vm.title = '';
		vm.alias = $routeParams.alias;
		vm.db = $routeParams.db;
		vm.servername = $routeParams.servername;

		vm.weekstats = [];

		vm.max = 60000;
		vm.dynamic = vm.max;
		vm.datefrom = new Date();
		vm.dateuntil = new Date();

		vm.today = function() {
			vm.datefrom = new Date();
		};
		//vm.today();


		vm.clear = function() {
			vm.datefrom = null;
		};

		vm.inlineOptions = {
			customClass: getDayClass,
			minDate: new Date(),
			showWeeks: true
		};

		vm.dateOptions = {
			dateDisabled: disabled,
			formatYear: 'yy',
			maxDate: new Date(2020, 5, 22),
			minDate: new Date(),
			startingDay: 1
		};

		// Disable weekend selection
		function disabled(data) {
			var date = data.date,
				mode = data.mode;
			return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
		}

		vm.toggleMin = function() {
			vm.inlineOptions.minDate = vm.inlineOptions.minDate ? null : new Date();
			vm.dateOptions.minDate = vm.inlineOptions.minDate;
		};

		vm.toggleMin();

		vm.open1 = function() {
			vm.popup1.opened = true;
		};

		vm.open2 = function() {
			vm.popup2.opened = true;
		};

		vm.setDate = function(year, month, day) {
			vm.dt = new Date(year, month, day);
			vm.datefrom = new Date(year, month, day);
			vm.dateuntil = new Date(year, month, day);
		};

		vm.formats = ['yyyy-MM-dd HH:mm:ss', 'dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		vm.format = vm.formats[0];
		//vm.altInputFormats = ['M!/d!/yyyy'];
		vm.altInputFormats = ['yyyy-mm-dd HH:mm:ss'];

		vm.popup1 = {
			opened: false
		};

		vm.popup2 = {
			opened: false
		};

		var tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		var afterTomorrow = new Date();
		afterTomorrow.setDate(tomorrow.getDate() + 1);
		vm.events = [
			{
				date: tomorrow,
				status: 'full'
			},
			{
				date: afterTomorrow,
				status: 'partially'
			}
		];

	function getDayClass(data) {
		var date = data.date,
			mode = data.mode;
		if (mode === 'day') {
			var dayToCheck = new Date(date).setHours(0,0,0,0);

			for (var i = 0; i < vm.events.length; i++) {
				var currentDay = new Date(vm.events[i].date).setHours(0,0,0,0);

				if (dayToCheck === currentDay) {
					return vm.events[i].status;
				}
			}
		}

		return '';
	}

		//- Get blocking
		vm.weekstatsstarting = true;
		vm.callWeekstats = function(){
			// $http.get('/reporting/getweekstats/'+$routeParams.alias + '/' + $routeParams.db + '/' + vm.datefrom + '/' + vm.dateuntil)
			// 	.success(function(data) {
			// 		_.each(data,function(value1,index){
			// 			_.each(value1,function(value2,key){
			// 				if(["MeasureTime"].indexOf(key) != -1){
			// 					data[index][key] = moment(value2).utc().format('DD-MM-YYYY hh:mm:ss');
			// 				}
			// 			});
			// 		});
			// 		vm.weekstatsstarting = false;
			// 		vm.weekstats = data;
			// 	})
			// 	.error(function(data) {
			// 		vm.error = data;
			// 	});
			// }
			$http.post('/reporting/getweekstats/'+$routeParams.alias + '/' + $routeParams.db,{
				datefrom: vm.datefrom,
				dateuntil: vm.dateuntil
			})
			.success(function(data) {
				_.each(data,function(value1,index){
					_.each(value1,function(value2,key){
						if(["MeasureTime"].indexOf(key) != -1){
							data[index][key] = moment(value2).utc().format('DD-MM-YYYY hh:mm:ss');
						}
					});
				});
				vm.weekstatsstarting = false;
				vm.weekstats = data;
				vm.weekstats_totalItems = vm.weekstats.length;
				vm.weekstats_currentPage = 1;
				vm.weekstats_viewby = 10;
				vm.weekstats_itemsPerPage = vm.weekstats_viewby;
				vm.weekstats_maxSize = 5;
				vm.setweekstats_ItemsPerPage = function(num) {
					vm.weekstats_itemsPerPage = num;
					vm.weekstats_currentPage = 1; //reset to first page
				}
			})
			.error(function(data) {
				vm.error = data;
			});
		}
}
