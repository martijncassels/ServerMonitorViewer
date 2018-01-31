angular

.module('ServerMonitorViewer.Workshopcontrollers',[])

//.controller('workshopCtrl', workshopCtrl)
.controller('WSViewCtrl', WSViewCtrl)
.controller('WSUpdateCtrl',WSUpdateCtrl);

//workshopCtrl.$inject = ['$scope', '$http', '$routeParams', 'AuthService'];
WSViewCtrl.$inject = ['$scope', '$rootScope', '$http', '$routeParams', '$location', 'AuthService'];
WSUpdateCtrl.$inject = ['$scope', '$http', '$routeParams'];

function WSViewCtrl($scope, $rootScope, $http, $routeParams, $location, AuthService) {
	var vm = this;
	vm.formmodel= {};
	vm.formmodel.author = $rootScope.activeuser.username;
	vm.formData = {};

	// AuthService.getUserStatus().then(function(data){
	// 		if(AuthService.isLoggedIn()) {
	// 			vm.activeuser = data.data.user;
	// 			vm.formmodel.author = vm.activeuser.username;
	// 			vm.formData.author.$dirty = true;
	// 			vm.formData.author.$pristine = false;
	// 			vm.formData.author.$isvalid = true;
	// 		}
	// });
	// if($rootScope.activeuser===undefined || !$rootScope.activeuser){
	// 	$location.path('/messages');
	// }
	// else {
	// vm.location = '';
	// $scope.$on('$locationChangeSuccess', function(){
	// 	vm.location = $location.path().split('/',2)[1]; //use second index since path starts with a slash
	// });
    $http.get('/api/workshops/' + $routeParams.id + '/' + $rootScope.activeuser.username)
        .success(function(data) {
					// if($rootScope.activeuser!=undefined && !$rootScope.activeuser){
					// 	vm.formmodel.author = $rootScope.activeuser.username;
					// }
					if(data.workshop.members.indexOf($rootScope.activeuser)){
						// members only!
						vm.workshop = data;
						vm.formData.author.$dirty = true;
						vm.formData.author.$pristine = false;
						vm.formData.author.$isvalid = true;
					}
					else {
          	$location.path('/messages');
					}
        })
        .error(function(data) {
            console.log('Error: ' + data);
						vm.error = data;
        });

    // delete a workshop
    vm.deleteworkshop = function(id) {
        $http.delete('/api/workshops/' + id)
            .success(function(data) {
                vm.workshop = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
								vm.error = data;
            });
    };

		// delete a workshop
		vm.updateworkshop = function(id) {
				$http.update('/api/workshops/' + id, vm.form)
						.success(function(data) {
								vm.workshop = data;
						})
						.error(function(data) {
								console.log('Error: ' + data);
								vm.error = data;
						});
		};

		vm.createMessage = function(id) {
        if(vm.formData.$valid){
            $http.post('/api/workshops/new/message/' + id, vm.formData)
                .success(function(data) {
                    //vm.formData = {};
                    vm.formmodel = {};
                    vm.formData.$setPristine();
                    vm.formData.$setUntouched();  // clear the form so our user is ready to enter another
                    vm.workshop.workshop = data;
                    // vm.messages = data.docs;
                    // vm.currentpage = data.page;
                    // vm.totalmsgs = data.total;
                    // vm.totalpages = data.pages;
                    //console.log(data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
										vm.error = data;
                });
        }
    };
}

function WSUpdateCtrl($scope, $http, $routeParams) {
	var vm = this;
    //vm.data.members = [];
    $http.get('/api/workshop/' + $routeParams.id)
        .success(function(data) {
            //console.log(data);
            vm.data = data;
        })
        .error(function(data) {
            console.log('Error: ' + data);
						vm.error = data;
        });

}
