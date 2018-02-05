'use strict';

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular

.module('ServerMonitorViewer.services', [])

.value('version', '3.0.1')
.factory('_', _)

_.$inject = ['$window'];

function _($window) {
  return $window._; // assumes underscore has already been loaded on the page
}
