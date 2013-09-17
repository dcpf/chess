var fs = require('fs');

var DATA_DIR = '.data/';
var GAME_NAME_CHARS = "ABCDEFGHIJKLMNPQRSTUVWXYZ23456789";

exports.enterGame = function (req, postData) {

	var newOrExisting = postData['newOrExisting'];
	if (newOrExisting === 'N') {
		var player1Email = postData['player1Email'];
		var player2Email = postData['player2Email'];
		createGame(player1Email, player2Email);
	} else {
		var existingGameName = postData['existingGameName'];
		var key = postData['key'];
		enterExistingGame(existingGameName, key);
	}

	return 'html/chess.html';

};

function createGame (player1Email, player2Email) {
	createGameFile(player1Email, player2Email);
}

function enterExistingGame (existingGameName, key) {

}

function createGameFile (player1Email, player2Email) {
	var obj = {
		W: player1Email,
		B: player2Email
	};
	var gameName;
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR);
	}
	while (true) {
		var gameName = generateRandomGameName();
		if (!fs.existsSync(DATA_DIR + gameName)) {
			fs.writeFileSync(DATA_DIR + gameName, JSON.stringify(obj));
			console.log('created file ' + DATA_DIR + gameName);
			break;
		}
	}
	return gameName;
}


function generateRandomGameName () {
	var s = "";
    for (var i = 0; i < 12; i++) {
        s += GAME_NAME_CHARS.charAt(Math.floor(Math.random() * GAME_NAME_CHARS.length));
    }
    return s;
}
