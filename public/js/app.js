angular.module('myApp', ['ngRoute', 'btford.socket-io'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/', {
			templateUrl: 'views/home.html',
			controller: 'HomeCtrl as home'
		}).when('/gamePlay', {
			templateUrl: 'views/gamePlay.html',
			controller: 'gamePlayCtrl as gamePlay'
		}).when('/gameOver', {
			templateUrl: 'views/gameOver.html',
			controller: 'gameOverCtrl as gameOver'
		}).otherwise('error', {
			template: '<p>Error - Page not Found</p>'
		});
	}]);