'use strict';

/* Filters */

angular

.module('ServerMonitorViewer.filters', [])

.filter('interpolate', interpolate)
.filter('highlight', highlight);

interpolate.$inject = ['version'];
highlight.$inject = ['$sce'];

function interpolate(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
}

function highlight($sce) {
    return function(text, searchvalue) {
      if (searchvalue) text = text.replace(new RegExp('('+searchvalue+')', 'gi'),
        '<strong>$1</strong>'
      )
      return $sce.trustAsHtml(text)
    }
}
