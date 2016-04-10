angular.module('myApp')

//Username/Welcome Modal --------------------------
.controller('WelcomeCtrl', ['$scope', '$location', 'socket', 'gameData', function($scope, $location, socket, gameData) {

	$scope.updateUserName = function(userName) {
		gameData.setFirstTimeUser(false);
		gameData.setPlayer1Name(userName);
		
		$location.path('/home');
	}; 
}])
//Home Screen Categories -----------------------------
.controller('HomeCtrl', ['$scope', '$location', '$q', '$timeout', 'socket', 'currentCategory', 'gameData', function($scope, $location, $q, $timeout, socket, currentCategory, gameData) {
	$scope.currentCategory = currentCategory;
	$scope.gameData = gameData;

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
.controller('PregameCtrl', ['$scope', '$location', '$window', 'socket', 'gameData', function($scope, $location, $window, socket, gameData) {
	console.log(gameData.getPlayer2Name());

	if (gameData.getPlayer2Name() === "") {
		$scope.waiting = true;
	}
	$scope.countdownNum = 15;
	$scope.toGame = function() {
		$location.path('/gamePlay');
	};
	$scope.wait = function() {
		$scope.opponentCountdown = true;
		$scope.countdownNum = 15;
		console.log("countdownNum set to 15");

		$scope.interval = $window.setInterval($scope.countdownTick.bind(this), 1000);
	};
	$scope.countdownTick = function() {
		console.log($scope.countdownNum);
		console.log(this);

		if ($scope.countdownNum >= 1) {
			$scope.countdownNum--;
		}
		if ($scope.countdownNum === 0) {
			$window.clearInterval($scope.interval);
			$scope.opponentCountdown = false;
		}
	};
	
	$scope.$on('socket:gameStarted', function(e, response) {
		$scope.newOpponent = true;
		$location.path('/preGame');
	});
}])
//Round Countdown Modal --------------------------------------
.controller('CountDownCtrl', ['$scope', 'socket', 'countDownModal', 'gameData', function($scope, socket, countDownModal, gameData) {

	$scope.closeMe = gamePauseModal.deactivate;
	$scope.closeMe();

}])
//Game Play ---------------------------------------------------
.controller('GamePlayCtrl', ['$scope', 'socket', 'countDownModal', 'currentCategory', 'gameData', function($scope, socket, countDownModal, currentCategory, gameData) {
	$scope.game = gameData.getGameInfo();
	console.log($scope.game);

	//Game state variables
	$scope.currentAnswer = "";
	$scope.currentRound = 1;

	//Set rounds 
	$scope.round1 = game.round1;
	$scope.round2 = game.round2;
	$scope.round3 = game.round3;
	$scope.round4 = game.round4;

	//Set game round info 
	$scope.setGameRounds($scope.game);

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

	$scope.countdownTick = function() {

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


