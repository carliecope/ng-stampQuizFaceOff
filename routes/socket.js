var uuid = require('node-uuid');

var categories {
	Americana : {
		rooms: {},
		openRoom: null 
	}
	AmericanLeaders : {
		rooms: {},
		openRoom: null 
	}
	MusicHistory : {
		rooms: {},
		openRoom: null 
	}
	FamousQuotes : {
		rooms: {},
		openRoom: null 
	}
	Transportation : {
		rooms: {},
		openRoom: null 
	}
	Animals : {
		rooms: {},
		openRoom: null 
	}
}

//Sample object returned from database
var gameData {
	stampImg: url('public/img/ET.jpg'),
	question: "In the movie ET, ten year old boy, Elliot, lures the alien to his bedroom using which candy?",
	answerCorrect: "Reese's Pieces",
	answer1: "M & M's",
	answer2: "Skittles",
	answer3: "Gum drops"
}

socket:on('join:game', function(data) {
	var category = categories[data.category];
	
	if (category.openRoom != null) {
		
		category.rooms[category.openRoom].player2 = data.userName; 
		socket.join(category.openRoom);
		io.to(category.openRoom);

		io.emit('send:gameData', {
			gameData: gameData;
		});
		
		category.openRoom = null;
	} else {
		var roomId = uuid.v4();
		category.rooms[roomId] = {};
		category.rooms[roomId].player1 = data.userName;
		socket.join(roomId);
		io.to(roomId).emit("Awaiting player");
		category.openRoom = roomId;
	}
});