angular.module('myApp')

//Username/Welcome Modal --------------------------
.controller('WelcomeCtrl', ['$scope', 'socket', 'welcomeModal', 'gameData', function($scope, socket, welcomeModal, gameData) {

	$scope.closeMe = welcomeModal.deactivate;

	$scope.updateUserName = function(userName) {
		gameData.setFirstTimeUser(false);
		gameData.setPlayer1Name(userName);
		
		$scope.closeMe();
	}; 
}])
//Home Screen Categories -----------------------------
.controller('HomeCtrl', ['$scope', '$location', '$q', '$timeout', 'socket', 'welcomeModal', 'currentCategory', 'gameData', function($scope, $location, $q, $timeout, socket, welcomeModal, currentCategory, gameData) {
	//Dependancies
	$scope.welcomeModal = welcomeModal;
	$scope.currentCategory = currentCategory;
	$scope.gameData = gameData;

	//Modal Activation methods
	$scope.showWelcome = welcomeModal.activate;

	//Show Welcome modal if first time user
	var firstTimeUser = gameData.getFirstTimeUser();

	if (firstTimeUser) {
		$scope.showWelcome(); 
	}
	
	$scope.categoryClick = function(category) {
		currentCategory.category = category;

		var userName = gameData.getPlayer1Name();

		socket.emit('join', {
			category : currentCategory.category,
			userName : userName
		});
	};

	$scope.$on('socket:gameStarted', function(e, response) {
		if (!response.waiting) {
			gameData.setGameInfo(response);

			if (response.player1 === $scope.userName) {
				gameData.setPlayer2Name(response.player2);
			} else {
				gameData.setPlayer2Name(response.player1);
			}

			gameData.setRoomId(response.roomId);
			console.log(response);

			$location.path('/preGame');
		} else {
			gameData.setGameInfo(response);
			gameData.setRoomId(response.roomId);
			$location.path('/preGame');
			console.log(response);
		}
	});
}])
//Pre game  ------------------------------------------------
.controller('PregameCtrl', ['$scope', 'socket', 'gameData', function($scope, socket, gameData) {

}])
//Round Countdown Modal --------------------------------------
.controller('CountDownCtrl', ['$scope', 'socket', 'countDownModal', 'gameData', function($scope, socket, countDownModal, gameData) {

	$scope.closeMe = gamePauseModal.deactivate;
	$scope.closeMe();

}])
//Game Play ---------------------------------------------------
.controller('GamePlayCtrl', ['$scope', '$rootScope', 'socket', 'welcomeModal', 'gamePauseModal', 'currentCategory', 'gameData', function($scope, $rootScope, socket, welcomeModal, gamePauseModal, currentCategory, gameData) {
	console.log(gameData.gameCopy);

	//Game state variables
	$scope.currentAnswer = "";
	$scope.currentRound = 1;

	//Set game round info 
	$scope.setGameRounds(gameData.gameCopy);

	socket.on('getOpponentFeedback', function(response) {
		if (response.userName != welcomeModal.userName) {
			gameData.setPlayer2Score(response.score);
		}
	});

	$scope.submitAnswer = function(answer) {
		var isCorrect = null;

		if ($scope.currentAnswer === $scope['round' + $scope.currentRound]) {
			isCorrect = true;
		} else {
			isCorrect = false;
		}

		socket.emit('sendAnsFeedback', {
			userName: gameData.getPlayer1Name(),
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

	$scope.countdownTick = function() {

	};

	$scope.setGameRounds = function(gameInfo) {
		$scope.round1 = gameInfo.round1;
		$scope.round2 = gameInfo.round2;
		$scope.round3 = gameInfo.round3;
		$scope.round4 = gameInfo.round4;
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
//Game Over ---------------------------------------------------
.controller('GameOverCtrl', ['$scope', 'socket', function($scope, socket) {

}]);


