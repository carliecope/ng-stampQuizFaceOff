angular.module('myApp')

//Game Play ------------------
.controller('gamePlayCtrl', ['$scope', '$rootScope', 'socket', 'welcomeModal', 'currentCategory', function($scope, $rootScope, socket, welcomeModal, currentCategory) {
	console.log('gamePlayCtrl');

	socket.emit('join', {
			category : currentCategory.category,
			userName : welcomeModal.userName
		});
	
	socket.on('gameStarted', function(gameData) {
		$scope.question = gameData.question,
		$scope.answerCorrect = gameData.answerCorrect,
		$scope.answer1 = gameData.answerA,
		$scope.answer2 = gameData.answerB,
		$scope.answer3 = gameData.answerC,

		console.log(gameData);
	});

	this.submitAnswer = function(answer) {

	};

	
	this.randomizeCorrectAnsNum = function() {
		//min = 1 (inclusive), max= 5 (exclusive)
  		return Math.floor(Math.random() * (5 - 1)) + 1;
	};
}])

//Game Over ----------------------
.controller('gameOverCtrl', ['$scope', 'socket', function($scope, socket) {

}])

//Home Screen Categories -----------------
.controller('HomeCtrl', ['$scope', '$location', '$rootScope', 'socket', 'welcomeModal', 'currentCategory', function($scope, $location, $rootScope, socket, welcomeModal, currentCategory) {
	
	$scope.welcomeModal = welcomeModal;
	$scope.currentCategory = currentCategory;

	var firstTimeUser = true;
	$scope.showModal = welcomeModal.activate;
	
	if (firstTimeUser === true) {
		$(document).ready(function() {
			firstTimeUser = false;
			$scope.showModal(); 
		}); 
	}

	$scope.categoryClick = function(category) {
		currentCategory.category = category;
		$location.path('/gamePlay/' + category + '/' + welcomeModal.userName);
	};
}])

//Username/Welcome Modal --------------------------
.controller('WelcomeCtrl', ['$scope', '$rootScope', 'socket', 'welcomeModal', function($scope, $rootScope, socket, welcomeModal) {
	
	console.log(welcomeModal.userName);

	$scope.closeMe = welcomeModal.deactivate;

	$scope.updateUserName = function(userName) {
		welcomeModal.userName = userName;
		console.log(welcomeModal.userName);
		$scope.closeMe();
	}; 

}]);
