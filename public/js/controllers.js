angular.module('myApp')

//Game Play ------------------
.controller('gamePlayCtrl', ['$scope', '$rootScope', 'socket', 'welcomeModal', 'currentCategory', 'gameData', function($scope, $rootScope, socket, welcomeModal, currentCategory, gameData) {
	console.log('in gamePlayCtrl');
	console.log(gameCopy);

	$scope.currentAnswer = "";
	$scope.currentRound = 1;
	
	$scope.setGameRounds(gameData.gameCopy);

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
.controller('GameOverCtrl', ['$scope', 'socket', function($scope, socket) {

}])

//Home Screen Categories -----------------
.controller('HomeCtrl', ['$scope', '$location', '$rootScope', '$q', '$timeout', 'socket', 'welcomeModal', 'currentCategory', 'gameData', 'loadingModal', function($scope, $location, $rootScope, $q, $timeout, socket, welcomeModal, loadingModal, currentCategory, gameData) {
	console.log('home controller');
	console.log(gameData.firstTimeUser);
	console.log(gameData.player2);
	$scope.welcomeModal = welcomeModal;
	$scope.currentCategory = currentCategory;
	$scope.gameData = gameData;

	$scope.showWelcome = welcomeModal.activate;
	$scope.showLoading = loadingModal.activate;

	//var firstTimeUser = gameData.getFirstTimeUser();

	if (true) {
		$scope.showWelcome(); 
	}
	//$scope.userName = gameData.getPlayer1Name();

	function wait() {
		var defer = $q.defer();
		$timeout(function() {
			defer.resolve();
		}, 2000);
		return defer.promise;
    }
    function notifyUser() {

    }

	$scope.categoryClick = function(category) {
		currentCategory.category = category;

		var userName = gameData.getPlayer1Name();

		socket.emit('join', {
			category : currentCategory.category,
			userName : userName
		});

		wait().then(function() {

		}).then(function() {
			$location.path('/gamePlay/' + category + '/' + welcomeModal.userName);
		});
	};

	socket.on('gameStarted', function(response) {
		gameData.gameCopy = response;

		if (response.player1 === $scope.userName) {
			gameData.player2.name = response.player2;
		} else {
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

}])
//Username/Loading Modal --------------------------
.controller('LoadingCtrl', ['$scope', '$rootScope', 'socket', 'loadingModal', function($scope, $rootScope, socket, loadingModal) {

	$scope.closeMe = loadingModal.deactivate;

}]);

