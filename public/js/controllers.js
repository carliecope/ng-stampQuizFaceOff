angular.module('myApp')

//Username/Welcome View --------------------------
.controller('WelcomeCtrl', ['$scope', '$location', 'socket', 'gameData', function($scope, $location, socket, gameData) {

	$scope.updateUserName = function(userName) {
		gameData.setPlayer1Name(userName);
		
		$location.path('/home');
	}; 
}])
//Home Screen -----------------------------
.controller('HomeCtrl', ['$scope', '$location', '$q', '$timeout','$window', 'socket', 'currentCategory', 'gameData', function($scope, $location, $q, $timeout, $window, socket, currentCategory, gameData) {

	//Game and category selection handling 
	$scope.gameData = gameData;
	$scope.currentCategory = currentCategory;

	$scope.categoryClick = function(category) {
		console.log(category);
		category.replace(" ", "%20");
		console.log(category);

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
.controller('PregameCtrl', ['$scope', '$location', '$interval', 'socket', 'gameData', 'currentCategory', function($scope, $location, $interval, socket, gameData, currentCategory) {
	$scope.gameData = gameData;
	$scope.currentCategory = currentCategory;

	$scope.category = "";
	if ($scope.currentCategory.getCategory() === "USPresidents") {
		$scope.category = "US Presidents";
	} else {
		$scope.category = $scope.currentCategory.getCategory();
	}

	if (gameData.getPlayer2Name() === "") {
		$scope.waiting = true;
	}
	$scope.countdownNum = 15;
	$scope.faceOffNum = 3;
	
	$scope.toGame = function() {
		$location.path('/gamePlay');
		
		socket.emit('sendCloseRoomNotice', {
			category: currentCategory.getCategory()
		});
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
.controller('GamePlayCtrl', ['$scope', '$interval', '$location', '$timeout', 'socket', 'currentCategory', 'gameData', function($scope, $interval, $location, $timeout, socket, currentCategory, gameData) {
	//Get game info
	$scope.gameData = gameData;

	var game = gameData.getGameInfo();
	console.log(game);

	$scope.currentCategory = currentCategory;

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
	$scope.answerWasSubmitted = false;
	
	$scope.p1CorrectArray = [];
	$scope.p2CorrectArray = [];
	
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
		$scope.player2Answered = true;

		$scope.currentRoundText = game.gameData['round' + $scope.currentRoundNum];

		$scope.question = $scope.currentRoundText.body;
		$scope.stampImgURL = $scope.currentRoundText.image;
		$scope.answerArray = $scope.shuffleAnswers([$scope.currentRoundText['correct answer'], $scope.currentRoundText.answers[0], $scope.currentRoundText.answers[1], $scope.currentRoundText.answers[2]]);
	};

	$scope.submitAnswer = function(answer, index) {
		$scope.index = index;

		$scope.correct = $scope.currentRoundText['correct answer'];

		if (!$scope.timeUp && $scope.answerWasSubmitted === false) {

			$scope.answerWasSubmitted = true;
			if (answer === $scope.currentRoundText['correct answer']) {
				$scope.p1CorrectArray.push(true);

				gameData.setPlayer1Score(10);

			} else {
				$scope.p1CorrectArray.push(false);
			}

			socket.emit('sendAnsFeedback', {
				userName: gameData.getPlayer1Name(),
				roomId: $scope.gameData.getRoomId(),
				score: gameData.getPlayer1Score(),
				category: currentCategory.getCategory()
			});

			$scope.player1Answered = true;
			$scope.haveAllResponses();
		}
	};

	$scope.haveAllResponses = function() {
		
		if ($scope.haveOpponent) {
			
			if ($scope.player1Answered && $scope.player2Answered) {

				$interval.cancel($scope.answerTimeInterval);

				$interval(function(){ 
					$scope.index = 10;
					$scope.correct = false;
					$scope.timeUp = false;
				
					$scope.player1Answered = false;
					$scope.player2Answered = false;

					if ($scope.currentRoundNum > 4) {
						$location.path('/gameOver');
						return;
					}
					$scope.currentRoundNum++;

					$scope.answerWasSubmitted = false;
					$scope.nextRoundTickNum = 3;
					$scope.answerTimeTickNum = 10;
					$scope.showModal = true;
					$scope.nextRoundInterval = $interval($scope.nextRoundTick.bind(this), 1000);

				}, 2000, 1);
			}
		} else {
			$interval.cancel($scope.answerTimeInterval);
			$interval(function(){ 
				$scope.index = 10;
				$scope.correct = false;
				$scope.timeUp = false;
				$scope.currentRoundNum++;
				
				if ($scope.currentRoundNum > 4) {
					$location.path('/gameOver');
					return;
				}

				$scope.answerWasSubmitted = false;
				$scope.nextRoundTickNum = 3;
				$scope.answerTimeTickNum = 10;
				$scope.showModal = true;
				$scope.nextRoundInterval = $interval($scope.nextRoundTick.bind(this), 1000);
			}, 2000, 1);
		}
	};

	$scope.answerTimeTick = function() {

		if ($scope.answerTimeTickNum >= 1) {
			$scope.answerTimeTickNum--;
		}
		if ($scope.answerTimeTickNum === 0) {
			
			$interval.cancel($scope.answerTimeInterval);

			$scope.p1CorrectArray.push(false);

			socket.emit('sendNoAnswer', {
				userName: gameData.getPlayer1Name(),
				roomId: $scope.gameData.getRoomId(),
				category: currentCategory.getCategory()
			});

			$interval(function(){
				$scope.correct = $scope.currentRoundText['correct answer']; 
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
			}, 2000, 1);
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
		if (response.userName != gameData.getPlayer1Name()) {

			$scope.player2Answered = true;

			if ($scope.player2Score != response.score) {
				$scope.p2CorrectArray.push(true);
			} else {
				$scope.p2CorrectArray.push(false);
			}
			$scope.player2Score = gameData.setPlayer2Score(response.score);

			if ($scope.currentRoundNum > 4) {
				$location.path('/gameOver');
				return;
			}
		}
	});

	socket.on('getNoAnswer', function(response) {
		if (response.userName != gameData.getPlayer1Name()) {

			$scope.player2Answered = false;
			$scope.p2CorrectArray.push(false);

			if ($scope.currentRoundNum > 4) {
				$location.path('/gameOver');
				return;
			}
		}
	});
	
	$scope.nextRoundInterval = $interval($scope.nextRoundTick.bind(this), 1000);
 	
}])
//Game Over ---------------------------------------------------
.controller('GameOverCtrl', ['$scope', '$location', 'socket', 'gameData', 'currentCategory', function($scope, $location, socket, gameData, currentCategory) {
	$scope.currentCategory = currentCategory;
	$scope.gameData = gameData;

	$scope.category = "";
	if ($scope.currentCategory.getCategory() === "USPresidents") {
		$scope.category = "US Presidents";
	} else {
		$scope.category = $scope.currentCategory.getCategory();
	}

	$scope.player1Name = gameData.getPlayer1Name();
	$scope.player1Score = gameData.getPlayer1Score();

	$scope.player2Name = gameData.getPlayer2Name();
	$scope.player2Score = gameData.getPlayer2Score();

	$scope.soloPlayer = true;
	
	if ($scope.player2Name !== "") {

		$scope.soloPlayer = false;

		if($scope.player1Score > $scope.player2Score) {
			$scope.game_outcome = "You Won!";
		} else if ($scope.player1Score === $scope.player2Score) {
			$scope.game_outcome = "It's a tie!";
		} else {
			$scope.game_outcome = "You Lost";
		}
	}

	$scope.returnHome = function() {

		socket.emit('exitRoom', {
			userName: gameData.getPlayer1Name(),
			roomId: $scope.gameData.getRoomId(),
			category: currentCategory.getCategory()
		});

		gameData.clearPlayer1Score(0);
		gameData.clearPlayer2Score(0);

		gameData.setPlayer2Name("");

		$location.path('/home');
	};
}]);


