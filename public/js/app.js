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
	.factory('socket', function(socketFactory) {
		return socketFactory();
	})
	.factory('welcomeModal', function(btfModal) {
		return btfModal({
			controller: 'WelcomeCtrl',
			controllerAs: 'welcome',
			templateUrl: 'views/welcome.html',
			userName: ""
		});
	})
	.factory('currentCategory', function() {
		return {
			category: ""
		}
	});