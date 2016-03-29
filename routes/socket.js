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
	stampImg: "url('public/img/ET.jpg')",
	question: "In the movie ET, ten year old boy, Elliot, lures the alien to his bedroom using which candy?",
	answerCorrect: "Reese's Pieces",
	answerA: "M & M's",
	answerB: "Skittles",
	answerC: "Gum drops"
};

io.on('connection', function(socket) {

	socket.on('join', function(data) {
		var category = categories[data.category];
		console.log(data);
		
		if (category.openRoom != null) {
			
			category.rooms[category.openRoom].player2 = data.userName; 
			socket.join(category.openRoom);
			io.to(category.openRoom);

			console.log(category.openRoom);

			io.emit('gameStarted', gameData);

			category.openRoom = null;
		} else {
			var roomId = uuid.v4();
			category.rooms[roomId] = {};
			category.rooms[roomId].player1 = data.userName;
			socket.join(roomId);
			
			io.to(roomId).emit('waiting', { roomId: roomId });
			category.openRoom = roomId;

			console.log(category.openRoom);
		}
	});
});

};