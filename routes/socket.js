module.exports = function (io) {
	var uuid = require('node-uuid');

	var categories = {
		Music : {
			rooms: {},
			openRoom: null 
		},
		Science : {
			rooms: {},
			openRoom: null 
		},
		Movies : {
			rooms: {},
			openRoom: null 
		},
		Aviation : {
			rooms: {},
			openRoom: null 
		},
		USPresidents : {
			rooms: {},
			openRoom: null 
		},
		Olympics : {
			rooms: {},
			openRoom: null 
		}
	};

	//Sample object returned from database
	var gameData = {
		round1 : {
			stampImg: "url('public/img/ET.jpg')",
			question: "In the movie ET, a ten year old boy named Elliot, lures an alien to his bedroom using which candy?",
			correct: "Reese's Pieces",
			ans1: "M & M's",
			ans2: "Skittles",
			ans3: "Gum drops"
		},
		round2 : {
			stampImg: "url('public/img/ET.jpg')",
			question: "In the movie ET, a ten year old boy named Elliot, lures an alien to his bedroom using which candy?",
			correct: "Reese's Pieces",
			ans1: "M & M's",
			ans2: "Skittles",
			ans3: "Gum drops"
		},
		round3 : {
			stampImg: "url('public/img/ET.jpg')",
			question: "In the movie ET, a ten year old boy named Elliot, lures an alien to his bedroom using which candy?",
			correct: "Reese's Pieces",
			ans1: "M & M's",
			ans2: "Skittles",
			ans3: "Gum drops"
		},
		round4 : {
			stampImg: "url('public/img/ET.jpg')",
			question: "In the movie ET, a ten year old boy named Elliot, lures an alien to his bedroom using which candy?",
			correct: "Reese's Pieces",
			ans1: "M & M's",
			ans2: "Skittles",
			ans3: "Gum drops"
		}
	};

	io.on('connection', function(socket) {

		socket.on('join', function(data) {
			var category = categories[data.category];
			var response = {};
			response.gameData = gameData;
			// console.log(data);
			
			if (category.openRoom != null) {
				
				var room = category.rooms[category.openRoom];
				room.player2 = data.userName;

				socket.join(category.openRoom);
				io.to(category.openRoom);

				// console.log(category.openRoom);

				response.player1 = room.player1;
				response.player2 = room.player2;
				response.roomId = category.openRoom;

				// console.log(response);

				io.emit('gameStarted', response);

				category.openRoom = null;
			} else {
				var roomId = uuid.v4();
				category.rooms[roomId] = {};
				category.rooms[roomId].player1 = data.userName;
				socket.join(roomId);
				
				response.roomId = roomId;
				response.player1 = data.userName;

				io.to(roomId).emit('gameStarted', response);
				category.openRoom = roomId;

				// console.log(category.openRoom);
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

