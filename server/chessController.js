var fs = require('fs');
var q = require('q');
var reCaptchaHandler = require('./reCaptchaHandler');
var emailHandler = require('./emailHandler');

var DATA_DIR = '.data/';
var GAME_ID_CHARS = 'abcdefghijkmnopqrstuvwxyz234567890';
var KEY_CHARS = '123456789';

//
// public functions
//

function createGame (ip, postData) {

	var deferred = q.defer();
	var attrs = {};
	var dfrd = reCaptchaHandler.validateCaptcha(ip, postData.captchaChallenge, postData.captchaResponse);
	dfrd.promise.then(function(captchaVerifyResponse) {
		if (captchaVerifyResponse.success === 'true') {
			console.log('captcha validation passed');
			var player1Email = postData.player1Email;
			var player2Email = postData.player2Email;
			attrs = _createGame(player1Email, player2Email);
			deferred.resolve(attrs);
		} else {
			console.log('captcha validation failed');
			attrs.error = {msg: 'Incorrect captcha. Please try again.'};
			deferred.resolve(attrs);
		}
	});

	return deferred;

}

function enterGame (postData) {
	var gameID = postData.gameID;
	var key = postData.key || '';
	var attrs = _enterExistingGame(gameID, key);
	return attrs;
}

function saveMove (postData) {
	var gameID = postData.gameID;
	var gameObj = _getGameObject(gameID);
	var key = postData.key;
	var opponentEmail = '';
	if (_playerCanMove(gameObj, key)) {
		var move = postData.move;
		gameObj.moveHistory.push(move);
		_saveGameObject(gameID, gameObj);
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

function buildEnterGameAttrMap (gameObj, gameID, key, currentPlayer, canMove) {
	var moveHistory = gameObj.moveHistory || [];
	return {
		gameID: gameID,
		key: key,
		initialMoveHistory: JSON.stringify(moveHistory),
		currentPlayer: currentPlayer,
		canMove: canMove,
		whiteEmail: (gameObj.W) ? gameObj.W.email : '',
		blackEmail: (gameObj.B) ? gameObj.B.email : ''
	};
}

function buildDefaultEnterGameAttrMap () {
	return buildEnterGameAttrMap({}, '', '', '', false);
}

exports.createGame = createGame;
exports.enterGame = enterGame;
exports.saveMove = saveMove;
exports.buildEnterGameAttrMap = buildEnterGameAttrMap;
exports.buildDefaultEnterGameAttrMap = buildDefaultEnterGameAttrMap;


//
// private functions
//

function _getGameObject (gameID) {
	var gameObj = {};
	var file = DATA_DIR + gameID;
	if (fs.existsSync(file)) {
		var jsonStr = fs.readFileSync(file, {encoding: 'utf8'});
		gameObj = JSON.parse(jsonStr);
	}
	return gameObj;
}

function _saveGameObject (gameID, gameObj) {
	var file = DATA_DIR + gameID;
	fs.writeFileSync(file, JSON.stringify(gameObj));
}

function _createGame (player1Email, player2Email) {
	var whiteKey = _generateKey();
	var blackKey = _generateKey();
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
	var gameID = _createGameFile(gameObj);
	emailHandler.sendGameCreationEmail(player1Email, player2Email, gameID, whiteKey);
	return buildEnterGameAttrMap(gameObj, gameID, whiteKey, 'W', true);
}

function _enterExistingGame (gameID, key) {
	var gameObj = _getGameObject(gameID);
	var currentPlayer = _getCurrentPlayer(gameObj);
	var canMove = _playerCanMove(gameObj, key);
	return buildEnterGameAttrMap(gameObj, gameID, key, currentPlayer, canMove);
}

function _createGameFile (gameObj) {
	var gameID;
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR);
	}
	while (true) {
		gameID = _generateRandomGameID();
		var file = DATA_DIR + gameID;
		if (!fs.existsSync(file)) {
			_saveGameObject(gameID, gameObj);
			console.log('created file ' + file);
			break;
		}
	}
	return gameID;
}

function _generateRandomGameID () {
	var s = '';
    for (var i = 0; i < 12; i++) {
        s += GAME_ID_CHARS.charAt(Math.floor(Math.random() * GAME_ID_CHARS.length));
    }
    return s;
}

function _generateKey () {
	var s = '';
    for (var i = 0; i < 5; i++) {
        s += KEY_CHARS.charAt(Math.floor(Math.random() * KEY_CHARS.length));
    }
    return s;
}

function _getCurrentPlayer (gameObj) {
	gameObj.moveHistory = gameObj.moveHistory || [];
	var currentPlayer = (gameObj.moveHistory.length % 2 === 0) ? 'W' : 'B';
	return currentPlayer;
}

function _playerCanMove (gameObj, key) {
	var whiteKey = gameObj.W.key;
	var blackKey = gameObj.B.key;
	var canMove = false;
	var currentPlayer = _getCurrentPlayer(gameObj);
	if ((key == whiteKey && currentPlayer === 'W') ||
		(key == blackKey && currentPlayer === 'B')) {
		canMove = true;
	}
	return canMove;
}
