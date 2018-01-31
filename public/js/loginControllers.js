'use strict';

angular

.module('ServerMonitorViewer.Logincontrollers',[])
//function loginController($scope, $location, AuthService) {
.controller('loginController', loginController)
.controller('logoutController', logoutController)
.controller('registerController', registerController);

loginController.$inject = ['$scope', '$location', 'AuthService'];
logoutController.$inject = ['$scope', '$location', 'AuthService'];
registerController.$inject = ['$scope', '$location', 'AuthService'];

function loginController($scope, $location, AuthService) {

    $scope.login = function () {

      // initial values
      $scope.error = false;
      $scope.disabled = true;

      // call login from service
      AuthService.login($scope.loginForm.username, $scope.loginForm.password)
        // handle success
        .then(function () {
          $location.path('/messages');
          $scope.disabled = false;
          $scope.loginForm = {};
        })
        // handle error
        .catch(function () {
          $scope.error = true;
          $scope.errorMessage = "Invalid username and/or password";
          $scope.disabled = false;
          $scope.loginForm = {};
        });

    };
//}
}
//loginController.$inject = ['$scope', '$location', 'AuthService'];
//function logoutController($scope, $location, AuthService) {
function logoutController($scope, $location, AuthService) {

    $scope.logout = function () {

      // call logout from service
      AuthService.logout()
        .then(function () {
          $location.path('/login');
        });

    };
//}
}
//logoutController.$inject = ['$scope', '$location', 'AuthService'];

//function registerController($scope, $location, AuthService) {
function registerController($scope, $location, AuthService) {

    $scope.register = function () {

      // initial values
      $scope.error = false;
      $scope.disabled = true;

      // call register from service
      AuthService.register(
          $scope.registerForm.username,
          $scope.registerForm.password,
          $scope.registerForm.firstname,
          $scope.registerForm.lastname,
          $scope.registerForm.skill1,
          $scope.registerForm.skill2,
          $scope.registerForm.skill3,
          $scope.registerForm.skill4,
          $scope.registerForm.skill5
          )
        // handle success
        .then(function () {
          $location.path('/login');
          $scope.disabled = false;
          $scope.registerForm = {};
          $scope.formData = {};
        })
        // handle error
        .catch(function () {
          $scope.error = true;
          $scope.errorMessage = "Something went wrong!";
          $scope.disabled = false;
          $scope.registerForm = {};
        });

    };
//}
}
//registerController.$inject = ['$scope', '$location', 'AuthService'];
