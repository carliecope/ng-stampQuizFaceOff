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
		$scope.currentCategory.setCategory(category);

		var userName = gameData.getPlayer1Name();

		socket.emit('join', {
			category : $scope.currentCategory.getCategory(),
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

		if (response.player2) {
			$interval.cancel($scope.countdownInterval);
			$scope.newOpponent = true;
			$scope.waiting = false;
			gameData.setPlayer2Name(response.player2);

			$scope.$apply();

		}
		$scope.faceOffInterval = $interval($scope.faceOffTick.bind(this), 1000);
	});
}])
//Game Play ---------------------------------------------------
.controller('GamePlayCtrl', ['$scope', '$interval', '$location', 'socket', 'currentCategory', 'gameData', function($scope, $interval, $location, socket, currentCategory, gameData) {
	//Get game info
	$scope.gameData = gameData;
	var game = gameData.getGameInfo();

	if (gameData.getPlayer2Name() === "") {
		$scope.haveOpponent = false;
	} else {
		$scope.haveOpponent = true;
	}

 	//Game state variables
	$scope.currentRoundNum = 1;
	$scope.showModal = true;
	$scope.nextRoundTickNum = 3;
	$scope.answerTimeTickNum = 10;
	$scope.question = "";
	$scope.answerArray = [];
	
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

	$scope.showNewRound = function() {
		$scope.currentRoundText = game.gameData['round' + $scope.currentRoundNum];
		//console.log($scope.currentRoundText);

		$scope.question = $scope.currentRoundText.question;
		$scope.answerArray = $scope.shuffleAnswers([$scope.currentRoundText.correct, $scope.currentRoundText.ans1, $scope.currentRoundText.ans2, $scope.currentRoundText.ans3]);
		//console.log($scope.answerArray);
	};

	$scope.submitAnswer = function(answer) {
		if (!$scope.timeUp) {
			
			var isCorrect = null;

			if (answer === $scope.currentRoundText.correct) {
				isCorrect = true;
				gameData.setPlayer1Score(10);
			} else {
				isCorrect = false;
			}

			socket.emit('sendAnsFeedback', {
				userName: gameData.getPlayer1Name(),
				roomId: gameData.getRoomId(),
				score: gameData.getPlayer1Score(),
				isCorrect: isCorrect
			});

			$scope.player1Answered = true;
			$scope.haveAllResponses();
		}
	};

	$scope.haveAllResponses = function() {
		
		$interval.cancel($scope.answerTimeInterval);
		$scope.timeUp = false;
		$scope.nextRoundTickNum = 3;
		$scope.answerTimeTickNum = 10;
		
		if ($scope.haveOpponent) {
			
			if ($scope.player1Answered && $scope.player2Answered) {

				if ($scope.currentRoundNum > 4) {
					$location.path('/gameOver');
					return;
				}
				$scope.currentRoundNum++;
				$scope.showModal = true;
				$scope.nextRoundInterval = $interval($scope.nextRoundTick.bind(this), 1000);
			}
		} else {
			$scope.currentRoundNum++;
			
			if ($scope.currentRoundNum > 4) {
				$location.path('/gameOver');
				return;
			}
			$scope.showModal = true;
			$scope.nextRoundInterval = $interval($scope.nextRoundTick.bind(this), 1000);
		}
	};

	$scope.answerTimeTick = function() {

		if ($scope.answerTimeTickNum >= 1) {
			$scope.answerTimeTickNum--;
		}
		if ($scope.answerTimeTickNum === 0) {
			
			$interval.cancel($scope.answerTimeInterval);

			$scope.timeUp = true;
			$scope.answerTimeTickNum = 10;
			$scope.nextRoundTickNum = 3;

			if ($scope.currentRoundNum === 4) {
				$interval.cancel($scope.answerTimeInterval);
				$location.path('/gameOver');
				return;
			}
			$scope.currentRoundNum++;
			$scope.showModal = true;
			$scope.nextRoundInterval = $interval($scope.nextRoundTick.bind(this), 1000);
		}
	};
	
	$scope.nextRoundTick = function() {

		if ($scope.nextRoundTickNum >= 1) {
			$scope.nextRoundTickNum--;
		}
		if ($scope.nextRoundTickNum === 0) {
			$interval.cancel($scope.nextRoundInterval);
			$scope.answerTimeTickNum = 10;

			$scope.showModal = false;

			$scope.answerTimeInterval = $interval($scope.answerTimeTick.bind(this), 1000);

			$scope.showNewRound();
		}
	};
	
	socket.on('getOpponentFeedback', function(response) {
		if (response.userName != getPlayer1Name()) {
			gameData.setPlayer2Score(response.score);

			$scope.player2Answered = true;
		}
	});
	
	$scope.nextRoundInterval = $interval($scope.nextRoundTick.bind(this), 1000);
 	
}])
//Game Over ---------------------------------------------------
.controller('GameOverCtrl', ['$scope', '$location', 'socket', 'gameData', 'currentCategory', function($scope, $location, socket, gameData, currentCategory) {
	$scope.currentCategory = currentCategory;
	$scope.gameData = gameData;

	$scope.category = $scope.currentCategory.getCategory();
	$scope.game_outcome = "";

	$scope.player1Name = gameData.getPlayer1Name();
	$scope.player1Score = gameData.getPlayer1Score();

	$scope.player2Name = gameData.getPlayer2Name();
	$scope.player2Score = gameData.getPlayer2Score();

	//document.onload ()?
	$scope.showOutcome = function() {

	};

	$scope.rematch = function() {
		//handle if other player chooses to rematch, else 'opponent left the room'
		$location.path('/gamePlay');
	};

	$scope.returnHome = function() {

		//reset category
		//increase player game count??
		$location.path('/home');
	};
}]);


