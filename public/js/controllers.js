angular.module('myApp')

//Game Play ------------------
.controller('gamePlayCtrl', ['$scope', '$rootScope', 'socket', 'welcomeModal', 'currentCategory', 'gameData', function($scope, $rootScope, socket, welcomeModal, currentCategory, gameData) {
	console.log('in gamePlayCtrl');
	$scope.currentAnswer = "";
	$scope.currentRound = 1;

	gameData.setPlayer1Name(welcomeModal.userName);

	socket.emit('join', {
			category : currentCategory.category,
			userName : welcomeModal.userName
		});
	
	socket.on('gameStarted', function(response) {
		console.log(response);
		$scope.round1 = response.round1;
		$scope.round2 = response.round2;
		$scope.round3 = response.round3;
		$scope.round4 = response.round4;
		gameData.player1.name = response.player1;
		gameData.player2.name = response.player2;
		gameData.roomId.roomId = response.category.openRoom;
	});

	socket.on('getOpponentFeedback', function(response) {
		if (response.userName != welcomeModal.userName) {
			gameData.setPlayer2Name(response.userName);
			gameData.setPlayer2Score(response.score);
		};
	});

	$scope.submitAnswer = function(answer) {
		var isCorrect = null;
		if ($scope.currentAnswer === $scope['round' + $scope.currentRound]) {
			isCorrect = true;
		} else {
			isCorrect = false;
		}

		socket.emit('answerFeedback', {
			userName: users.player1.name,
			roomId: gameData.roomId.roomId,
			score: users.player1.score,
			isCorrect: isCorrect
		});
	};

	$scope.showNewRound = function() {
		var round = $scope['round' + $scope.currentRound];

		$scope.question = round.question;
		$scope.answerArray = $scope.shuffleAnswers([round.correct, round.ans1, round.ans2, round.ans3]);
	};

	$scope.shuffleAnswers = function(array) {
  		var currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

	    // Pick a remaining element...
	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;

	    // And swap it with the current element.
	    temporaryValue = array[currentIndex];
	    array[currentIndex] = array[randomIndex];
	    array[randomIndex] = temporaryValue;
  		
  		}
  		return array;
	};

}])

//Game Over ----------------------
.controller('gameOverCtrl', ['$scope', 'socket', function($scope, socket) {

}])

//Home Screen Categories -----------------
.controller('HomeCtrl', ['$scope', '$location', '$rootScope', '$q', '$timeout', 'socket', 'welcomeModal', 'currentCategory', function($scope, $location, $rootScope, $q, $timeout, socket, welcomeModal, currentCategory) {
	
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

	function wait() {
		var defer = $q.defer();
		$timeout(function() {
			defer.resolve();
		}, 2000);
		return defer.promise;
    }

	$scope.categoryClick = function(category) {
		currentCategory.category = category;
		
		wait().then(function() {
			$location.path('/gamePlay/' + category + '/' + welcomeModal.userName);
		})
	};
}])

//Username/Welcome Modal --------------------------
.controller('WelcomeCtrl', ['$scope', '$rootScope', 'socket', 'welcomeModal', function($scope, $rootScope, socket, welcomeModal) {

	$scope.closeMe = welcomeModal.deactivate;

	$scope.updateUserName = function(userName) {
		welcomeModal.userName = userName;
		console.log(welcomeModal.userName);
		$scope.closeMe();
	}; 

}]);
