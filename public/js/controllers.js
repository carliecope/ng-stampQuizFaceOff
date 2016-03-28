angular.module('myApp')

//Game Play ------------------
.controller('gamePlayCtrl', ['$scope', '$rootScope', 'socket', function($scope, $rootScope, socket) {
	
	socket.emit('join:game', {
			category : category,
			userName : $rootScope.userName
		});
	socket.on('send:gameData', {
		gameData: gameData
	});
	
	console.log(gameData);

}])

//Game Over ----------------------
.controller('gameOverCtrl', ['$scope', 'socket', function($scope, socket) {

}])

//Home Screen Categories -----------------
.controller('HomeCtrl', ['$scope', '$location', '$rootScope', 'socket', 'welcomeModal', function($scope, $location, $rootScope, socket, welcomeModal) {
	
	var firstTimeUser = true;
	welcomeModal.showModal = welcomeModal.activate;
	
	if (firstTimeUser === true) {
		$(document).ready(function() {
			firstTimeUser = false;
			welcomeModal.showModal(); 
		}); 
	}

	this.categoryClick = function(category, userName) {
		$location.path('/gamePlay/' + category + '/' + userName);
	};
}])

//Username/Welcome Modal --------------------------
.controller('WelcomeCtrl', ['$scope', '$rootScope', 'socket', 'welcomeModal', function($scope, $rootScope, socket, welcomeModal) {
	
	welcomeModal.closeMe = welcomeModal.deactivate;

	this.submit = function() {
		$rootScope.userName = this.userName;
		welcomeModal.closeMe();
	}; 

}]);
