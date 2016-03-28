angular.module('myApp', ['ngRoute', 'btford.socket-io', 'btford.modal'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/', {
			templateUrl: 'views/home.html',
			controller: 'HomeCtrl as home'
		}).when('/gamePlay/:category/:userName', {
			templateUrl: 'views/gamePlay.html',
			controller: 'gamePlayCtrl as gamePlay'
		}).when('/gameOver', {
			templateUrl: 'views/gameOver.html',
			controller: 'gameOverCtrl as gameOver'
		}).otherwise('error', {
			template: '<p>Error - Page not Found</p>'
		});
	}])
	.factory('socket', function($rootScope) {
		var socket = io.connect();
		return {
		    on: function (eventName, callback) {
		      	socket.on(eventName, function () {  
		        	var args = arguments;
		        	$rootScope.$apply(function () {
		          		callback.apply(socket, args);
		        	});
		      	});
    		},
		    emit: function (eventName, data, callback) {
		      	socket.emit(eventName, data, function () {
		        	var args = arguments;
		        	$rootScope.$apply(function () {
		          		if (callback) {
		            	callback.apply(socket, args);
		          		}
		        	});
		      	});
		    }
		};
	})
	.factory('welcomeModal', function(btfModal) {
		return btfModal({
			controller: 'WelcomeCtrl',
			controllerAs: 'welcome',
			templateUrl: 'views/welcome.html'
		});
	});