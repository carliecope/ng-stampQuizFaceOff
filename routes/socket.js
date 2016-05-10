module.exports = function (io) {
	var uuid = require('node-uuid');
	var http = require('http');
	var request = require("request");

	var categories = {
		Music : {
			rooms: {},
			openRoom: null,
			gameData: null 
		},
		Science : {
			rooms: {},
			openRoom: null,
			gameData: null  
		},
		Movies : {
			rooms: {},
			openRoom: null,
			gameData: null  
		},
		Aviation : {
			rooms: {},
			openRoom: null,
			gameData: null  
		},
		USPresidents : {
			rooms: {},
			openRoom: null,
			gameData: null  
		},
		Olympics : {
			rooms: {},
			openRoom: null,
			gameData: null  
		}
	};

	// http://stampgames-memsearch.rhcloud.com/api/questions/{category}
	function getGameInfo(category, callback) {

	    return http.get({
	        host: 'stampgames-memsearch.rhcloud.com',
	        path: '/api/questions/' + category
	    }, function(response) {
	        // Continuously update stream with data
	        var body = '';
	        response.on('data', function(d) {
	            body += d;
	        });
	        response.on('end', function() {

	            // Data reception is done, do whatever with it!
	            var parsed = JSON.parse(body);
	            callback(parsed);
	        });
	    });
	}
	function shuffleQuestions(array) {
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
	}

	io.on('connection', function(socket) {

		socket.on('join', function(data) {

			var category = categories[data.category];

			var response = {};

			if (category.openRoom != null) {
				
				var room = category.rooms[category.openRoom];
				room.player2 = data.userName;

				socket.join(category.openRoom);
				io.to(category.openRoom);

				response.player1 = room.player1;
				response.player2 = room.player2;
				response.roomId = category.openRoom;

				category.openRoom = null;
			} else {
				var roomId = uuid.v4();
				category.rooms[roomId] = {};
				category.rooms[roomId].player1 = data.userName;
				socket.join(roomId);
				
				response.roomId = roomId;
				response.player1 = data.userName;

				io.to(roomId);
				category.openRoom = roomId;
			}

			if (category.gameData === null) {
				getGameInfo(data.category, function(categoryData) {
					
					var shuffledArray = [];
					shuffledArray = shuffleQuestions(categoryData);
					category.gameData = {};

					for(var i = 0; i < shuffledArray.length; i++) {
						category.gameData['round' + (i+1)] = shuffledArray[i];
					}
					response.gameData = category.gameData;
					io.emit('gameStarted', response);
				});
			} else {
				response.gameData = category.gameData;
				io.emit('gameStarted', response);
			}		
		});
		socket.on('sendCloseRoomNotice', function(data) {
			var category = categories[data.category];
			category.openRoom = null;

		});
		socket.on('sendAnsFeedback', function(data) {
			var category = categories[data.category];
			var room = category.rooms[data.roomId];

			io.to(data.roomId).emit('getOpponentFeedback', {
				userName: data.userName,
				score: data.score,
			});
		});
		socket.on('sendNoAnswer', function(data) {
			var category = categories[data.category];
			var room = category.rooms[data.roomId];

			io.to(data.roomId).emit('getNoAnswer', {
				userName: data.userName
			});
		});
		socket.on('exitRoom', function(data) {
			var category = categories[data.category];
			var room = category.rooms[data.roomId];

			socket.leave(category.roomId);

			// // delete object['property']
			// delete category.rooms[room];
		});
	});
};

