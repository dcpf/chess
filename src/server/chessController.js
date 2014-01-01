'use strict';

var fs = require('fs');
var q = require('q');
var validator = require('validator');
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
	var obj = {};
	var dfrd = reCaptchaHandler.validateCaptcha(ip, postData.captchaChallenge, postData.captchaResponse);
	dfrd.promise.then(function(captchaVerifyResponse) {
		if (captchaVerifyResponse.success === 'true') {

			console.log('captcha validation passed');

			// get emails and validate tham
			var player1Email = postData.player1Email;
			var player2Email = postData.player2Email;
			try {
				_validateEmailAddress(player1Email);
				_validateEmailAddress(player2Email);
			} catch (e) {
				obj = e;
				deferred.resolve(obj);
				return deferred;
			}

			// create the game
			obj = _createGame(player1Email, player2Email);
			deferred.resolve(obj);

		} else {
			console.log('captcha validation failed');
			obj = new Error('Incorrect captcha. Please try again.');
			deferred.resolve(obj);
		}
	});

	return deferred;

}

function enterGame (postData) {
	var gameID = postData.gameID;
	var key = postData.key || '';
	var obj;
	try {
		obj = _enterExistingGame(gameID, key);
	} catch (e) {
		obj = e;
	}
	return obj;
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

function buildDefaultEnterGameAttrMap (error) {
	return _buildEnterGameAttrMap({}, '', '', '', false, error);
}

exports.createGame = createGame;
exports.enterGame = enterGame;
exports.saveMove = saveMove;
exports.buildDefaultEnterGameAttrMap = buildDefaultEnterGameAttrMap;

//
// private functions
//

function _buildEnterGameAttrMap (gameObj, gameID, key, perspective, canMove, error) {
	var moveHistory = gameObj.moveHistory || [];
	return {
		gameID: gameID,
		key: key,
		initialMoveHistory: JSON.stringify(moveHistory),
		perspective: perspective,
		canMove: canMove,
		whiteEmail: (gameObj.W) ? gameObj.W.email : '',
		blackEmail: (gameObj.B) ? gameObj.B.email : '',
		// TODO: set/get this as a user pref
		showLegalMovesEnabled: true,
		error: error,
		// add any config needed by the client
		config: {
			recaptcha: {
				enabled: CONFIG.recaptcha.enabled,
				publicKey: CONFIG.recaptcha.publicKey
			}
		}
	};
}

/**
* Validate an email address. Throws an error if validation fails.
*/
function _validateEmailAddress (email) {
	try {
		validator.check(email, 'Invalid email address: ' + email).len(6, 64).isEmail();
	} catch (e) {
		throw e;
	}
}

/**
* Get the game object from disk by gameID. Throws an error if no game exists by the ID.
*/
function _getGameObject (gameID) {
	var gameObj = {};
	var file = DATA_DIR + gameID;
	try {
		var jsonStr = fs.readFileSync(file, {encoding: 'utf8'});
		gameObj = JSON.parse(jsonStr);
	} catch (e) {
		e.message = 'Invalid Game ID: ' + gameID;
		throw e;
	}
	return gameObj;
}

function _saveGameObject (gameID, gameObj) {
	var file = DATA_DIR + gameID;
	fs.writeFileSync(file, JSON.stringify(gameObj));
}

function _createGame (player1Email, player2Email) {

	// Get the keys for each player
	var whiteKey = _generateKey();
	var blackKey = _generateKey();

	// If the two keys happen to be the same, loop until they are unique.
	while (whiteKey === blackKey) {
		blackKey = _generateKey();
	}

	// Build the game object
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

	// Create the game file, send the email, and return the game attr map.
	var gameID = _createGameFile(gameObj);
	emailHandler.sendGameCreationEmail(player1Email, player2Email, gameID, whiteKey);
	return _buildEnterGameAttrMap(gameObj, gameID, whiteKey, 'W', true, null);

}

/*
* Enter an existig game. Throws an error if no game exists by the passed-in ID.
*/
function _enterExistingGame (gameID, key) {
	var gameObj;
	try {
		gameObj = _getGameObject(gameID);
	} catch (e) {
		throw e;
	}
	var perspective = _getPerspective(gameObj, key);
	var canMove = _playerCanMove(gameObj, key);
	return _buildEnterGameAttrMap(gameObj, gameID, key, perspective, canMove, null);
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

function _getPerspective (gameObj, key) {
	var perspective = (gameObj.B.key == key) ? 'B' : 'W';
	return perspective;
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
