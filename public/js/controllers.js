angular.module('myApp')

//Username/Welcome View --------------------------
.controller('WelcomeCtrl', ['$scope', '$location', 'socket', 'gameData', function($scope, $location, socket, gameData) {            
   
   $scope.$on('$viewContentLoaded', function() {
   		$(".text_holder").addClass("on").addClass("animate_view");
   });

	$scope.updateUserName = function(userName) {
		gameData.setPlayer1Name(userName);
		
		$location.path('/home');
	}; 
}])
//Home Screen -----------------------------
.controller('HomeCtrl', ['$scope', '$location', '$q', '$timeout','$window', 'socket', 'currentCategory', 'gameData', function($scope, $location, $q, $timeout, $window, socket, currentCategory, gameData) {
	$scope.category_selected = false;

	//Game and category selection handling 
	$scope.gameData = gameData;
	$scope.currentCategory = currentCategory;

	$scope.player1Name = gameData.getPlayer1Name();
	$scope.player1Score = gameData.getPlayer1TotalPoints();

	$scope.categoryClick = function(category) {
		if ($scope.category_selected === false) {

			category.replace(" ", "%20");

			$scope.currentCategory.setCategory(category);

			var userName = gameData.getPlayer1Name();

			socket.emit('join', {
				category : $scope.currentCategory.getCategory(),
				userName : userName
			});
		}
	};

	$scope.$on('socket:gameStarted', function(e, response) {

		gameData.setGameInfo(response);
		
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

	$scope.countdownNum = 15;
	$scope.faceOffNum = 3;
	
	$scope.toGame = function() {
		$location.path('/gamePlay');
		
		socket.emit('sendCloseRoomNotice', {
			category: currentCategory.getCategory()
		});
	};	
}])
//Game Play ---------------------------------------------------
.controller('GamePlayCtrl', ['$scope', '$interval', '$location', '$timeout', 'socket', 'currentCategory', 'gameData', function($scope, $interval, $location, $timeout, socket, currentCategory, gameData) {
	//Get game info
	$scope.gameData = gameData;

	var game = gameData.getGameInfo();
	console.log(game);

	$scope.currentCategory = currentCategory;

 	//Game state variables
	$scope.currentRoundNum = 1;
	$scope.showModal = true;
	$scope.nextRoundTickNum = 3;
	$scope.answerTimeTickNum = 10;
	$scope.question = "";
	$scope.answerArray = [];
	$scope.answerWasSubmitted = false;
	$scope.speedyPoints = gameData.getPlayer1SpeedyPoints();
	
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
			if (answer === $scope.correct) {
				$scope.p1CorrectArray.push(true);

				gameData.setPlayer1Score(5);

			} else {
				$scope.p1CorrectArray.push(false);
			}

			$scope.player1Answered = true;
			$scope.haveAllResponses(answer);
		}
	};

	$scope.haveAllResponses = function(answer) {
		
		if ($scope.answerTimeTickNum > 7 && answer === $scope.correct) {
			gameData.setPlayer1SpeedyPoints(3);
		} else if ($scope.answerTimeTickNum > 4 && answer === $scope.correct) {
			gameData.setPlayer1SpeedyPoints(1);
		}

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
	};

	$scope.answerTimeTick = function() {

		if ($scope.answerTimeTickNum >= 1) {
			$scope.answerTimeTickNum--;
		}
		if ($scope.answerTimeTickNum === 0) {
			
			$interval.cancel($scope.answerTimeInterval);

			$scope.p1CorrectArray.push(false);

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
	$scope.player1Score = gameData.getPlayer1Score() + gameData.getPlayer1SpeedyPoints();
	$scope.player1SpeedyPoints = gameData.getPlayer1SpeedyPoints();
	
	if ($scope.player1Score > 0) {
		$scope.game_outcome = "Nice Work!";
	} else {
		$scope.game_outcome = "Better luck next time...";
	}

	$scope.returnHome = function() {

		socket.emit('exitRoom', {
			userName: gameData.getPlayer1Name(),
			roomId: $scope.gameData.getRoomId(),
			category: currentCategory.getCategory()
		});

		gameData.clearPlayer1Score(0);
		gameData.clearPlayer1SpeedyPoints(0);
		gameData.setTotalPoints($scope.player1Score);

		$location.path('/home');
	};
}]);


