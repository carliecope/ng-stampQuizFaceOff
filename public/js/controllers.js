angular.module('myApp')

//Username/Welcome View --------------------------
.controller('WelcomeCtrl', ['$scope', '$location', 'socket', 'gameData', function($scope, $location, socket, gameData) {

	$scope.updateUserName = function(userName) {
		gameData.setFirstTimeUser(false);
		gameData.setPlayer1Name(userName);
		
		$location.path('/home');
	}; 
}])
//Home Screen -----------------------------
.controller('HomeCtrl', ['$scope', '$location', '$q', '$timeout', 'socket', 'currentCategory', 'gameData', function($scope, $location, $q, $timeout, socket, currentCategory, gameData) {
	$scope.gameData = gameData;
	$scope.currentCategory = currentCategory;

	$scope.categoryClick = function(category) {
		currentCategory.category = category;

		var userName = gameData.getPlayer1Name();

		socket.emit('join', {
			category : currentCategory.category,
			userName : userName
		});
	};

	$scope.$on('socket:gameStarted', function(e, response) {
		gameData.setGameInfo(response);

		if(response.player2) {
			if (response.player1 === $scope.userName) {
				gameData.setPlayer2Name(response.player2);
			} else {
				gameData.setPlayer2Name(response.player1);
			}
		}
		
		gameData.setRoomId(response.roomId);

		$location.path('/preGame');
	});
}])
//Pre game  ------------------------------------------------
.controller('PregameCtrl', ['$scope', '$location', '$interval', 'socket', 'gameData', function($scope, $location, $interval, socket, gameData) {
	$scope.gameData = gameData;

	if (gameData.getPlayer2Name() === "") {
		$scope.waiting = true;
	}
	$scope.countdownNum = 15;
	$scope.faceOffNum = 3;
	
	$scope.toGame = function() {
		$location.path('/gamePlay');
	};
	$scope.wait = function() {
		$scope.opponentCountdown = true;
		$scope.countdownNum = 15;

		$scope.countdownInterval = $interval($scope.countdownTick.bind(this), 1000);
	};
	$scope.countdownTick = function() {

		if ($scope.countdownNum >= 1) {
			$scope.countdownNum--;
		}
		if ($scope.countdownNum === 0) {
			$interval.cancel($scope.countdownInterval);
			$scope.opponentCountdown = false;
		}
	};
	$scope.faceOffTick = function() {
		if ($scope.faceOffNum >= 1) {
			$scope.faceOffNum--;
		}
		if ($scope.faceOffNum === 0) {
			$interval.cancel($scope.faceOffInterval);
			$location.path('/gamePlay');
		}
	};

	if(gameData.getPlayer2Name()) {
		$scope.faceOffInterval = $interval($scope.faceOffTick.bind(this), 1000);	
	}	
	$scope.$on('socket:gameStarted', function(e, response) {
		$scope.newOpponent = true;
		
		if (response.player2) {
			gameData.setPlayer2Name(response.player2);
		}
		$scope.faceOffInterval = $interval($scope.faceOffTick.bind(this), 1000);
	});
}])
//Game Play ---------------------------------------------------
.controller('GamePlayCtrl', ['$scope', '$interval', 'socket', 'currentCategory', 'gameData', function($scope, $interval, socket, currentCategory, gameData) {
	$scope.gameData = gameData;
 	
 	var game = gameData.getGameInfo();
 	$scope.showModal = true;
	
	console.log(game);

	//Game state variables
	$scope.currentAnswer = "";
	$scope.currentRound = 1;

	//Set rounds 
	$scope.round1 = game.gameData.round1;
	$scope.round2 = game.gameData.round2;
	$scope.round3 = game.gameData.round3;
	$scope.round4 = game.gameData.round4;

	socket.on('getOpponentFeedback', function(response) {
		if (response.userName != getPlayer1Name()) {
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

	//Next round modal ------
	$scope.nextRoundTickNum = 3;
	
	$scope.nextRoundTick = function() {

		if ($scope.nextRoundTickNum >= 1) {
			$scope.nextRoundTickNum--;
		}
		if ($scope.nextRoundTickNum === 0) {
			$interval.cancel($scope.nextRoundInterval);

			$scope.showModal = false;
			
			if ($scope.currentRound != 1) {
				$scope.currentRound++;
				$scope.showNewRound();
			}
		}
	};
	$scope.nextRoundInterval = $interval($scope.nextRoundTick.bind(this), 1000);
}])
//Game Over ---------------------------------------------------
.controller('GameOverCtrl', ['$scope', 'socket', function($scope, socket) {

}]);


