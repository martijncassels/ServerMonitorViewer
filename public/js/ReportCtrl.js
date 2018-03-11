'use strict';

/* Controllers */
angular

.module('ServerMonitorViewer.ReportCtrl',[])

.controller('ReportCtrl', ReportCtrl);

ReportCtrl.$inject = ['$scope', '$route','$http','$interval','$routeParams','Helpers'];

function ReportCtrl($scope,$route,$http,$interval,$routeParams,Helpers) {
		var vm = this;
		vm.title = '';
		vm.alias = $routeParams.alias;
		vm.db = $routeParams.db;
		vm.servername = $routeParams.servername;

		vm.weekstats = [];

		vm.max = 60000;
		vm.dynamic = vm.max;

		vm.reports = [
			{name: "Invoiced and Payments", sp: "axspFRDInvoicedAndPaymentsPerPeriod"},
			{name: "ICT Per Customer", sp: "axspFRDICTPerCustomerPerPeriod"},
		];
		vm.report = vm.reports[0];

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

		//- Get report data
		vm.reportstarting = true;
		vm.callReport = function(){
			$http.post('/reporting/getreport/'+$routeParams.alias + '/' + $routeParams.db,{
				datefrom: vm.datefrom,
				dateuntil: vm.dateuntil,
				sp: vm.report.sp
			})
			.success(function(data) {
				data = Helpers.parseTimestamps(data);
				vm.reportstarting = false;
				vm.report_data = data;
				vm.report_totalItems = vm.report.length;
				vm.report_currentPage = 1;
				vm.report_viewby = 10;
				vm.report_itemsPerPage = vm.report_viewby;
				vm.report_maxSize = 5;
				vm.setreport_ItemsPerPage = function(num) {
					vm.report_itemsPerPage = num;
					vm.report_currentPage = 1; //reset to first page
				}
			})
			.error(function(data) {
				vm.error = data;
			});
		}
}
