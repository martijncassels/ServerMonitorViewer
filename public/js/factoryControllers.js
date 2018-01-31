angular

.module('ServerMonitorViewer.Factorycontrollers',[])

.controller('FactoryCtrl', FactoryCtrl)
.controller('FacViewCtrl', FacViewCtrl)
.controller('FacUpdateCtrl',FacUpdateCtrl);

FactoryCtrl.$inject = ['$scope', '$http', '$routeParams', 'AuthService'];
FacViewCtrl.$inject = ['$scope', '$http', '$routeParams', '_'];
FacUpdateCtrl.$inject = ['$scope', '$http', '$routeParams'];

function FactoryCtrl($scope, $http, $routeParams, AuthService) {
	var vm = this;

	vm.activeuser = {};

	AuthService.getUserStatus().then(function(data){
			if(AuthService.isLoggedIn()) {
				vm.activeuser = data.data.user;
			}
	});

	$http.get('/api/factories')
      .success(function(data) {
          vm.factories = data;
          //console.log(data);
      })
      .error(function(data) {
          console.log('Error: ' + data);
					vm.error = data;
      });

  vm.deleteFactory = function(id) {
      $http.delete('/api/factories/' + id)
          .success(function(data) {
              vm.factories = data;
              //console.log(data);
          })
          .error(function(data) {
              console.log('Error: ' + data);
							vm.error = data;
          });
  }

  vm.createFactory = function() {
      if(vm.formData.$valid){
          $http.post('/api/factories', vm.formData)
              .success(function(data) {
                  vm.formData = {}; // clear the form so our user is ready to enter another
                  vm.data = data;
                  //console.log(data);
              })
              .error(function(data) {
                  console.log('Error: ' + data);
									vm.error = data;
              });
      }
  }
}

function FacViewCtrl($scope, $http, $routeParams) {
	var vm = this;
    vm.totals = {};
    vm.totals.skills = [];
    vm.options = {};
    vm.options2 = {};
    vm.series = [];
    vm.data = [];
    vm.labels = [];

    $http.get('/api/factories/' + $routeParams.id)
        .success(function(data) {
            // totals per skill
            vm.factory = data;
            for(var i_skill = 0; i_skill <= 4; i_skill++){
                for(var i_members = 0; i_members < vm.factory.members.length; i_members++){
                    //console.log(vm.factory.members[i_members].skills[i_skill].value);
                    if(!vm.totals.skills[i_skill] && vm.factory.members[i_members].skills[i_skill]){
                        vm.totals.skills[i_skill] = {name:null,value:null};
                        vm.totals.skills[i_skill].name = vm.factory.members[i_members].skills[i_skill].name;
                        vm.totals.skills[i_skill].value = vm.factory.members[i_members].skills[i_skill].value;
                    }
                    else if(vm.factory.members[i_members].skills[i_skill]) {
                        vm.totals.skills[i_skill].value += vm.factory.members[i_members].skills[i_skill].value;
                    }
                    else vm.totals.skills[i_skill].value += 0;
                }
            }

            // total members in factory
            vm.totals.members = vm.factory.members.length;

            // set labels and data for the graphs
            angular.forEach(vm.totals.skills,function(value,key){
                vm.labels.push(value.name);
                vm.data.push(value.value);
            });
            vm.series = ['values'];

            //$scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
            vm.options = {
                scales: {
                    yAxes: [{
                        ticks : {
                            min: 0,
                            max: (vm.totals.members*10)*0.6,    // max points per 1 skill when minimum per skill is 1 would be 6
                            stepSize: 1                         // (6+1+1+1+1=10) so 60% of total, which is (total members) * 10
                        }
                    }]
                }
            };
            vm.options2 = {
                scale: {
                    ticks : {
                        min: 0,
                        max: (vm.totals.members*10)*0.6,
                        stepSize: 1
                    }
                }
            };

            // get some data about skills you have or haven't
            vm.best_skill = _.max(vm.totals.skills,function(skill){ return skill.value});
            vm.worst_skill = _.min(vm.totals.skills,function(skill){ return skill.value});
            //console.log('best skill: '+JSON.stringify(vm.best_skill));
						//console.log('worst skill: '+JSON.stringify(vm.worst_skill));

						// get those members with awesome skills needed for this factory AND are not in a factory yet!
            vm.prodigies = {};
            $http.get('/api/profiles/search_skill/'+vm.worst_skill.name)
            .success(function(data){
                vm.prodigies = data;
            })
            .error(function(err){
                console.log(err);
								vm.error = data;
            });

        })
        .error(function(data) {
            console.log('Error: ' + data);
						vm.error = data;
        });

    // delete a factory
    vm.deleteFactory = function(id) {
        $http.delete('/api/factories/' + id)
            .success(function(data) {
                vm.factory = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
								vm.error = data;
            });
    };

}

function FacUpdateCtrl($scope, $http, $routeParams) {
	var vm = this;
    //vm.data.members = [];
    $http.get('/api/factories/' + $routeParams.id)
        .success(function(data) {
            //console.log(data);
            vm.data = data;
        })
        .error(function(data) {
            console.log('Error: ' + data);
						vm.error = data;
        });

    vm.updateFactory = function(id) {
        //console.log($scope.formData8);
        $http.put('/api/factories/' + id , $scope.formData8)
            .success(function(data) {
                vm.formData8 = data;
                vm.success = 'done updating message!';
            })
            .error(function(data) {
                vm.error = 'error updating message!';
                console.log('Error: ' + data);
            });
    };

    vm.getMembers = function(val) {
        return $http.get('/api/members/' + val).then(function(response){
            return response.data;
        });
    };

    vm.pushMember = function(val) {
        //console.log(val);
        var newmember = {'_id':val._id,'username':val.username};
        vm.data.members.push(newmember);
        //console.log(vm.data.members);
        vm.selected = [];
    };

    vm.removeMember = function(member) {
        vm.data.members.splice(member,1);
        vm.selected = [];
    };

}
