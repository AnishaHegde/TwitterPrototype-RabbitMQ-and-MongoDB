//loading the 'login' angularJS module
var login = angular.module('login', []);
//defining the login controller
login.controller('login', function($scope, $http) {
	//Initializing the 'invalid_login' and 'unexpected_error' 
	//to be hidden in the UI by setting them true,
	//Note: They become visible when we set them to false
	$scope.invalid_login = true;
	$scope.unexpected_error = true;
	$scope.submit = function() {
		$http({
			method : "POST",
			url : '/checklogin',
			data : {
				"username" : $scope.username,
				"password" : $scope.password
			}
		}).success(function(data) {
			console.log("Inside success function of login");
			if (data.login == "Fail") {	
				console.log("Inside failed login");
				$scope.invalid_login = false;
				$scope.unexpected_error = true;
			}
			else
				window.location.assign("/profile");
		}).error(function(error) {
			$scope.unexpected_error = false;
			$scope.invalid_login = true;
		});
	};
})
