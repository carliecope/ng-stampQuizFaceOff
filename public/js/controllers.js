angular.module('myApp')

//Game Play ------------------
.controller('gamePlayCtrl', ['$scope', '$rootScope', 'socket', 'welcomeModal', 'currentCategory', 'gameData', function($scope, $rootScope, socket, welcomeModal, currentCategory, gameData) {
	console.log('in gamePlayCtrl');
	console.log(gameData);

	$scope.currentAnswer = "";
	$scope.currentRound = 1;
	
	setGameRounds(gameData.gameInfo);

	gameData.setPlayer1Name(welcomeModal.userName);

	/*
	socket.emit('join', {
		category : currentCategory.category,
		userName : welcomeModal.userName
	}); */
	
	/*
	socket.on('gameStarted', function(response) {
		console.log(response);
		$scope.round1 = response.round1;
		$scope.round2 = response.round2;
		$scope.round3 = response.round3;
		$scope.round4 = response.round4;
		gameData.player1.name = response.player1;
		gameData.player2.name = response.player2;
		gameData.roomId.roomId = response.category.openRoom;
	}); */

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

//Game Over ----------------------
.controller('gameOverCtrl', ['$scope', 'socket', function($scope, socket) {

}])

//Home Screen Categories -----------------
.controller('HomeCtrl', ['$scope', '$location', '$rootScope', '$q', '$timeout', 'socket', 'welcomeModal', 'currentCategory', 'gameData', function($scope, $location, $rootScope, $q, $timeout, socket, welcomeModal, currentCategory, gameData) {
	
	$scope.welcomeModal = welcomeModal;
	$scope.currentCategory = currentCategory;
	$scope.userName = gameData.getPlayer1Name();

	$scope.showModal = welcomeModal.activate;

	if (gameData.getFirstTimeUser()) {
		$scope.showModal(); 
	}

	function wait() {
		var defer = $q.defer();
		$timeout(function() {
			defer.resolve();
		}, 6000);
		return defer.promise;
    }

	$scope.categoryClick = function(category) {
		currentCategory.category = category;

		socket.emit('join', {
			category : currentCategory.category,
			userName : welcomeModal.userName
		});

		wait().then(function() {
			$location.path('/gamePlay/' + category + '/' + welcomeModal.userName);
		});
	};

	socket.on('gameStarted', function(response) {
		gameData.gameCopy = response;

		if (response.player1 === welcomeModal.userName) {
			gameData.player1.name = response.player1;
			gameData.player2.name = response.player2;
		} else {
			gameData.player1.name = response.player2;
			gameData.player2.name = response.player1;
		}

		gameData.roomId.roomId = response.category.openRoom;

		console.log(gameData.gameCopy);
	});
}])

//Username/Welcome Modal --------------------------
.controller('WelcomeCtrl', ['$scope', '$rootScope', 'socket', 'welcomeModal', 'gameData', function($scope, $rootScope, socket, welcomeModal, gameData) {

	$scope.closeMe = welcomeModal.deactivate;

	$scope.updateUserName = function(userName) {
		gameData.setFirstTimeUser(false);
		gameData.setPlayer1Name(userName);
		
		$scope.closeMe();
	}; 

}]);
