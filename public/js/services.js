'use strict';

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular

.module('ServerMonitorViewer.services', [])

.value('version', '3.0.1')
.factory('broadcastService', broadcastService)
.service('Search',Search)
.factory('_', _)
.factory('AuthService', AuthService)
.factory('Advert', Advert);

broadcastService.$inject = ['$rootScope'];
Search.$inject = ['$http','broadcastService'];
_.$inject = ['$window'];
AuthService.$inject = ['$q', '$timeout', '$http'];
Advert.$inject = ['$http'];

function broadcastService($rootScope) {
    return {
      send: function(msg, data) {
          $rootScope.$broadcast(msg, data);
      }
    }
}

function Search($http,broadcastService){
	var vm = {};
	return {
		setResults: function(searchForm) {
			// Set results to use in next functions
    	vm.criteria = searchForm.value.$modelValue;
			broadcastService.send('search',vm.criteria);
		},
		getResults: function(page,limit) {
			// Get results; seachresults if set otherwise just all messages
			if(vm.criteria){
				//console.log('sending search results...\nPage: '+page);
				var searchForm = {
					value: vm.criteria
				};
				return $http({
					method      : 'POST',
					url         : '/api/messages/search/'+page+'.'+limit,
					data        : searchForm,
					header      : { 'Content-Type': 'application/json' }
				})
			}
			else {
				//console.log('sending regular results...');
				return $http.get('/api/messages/'+page+'.'+limit)
			}
		},
		getFrontPage: function() {
			// Frontpage function; just certain messages (with attr isfrontpage=true)
			return $http.get('/api/frontpage')
		},
    getCount: function(){
      return $http.get('/api/messages/count')
    }
	}
}

function _($window) {
  return $window._; // assumes underscore has already been loaded on the page
}

function AuthService($q, $timeout, $http) {

    // create user variable
    var user = null,
        profile = null;

    // return available functions for use in the controllers
    return ({
      isLoggedIn: isLoggedIn,
      getUserStatus: getUserStatus,
      getUserStatus2: getUserStatus2,
      //returnUser: returnUser,
      login: login,
      logout: logout,
      register: register
    });

    function isLoggedIn() {
      if(user) {
        return true;
      } else {
        return false;
      }
    }

		// function isAdmin() {
    //   if(user.admin) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // }

    function getUserStatus() {
      return $http.get('/status')
      // handle success
      .success(function (data) {
        if(data.status){
          user = true;
        } else {
          user = false;
        }
      })
      // handle error
      .error(function (data) {
        user = false;
      });
    }

    function getUserStatus2() {
      return $http.get('/status')
      // handle success
      // .success(function (data) {
      //   return data;
      // })
      // // handle error
      // .error(function (data) {
      //   //user = false;
      // });
    }

    // function returnUser() {
    //   return user;
    // }

    function login(username, password) {

      // create a new instance of deferred
      var deferred = $q.defer();

      // send a post request to the server
      $http.post('/login',
        {username: username, password: password})
        // handle success
        .success(function (data, status) {
          if(status === 200 && data.status){
            user = true;
            deferred.resolve();
          } else {
            user = false;
            deferred.reject();
          }
        })
        // handle error
        .error(function (data) {
          user = false;
          deferred.reject();
        });

      // return promise object
      return deferred.promise;

    }

    function logout() {

      // create a new instance of deferred
      var deferred = $q.defer();

      // send a get request to the server
      $http.get('/logout')
        // handle success
        .success(function (data) {
          user = false;
          deferred.resolve();
        })
        // handle error
        .error(function (data) {
          user = false;
          deferred.reject();
        });

      // return promise object
      return deferred.promise;

    }

    function register(username, password, firstname, lastname, skill1, skill2, skill3, skill4, skill5) {

      // create a new instance of deferred
      var deferred = $q.defer();

      // send a post request to the server
      $http.post('/register',
        {
          //username: username, password: password
          username:           username,
          password:           password,
          firstname:          firstname,
          lastname:           lastname,
          skills:    [
              {name: '1',value: skill1},
              {name: '2',value: skill2},
              {name: '3',value: skill3},
              {name: '4',value: skill4},
              {name: '5',value: skill5},
              ]
        })
        // handle success
        .success(function (data, status) {
          if(status === 200 && data.status){
            deferred.resolve();
          } else {
            deferred.reject();
          }
        })
        // handle error
        .error(function (data) {
          deferred.reject();
        });

      // return promise object
      return deferred.promise;
    }
  }
    // Adsterra support
    function Advert($http) {
      return {
    		getAdvert: function() {
          var token = 'c684fb0b40082a4b4687a2fac7edc8bc',
          domain = '79718';
          return $http({
            method      : 'GET',
            url         : 'https://api3.adsterratools.com/publisher/'+token+'/domain/'+domain+'/placements.json',
            //data        : searchForm,
            header      : { 'Content-Type': 'application/json','Access-Control-Allow-Origin': 'localhost' }
          })
    		}
      }
    }
