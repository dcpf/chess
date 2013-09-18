var fs = require('fs');
var emailHandler = require('./emailHandler');
var View = require('./model/View');

var DATA_DIR = '.data/';
var GAME_ID_CHARS = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789';
var KEY_CHARS = '123456789';

exports.enterGame = function (req, postData) {

	var attrs = {};
	var newOrExisting = postData['newOrExisting'];
	if (newOrExisting === 'N') {
		var player1Email = postData['player1Email'];
		var player2Email = postData['player2Email'];
		var gameID = createGame(player1Email, player2Email);
		attrs.gameID = gameID;
	} else {
		var existingGameID = postData['existingGameID'];
		var key = postData['key'];
		enterExistingGame(existingGameID, key);
	}

	var view = new View('html/chess.html', attrs);
	return view;

};

function createGame (player1Email, player2Email) {
	var gameID = createGameFile(player1Email, player2Email);
	var key = generateKey();
	emailHandler.sendCreationEmail(player1Email, player2Email, gameID, key);
	return gameID;
}

function enterExistingGame (existingGameID, key) {

}

function createGameFile (player1Email, player2Email) {
	var obj = {
		W: player1Email,
		B: player2Email
	};
	var gameID;
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR);
	}
	while (true) {
		gameID = generateRandomGameID();
		if (!fs.existsSync(DATA_DIR + gameID)) {
			fs.writeFileSync(DATA_DIR + gameID, JSON.stringify(obj));
			console.log('created file ' + DATA_DIR + gameID);
			break;
		}
	}
	return gameID;
}


function generateRandomGameID () {
	var s = '';
    for (var i = 0; i < 12; i++) {
        s += GAME_ID_CHARS.charAt(Math.floor(Math.random() * GAME_ID_CHARS.length));
    }
    return s;
}

function generateKey () {
	var s = '';
    for (var i = 0; i < 5; i++) {
        s += KEY_CHARS.charAt(Math.floor(Math.random() * KEY_CHARS.length));
    }
    return s;
}
