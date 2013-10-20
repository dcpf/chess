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

function buildEnterGameAttrMap (gameID, key, moveHistory, canMove) {
	moveHistory = moveHistory || [];
	return {
		gameID: gameID,
		key: key,
		initialMoveHistory: JSON.stringify(moveHistory),
		canMove: canMove
	};
}

function saveMove (req, postData) {
	var gameID = postData.gameID;
	var gameObj = getGameObject(gameID);
	var key = postData.key;
	var opponentEmail = '';
	if (playerCanMove(gameObj, key)) {
		var move = postData.move;
		gameObj.moveHistory.push(move);
		saveGameObject(gameID, gameObj);
		console.log('updated game ' + gameID + ' with move ' + move);
		if (gameObj.moveHistory.length == 1) {
			opponentEmail = gameObj.B.email;
			emailHandler.sendInviteEmail(gameObj.W.email, gameObj.B.email, gameID, gameObj.B.key, move);
		} else {
			var obj = (gameObj.moveHistory.length % 2 === 0) ? gameObj.W : gameObj.B;
			opponentEmail = obj.email;
			emailHandler.sendMoveNotificationEmail(obj.email, gameID, obj.key, move);
		}
	}
	return {status: 'ok', opponentEmail: opponentEmail};
}

exports.enterGame = enterGame;
exports.buildEnterGameAttrMap = buildEnterGameAttrMap;
exports.saveMove = saveMove;

//
// private functions
//

function getGameObject (gameID) {
	var gameObj = {};
	var file = DATA_DIR + gameID;
	if (fs.existsSync(file)) {
		var jsonStr = fs.readFileSync(file, {encoding: 'utf8'});
		gameObj = JSON.parse(jsonStr);
	}
	return gameObj;
}

function saveGameObject (gameID, gameObj) {
	var file = DATA_DIR + gameID;
	fs.writeFileSync(file, JSON.stringify(gameObj));
}

function createGame (player1Email, player2Email) {
	var whiteKey = generateKey();
	var blackKey = generateKey();
	var gameObj = {
		W: {
			email: player1Email,
			key: whiteKey
		},
		B: {
			email: player2Email,
			key: blackKey
		}
	};
	var gameID = createGameFile(gameObj);
	emailHandler.sendGameCreationEmail(player1Email, player2Email, gameID, whiteKey);
	return buildEnterGameAttrMap(gameID, whiteKey, [], true);
}

function enterExistingGame (gameID, key) {
	var gameObj = getGameObject(gameID);
	var canMove = playerCanMove(gameObj, key);
	return buildEnterGameAttrMap(gameID, key, gameObj.moveHistory, canMove);
}

function createGameFile (gameObj) {
	var gameID;
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR);
	}
	while (true) {
		gameID = generateRandomGameID();
		var file = DATA_DIR + gameID;
		if (!fs.existsSync(file)) {
			saveGameObject(gameID, gameObj);
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

function playerCanMove (gameObj, key) {
	gameObj.moveHistory = gameObj.moveHistory || [];
	var whiteKey = gameObj.W.key;
	var blackKey = gameObj.B.key;
	var canMove = false;
	if ((key == whiteKey && gameObj.moveHistory.length % 2 === 0) ||
		(key == blackKey && gameObj.moveHistory.length % 2 !== 0)) {
		canMove = true;
	}
	return canMove;
}
