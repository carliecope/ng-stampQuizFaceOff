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
	function pickRandomQuestion(obj) {
	    var result;
	    var count = 0;
	    for (var prop in obj)
	        if (Math.random() < 1/++count)
	           result = prop;
	    return result;
	}
	function setGameQuestions(categoryGameData) {
		responseGameData = {};
		count = 1;

		while(count < 5) {
			var newQuestion = pickRandomQuestion(categoryGameData);

			if (responseGameData.hasOwnProperty(newQuestion)) {
				newQuestion = pickRandomQuestion(categoryGameData);
			} else {
				responseGameData['round' + count] = categoryGameData[newQuestion];
				count ++;
			}	
		}
		return responseGameData;
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
					
					category.gameData = {};

					for(var i = 0; i < categoryData.length; i++) {
						category.gameData['round' + (i+1)] = categoryData[i];
					}
					response.gameData = setGameQuestions(category.gameData);
					io.emit('gameStarted', response);
				});
			} else {
				response.gameData = setGameQuestions(category.gameData);
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

