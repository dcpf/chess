var fs = require('fs');
var emailHandler = require('./emailHandler');

var DATA_DIR = '.data/';
var GAME_ID_CHARS = 'abcdefghijkmnopqrstuvwxyz234567890';
var KEY_CHARS = '123456789';

//
// public functions
//

function enterGame (req, postData) {

	var attrs = {};
	var action = postData.action;
	if (action === 'N') {
		// new game
		var player1Email = postData.player1Email;
		var player2Email = postData.player2Email;
		attrs = createGame(player1Email, player2Email);
	} else {
		// existing game
		var gameID = postData.gameID;
		var key = postData.key;
		attrs = enterExistingGame(gameID, key);
	}

	return attrs;

};

function buildAttrMap (gameID, key, moveHistory, canMove) {
	return {
		gameID: gameID,
		key: key,
		moveHistory: moveHistory || [],
		canMove: canMove
	};
}

exports.enterGame = enterGame;
exports.buildAttrMap = buildAttrMap;

//
// private functions
//

function createGame (player1Email, player2Email) {
	var whiteKey = generateKey();
	var blackKey = generateKey();
	var obj = {
		W: {
			email: player1Email,
			key: whiteKey
		},
		B: {
			email: player2Email,
			key: blackKey
		}
	};
	var gameID = createGameFile(obj);
	emailHandler.sendCreationEmail(player1Email, player2Email, gameID, whiteKey);
	return buildAttrMap(gameID, whiteKey, [], true);
}

function enterExistingGame (gameID, key) {
	var file = DATA_DIR + gameID;
	var obj = {};
	if (fs.existsSync(file)) {
		var jsonStr = fs.readFileSync(file, {encoding: 'utf8'});
		obj = JSON.parse(jsonStr);
	}
	obj.moveHistory = obj.moveHistory || [];
	var whiteKey = obj.W.key;
	var blackKey = obj.B.key;
	var canMove = false;
	if ((key == whiteKey && obj.moveHistory.length % 2 === 0) ||
		(key == blackKey && obj.moveHistory.length % 2 !== 0)) {
		canMove = true;
	}
	return buildAttrMap(gameID, key, obj.moveHistory, canMove);
}

function createGameFile (obj) {
	var gameID;
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR);
	}
	while (true) {
		gameID = generateRandomGameID();
		var file = DATA_DIR + gameID;
		if (!fs.existsSync(file)) {
			fs.writeFileSync(file, JSON.stringify(obj));
			console.log('created file ' + file);
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
