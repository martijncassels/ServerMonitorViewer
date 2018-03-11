'use strict';

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular

.module('ServerMonitorViewer.services', [])

.value('version', '3.0.1')
.factory('_', _)
.factory('Helpers',Helpers)

_.$inject = ['$window'];
//Helpers.inject = [];

function _($window) {
	return $window._; // assumes underscore has already been loaded on the page
}

function Helpers() {
	var vm = {};
	return {
		// Parse SQL Timestamps to a more readable format using momentjs
		parseTimestamps: function (input){
			_.each(input,function(value1,index){
				_.each(value1,function(value2,key){
					if(["Timestamp","CounterTimestamp","LoggedTimeStamp","Date"].indexOf(key) != -1){
						input[index][key] = moment(value2).utc().format('DD-MM-YYYY HH:mm:ss');
					}
				});
			});
			return input;
		}
	}
}
