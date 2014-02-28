'use strict';

var fs = require('fs');
var q = require('q');
var gameDao = require('./dao/gameDAO');
var userPrefsDao = require('./dao/userPrefsDAO');
var validator = require('validator');
var reCaptchaHandler = require('./reCaptchaHandler');
var emailHandler = require('./emailHandler');

var KEY_CHARS = '123456789';

//
// public functions
//

function createGame (ip, postData) {

	var deferred = q.defer();
	var obj = {};
	var validateCaptchaResponse = reCaptchaHandler.validateCaptcha(ip, postData.captchaChallenge, postData.captchaResponse);
	validateCaptchaResponse.then(function(captchaVerifyResponse) {
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
				return deferred.promise;
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

	return deferred.promise;

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
	var gameObj = gameDao.getGameObject(gameID);
	var key = postData.key;
	var opponentEmail = '';
	if (_playerCanMove(gameObj, key)) {
		var move = postData.move;
		gameObj.moveHistory.push(move);
		gameDao.saveGame(gameID, gameObj);
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

function updateUserPrefs (postData) {
	var userEmail = postData.userEmail;
	var name = postData.name;
	var value = postData.value;
	return userPrefsDao.setUserPref(userEmail, name, value);
}

function buildDefaultEnterGameAttrMap (error) {
	return _buildEnterGameAttrMap({}, '', '', '', false, error);
}

exports.createGame = createGame;
exports.enterGame = enterGame;
exports.saveMove = saveMove;
exports.updateUserPrefs = updateUserPrefs;
exports.buildDefaultEnterGameAttrMap = buildDefaultEnterGameAttrMap;

//
// private functions
//

/**
* Generate the chessVars, config, and user objects needed by the client.
*/
function _buildEnterGameAttrMap (gameObj, gameID, key, perspective, canMove, error) {

	// vars needed for the game
	var chessVars = {
		gameID: gameID,
		key: key,
		initialMoveHistory: gameObj.moveHistory || [],
		perspective: perspective,
		canMove: canMove,
		whiteEmail: (gameObj.W) ? gameObj.W.email : '',
		blackEmail: (gameObj.B) ? gameObj.B.email : '',
		error: (error) ? error.message : ''
	};

	// add config needed by the client
	var config = {
		recaptcha: {
			enabled: GLOBAL.CONFIG.recaptcha.enabled,
			publicKey: GLOBAL.CONFIG.recaptcha.publicKey
		}
	};

	var userEmail = _getCurrentUserEmail(gameObj, key);
	var user = {
		email: userEmail,
		prefs: userPrefsDao.getUserPrefs(userEmail)
	};

	return {
		chessVars: JSON.stringify(chessVars),
		config: JSON.stringify(config),
		user: JSON.stringify(user)
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
	var gameID = gameDao.createGame(gameObj);
	emailHandler.sendGameCreationEmail(player1Email, player2Email, gameID, whiteKey);
	return _buildEnterGameAttrMap(gameObj, gameID, whiteKey, 'W', true, null);

}

/*
* Enter an existig game. Throws an error if no game exists by the passed-in ID.
*/
function _enterExistingGame (gameID, key) {
	var gameObj;
	try {
		gameObj = gameDao.getGameObject(gameID);
	} catch (e) {
		throw e;
	}
	var perspective = _getPerspective(gameObj, key);
	var canMove = _playerCanMove(gameObj, key);
	return _buildEnterGameAttrMap(gameObj, gameID, key, perspective, canMove, null);
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

/**
* Gets the email of the current user based on the passed-in key
*/
function _getCurrentUserEmail (gameObj, key) {
	var email = '';
	if (gameObj.W && key == gameObj.W.key) {
		email = gameObj.W.email;
	} else if (gameObj.B && key == gameObj.B.key) {
		email = gameObj.B.email;
	}
	return email;
}
