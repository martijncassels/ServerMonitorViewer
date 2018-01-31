'use strict';

angular

.module('ServerMonitorViewer.controllers')

.filter('isObj', isObj)
.controller('AdminCtrl', AdminCtrl);

// Inject my dependencies
AdminCtrl.$inject = ['$scope', '$http', '$routeParams'];

function isObj() {
        var bar;
        return function (obj) {
            for (bar in obj) {
                if (obj.hasOwnProperty(bar)) {
                    return false;
                }
            }
            return true;
        };
    }
// Now create our controller function with all necessary logic
function AdminCtrl($scope, $http, $routeParams) {
	var vm = this;
    vm.data = [];
    vm.labels = [];
    vm.series = [];
    vm.options = {};

  	$http.get('/api/admin/msgstats')
        .success(function(data) {
            vm.stats = data;
            // http://jtblin.github.io/angular-chart.js/
            angular.forEach(data.msgcreated,function(value,key){
                vm.labels.push(value._id.date);
                vm.data.push(value.count)
            });
            vm.series = ['count'];
            vm.options = {
                scales: {
                    yAxes: [{
                        ticks : {
                            min: 0,
                            max: (Math.ceil(_.max(vm.data)*1.05)), //+5% and round up for sake of chart's range
                            //max: 6,
                            stepSize: Math.round(_.max(vm.data)/5) // max value / 5 for nice grid lines
                        }
                    }]
                }
            };
            //console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
            vm.error = data;
        });

    // $http.get('/api/admin/prostats')
    //     .success(function(data) {
    //         vm.prostats = data;
    //         //console.log(data);
    //     })
    //     .error(function(data) {
    //         console.log('Error: ' + data);
    //     });
}
