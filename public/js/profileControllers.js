angular

.module('ServerMonitorViewer.Profilecontrollers',[])

.controller('ProfileCtrl', ProfileCtrl)
.controller('PrfViewCtrl', PrfViewCtrl)
.controller('PrfUpdateCtrl', PrfUpdateCtrl);

ProfileCtrl.$inject = ['$scope', '$http', 'AuthService'];
PrfViewCtrl.$inject = ['$scope', '$http', '$routeParams', '$location', 'AuthService'];
PrfUpdateCtrl.$inject = ['$scope', '$http', '$routeParams', '$location'];

function ProfileCtrl($scope, $http, AuthService) {
  var vm = this;
    //$scope.isLoggedIn = AuthService.isLoggedIn();

    AuthService.getUserStatus().then(function(data){
        if(AuthService.isLoggedIn()) {
          vm.activeuser = data.data.user;
        }
    });

    $http.get('/api/profiles')
        .success(function(data) {
            vm.profiles = data;
            //console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
            vm.error = data;
        });

    // when submitting the add form, send the text to the node API
    // $scope.createProfile = function() {
    //     $http.post('/api/profiles', $scope.formData)
    //         .success(function(data) {
    //             $scope.formData = {}; // clear the form so our user is ready to enter another
    //             $scope.profiles = data;
    //             //console.log(data);
    //         })
    //         .error(function(data) {
    //             console.log('Error: ' + data);
    //         });
    // };
    //
    // // delete a todo after checking it
    vm.deleteProfile = function(id) {
        $http.delete('/api/profiles/' + id)
            .success(function(data) {
                vm.profiles = data;
                //console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
                vm.error = data;
            });
    };
//}
}

//function PrfViewCtrl($scope, $http, $routeParams) {
function PrfViewCtrl($scope, $http, $routeParams, $location, AuthService) {

    AuthService.getUserStatus().then(function(data){
        if(AuthService.isLoggedIn()) {
          $scope.activeuser = data.data.user;
        }
    });

    $scope.labels = [];
    $scope.data = [];
    $http.get('/api/profiles/' + $routeParams.id)
        .success(function(data) {
            $scope.profiles = data;
            angular.forEach($scope.profiles.skills,function(value,key){
                $scope.labels.push(value.name);
                $scope.data.push(value.value)
            });
            $scope.series = ['values'];

            //$scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
            $scope.options = {
                scales: {
                    yAxes: [{
                        ticks : {
                            min: 0,
                            max: 6,
                            stepSize: 1
                        }
                    }]
                }
            };
            $scope.options2 = {
                scale: {
                    ticks : {
                        min: 0,
                        max: 6,
                        stepSize: 1
                    }
                }
            };
            //console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
            vm.error = data;
        });

    // delete a todo after checking it
    $scope.deleteProfile = function(id) {
        $http.delete('/api/profiles/' + id)
            .success(function(data) {
                $scope.profiles = data;
                $location.path('/profiles');
            })
            .error(function(data) {
                console.log('Error: ' + data);
                vm.error = data;
            });
    }
}

//function PrfUpdateCtrl($scope, $http, $routeParams) {
function PrfUpdateCtrl($scope, $http, $routeParams, $location) {
    //$scope.isLoggedIn = AuthService.isLoggedIn();
    //$scope.formData4 = {};
    $http.get('/api/profiles/' + $routeParams.id)
        .success(function(data) {
            if(!data.avatar) {
                $scope.genderoption = 'male';
                $scope.avatarIDoption = 1;
            } else {
                $scope.genderoption = data.avatar.gender;
                $scope.avatarIDoption = data.avatar.avatarID;
            }
            $scope.gender = ['male','female'];
            $scope.avatarID = [];
            for (var i = 1; i < 114; i++) {
                $scope.avatarID.push(i);
            }
            $scope.profile = data;

            $http.get('/api/factories')
                .success(function(data2) {
                    $scope.factories = data2;
                })
                .error(function(data2) {
                    console.log('Error: ' + data2);
                });
        })
        .error(function(data) {
            console.log('Error: ' + data);
            vm.error = data;
        });



    $scope.updateProfile = function(id) {
        $http({
            method      : 'PUT',
            url         : '/api/profiles/' + $routeParams.id,
            data        : $scope.formData4,
            header      : { 'Content-Type': 'application/json' }
            })
            .success(function(data) {
                $scope.formData4 = data;
                $scope.success = 'done updating profile!';
                $location.path('profiles/view/' + $routeParams.id);
            })
            .error(function(data) {
                $scope.error = 'error updating profile!';
                console.log('Error: ' + data);
            });
    };
//}
}
