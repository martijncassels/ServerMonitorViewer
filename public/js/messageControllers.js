angular

.module('ServerMonitorViewer.Messagecontrollers',[])

.controller('MsgUpdateCtrl', MsgUpdateCtrl)
.controller('MsgViewCtrl', MsgViewCtrl)
.controller('MsgNewCtrl', MsgNewCtrl)
.controller('MsgFrontPageCtrl', MsgFrontPageCtrl);

MsgUpdateCtrl.$inject = ['$scope', '$http', '$routeParams'];
MsgViewCtrl.$inject = ['$scope', '$rootScope', '$http', '$routeParams', '$location','AuthService'];
MsgNewCtrl.$inject = ['$scope', '$http', '$routeParams', 'AuthService', '$location'];
MsgFrontPageCtrl.$inject = ['$scope', '$http', '$routeParams', '$location','AuthService', 'Search'];

function MsgUpdateCtrl($scope, $http, $routeParams) {
    var vm = this;
    //vm.form = {};

    $http.get('/api/messages/' + $routeParams.entity + '/' + $routeParams.id)
        .success(function(data) {
            vm.message = data;
        })
        .error(function(data) {
            console.log('Error: ' + data);
            vm.error = data;
        });

    vm.updateMessage = function(id) {
        $http.put('/api/messages/' + id , $scope.form)
            .success(function(data) {
                vm.form = data;
                vm.success = 'done updating message!';
            })
            .error(function(data) {
                vm.error = 'error updating message!';
                console.log('Error: ' + data);
            });
    };

    // vm.createComment = function(child,id) {
    //     $http.post('/api/comments/' + id, child.form)
    //         .success(function(data) {
    //             child.form = {};
    //             $rootScope.messages = data;
    //             //console.log(data);
    //         })
    //         .error(function(data) {
    //             console.log('Error: ' + data);
    //         });
    // };

    vm.updateComment = function(id) {
        $http.put('/api/comments/' + id , $scope.form)
            .success(function(data) {
              if (data.kind) {
                vm.error = 'Message or comment could not be updated!';
              }
              else {
                $scope.form = data; //need to get rid of this
                vm.success = 'done updating message!';
              }
            })
            .error(function(data) {
                vm.error = 'error updating message!';
                console.log('Error: ' + data);
            });
    };

}

function MsgViewCtrl($scope, $rootScope, $http, $routeParams, $location, AuthService) {
    var vm = this;
    vm.activeuser = {};
    //vm.isLoggedIn = AuthService.isLoggedIn();
    //vm.formmodel = {};
    // $scope.$watch( AuthService.isLoggedIn, function ( isLoggedIn ) {
    //   $rootScope.isLoggedIn = isLoggedIn;
    // });

    AuthService.getUserStatus().then(function(data){
        if(AuthService.isLoggedIn()) {
          vm.activeuser = data.data.user;
        }
    });

    $http.get('/api/messages/' + $routeParams.entity + '/' + $routeParams.id)
        .success(function(data) {
            (data.kind) ? vm.error = 'Message or comment not found!' : vm.message = data;
        })
        .error(function(data) {
            vm.error = data;
            console.log('Error: ' + data);
        });

    vm.createComment = function(child,id) {
        $http.post('/api/comments/single/' + id, child.form)
            .success(function(data) {
                $scope.form = {};
                child.form = {};
                (data.kind) ? vm.error = 'Comment not be created!' : vm.message = data;
                //console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    // delete a message
    vm.deleteMessage = function(id) {
        $http.delete('/api/messages/' + id)
            .success(function(data) {
                //vm.message = data;
                $location.path('/messages');
                //console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
                vm.error = data;
            });
    };

    vm.deleteComment = function(id) {
        $http.delete('/api/comments/single/' + id)
            .success(function(data) {
                (data.kind) ? vm.error = 'Comment could not be deleted!' : vm.message = data;
                //$location.path('/messages');
            })
            .error(function(data) {
                console.log('Error: ' + data);
                vm.error = data;
            });
    };
}

function MsgNewCtrl($scope, $http, $routeParams, AuthService, $location) {
    var vm = this;
    vm.formData = {};
    vm.formmodel = {};
    vm.activeuser = {};
    // vm.isLoggedIn = AuthService.isLoggedIn();
    AuthService.getUserStatus().then(function(data){
        if(AuthService.isLoggedIn()) {
          vm.activeuser = data.data.user;
          vm.formmodel.author = vm.activeuser.username;
          vm.formData.author.$dirty = true;
          vm.formData.author.$pristine = false;
          vm.formData.author.$isvalid = true;
        }
    });

    vm.createMessage = function() {
      //console.log(vm.formData);
        if(vm.formData.$valid){
            $http.post('/api/messages', vm.formData)
                .success(function(data) {
                    vm.formData = {}; // clear the form so our user is ready to enter another
                    (data.kind) ? vm.error = 'Message could not be created!' : vm.message = data;
                    //console.log(data);
                    $location.path('/messages');
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                    vm.error = data;
                });
        //console.log('message created!');
        }
    };
}

function MsgFrontPageCtrl($scope, $http, $routeParams,$location, AuthService, Search) {
    var vm = this;
    vm.isLoggedIn = AuthService.isLoggedIn();
    vm.myInterval = 5000;
    vm.noWrapSlides = false;
    vm.active = 0;
    var slides = vm.slides = [];
    var currIndex = 0;

    Search.getFrontPage()
    .success(function(data){
        //console.log(data);
        vm.messages = data;
        // for (var i = 0; i < data.length; i++) {
        //   vm.addSlide(data[i]);
        // }
    })
    .error(function(err){
        console.log(err);
        vm.error = data;
    });

    $scope.$on('search', function(event, args){
        //console.log(args);
        vm.messages = args;
        // args is the search results
    });

    vm.addSlide = function(data) {
    var newWidth = 600 + slides.length + 1;
    slides.push({
      //image: '//picsum.photos/g/' + newWidth + '/300',
      image: ['//picsum.photos/g/'+newWidth+'/300?image=885','//picsum.photos/g/'+newWidth+'/300?image=389','//picsum.photos/g/'+newWidth+'/300?image=903'][slides.length % 4],
      text: ['Nice image','Awesome photograph','That is so cool'][slides.length % 4],
      // text: data.title,
      id: currIndex++
    });
  };

  vm.randomize = function() {
    var indexes = generateIndexesArray();
    assignNewIndexesToSlides(indexes);
  };

  for (var i = 0; i < 3; i++) {
    vm.addSlide();
  }

  // Randomize logic below

  function assignNewIndexesToSlides(indexes) {
    for (var i = 0, l = slides.length; i < l; i++) {
      slides[i].id = indexes.pop();
    }
  }

  function generateIndexesArray() {
    var indexes = [];
    for (var i = 0; i < currIndex; ++i) {
      indexes[i] = i;
    }
    return shuffle(indexes);
  }

  // http://stackoverflow.com/questions/962802#962890
  function shuffle(array) {
    var tmp, current, top = array.length;

    if (top) {
      while (--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
      }
    }

    return array;
  }

}
