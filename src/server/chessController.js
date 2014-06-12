'use strict';

var fs = require('fs');
var q = require('q');
var gameIdFactory = require('./model/gameIdFactory');
var gameDao = require('./dao/mongoGameDAO');
var userPrefsDao = require('./dao/mongoUserPrefsDAO');
var validator = require('validator');
var reCaptchaHandler = require('./reCaptchaHandler');
var emailHandler = require('./emailHandler');

const KEY_CHARS = '123456789';

//
// public functions
//

function createGame (ip, postData) {

	var deferred = q.defer();

    reCaptchaHandler.validateCaptcha(ip, postData.captchaChallenge, postData.captchaResponse)
        .then(function() {

            console.log('captcha validation passed');

            // get emails and validate tham
            var player1Email = postData.player1Email;
            var player2Email = postData.player2Email;
            try {
                _validateEmailAddress(player1Email);
                _validateEmailAddress(player2Email);
                deferred.resolve(_createGame(player1Email, player2Email));
            } catch (err) {
                deferred.reject(err);
            }

        })
        .fail(function(err){
            deferred.reject(err);
        });

	return deferred.promise;

}

function enterGame (postData) {
	var gameID;
	try {
		gameID = gameIdFactory.getGameID(postData.gameID);
	} catch (err) {
		var deferred = q.defer();
		deferred.reject(err);
		return deferred.promise;
	}
	return _enterExistingGame(gameID);
}

function saveMove (postData) {

    var deferred = q.defer();
    var gameID = gameIdFactory.getGameID(postData.gameID);

    gameDao.getGameObject(gameID.id)
        .then(function (gameObj) {

            if (_playerCanMove(gameObj, gameID.key)) {

                let move = postData.move;
                gameObj.moveHistory.push(move);

                gameDao.saveGame(gameID.id, gameObj)
                    .then(function () {
                      console.log('Updated game ' + gameID.id + ' with move ' + move);
											var opponentEmail = '';
                      if (gameObj.moveHistory.length == 1) {
                          opponentEmail = gameObj.B.email;
                          emailHandler.sendInviteEmail(gameObj.W.email, gameObj.B.email, gameIdFactory.getGameID(gameID.id, gameObj.B.key), move);
                      } else {
                          let obj = (gameObj.moveHistory.length % 2 === 0) ? gameObj.W : gameObj.B;
                          opponentEmail = obj.email;
                          emailHandler.sendMoveNotificationEmail(obj.email, gameIdFactory.getGameID(gameID.id, obj.key), move);
                      }
                      deferred.resolve({status: 'ok', opponentEmail: opponentEmail});
                    })
                    .fail(function (err) {
                        deferred.reject(err);
                    });

            }

        })
        .fail(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;

}

function updateUserPrefs (postData) {
	var userEmail = postData.userEmail;
	var name = postData.name;
	var value = postData.value;
	return userPrefsDao.setUserPref(userEmail, name, value);
}

function buildDefaultEnterGameAttrMap (error) {
	return _buildEnterGameAttrMap({}, '', '', false, error);
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
function _buildEnterGameAttrMap (gameObj, gameID, perspective, canMove, error) {

	// vars needed for the game
	var chessVars = {
		gameID: gameID.compositeID,
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

    // user prefs
    var userEmail = _getCurrentUserEmail(gameObj, gameID.key);
    return userPrefsDao.getUserPrefs(userEmail).then(function (userPrefs) {
        var user = {
            email: userEmail,
            prefs: userPrefs.prefs || {}
        };
        return {
            chessVars: JSON.stringify(chessVars),
            config: JSON.stringify(config),
            user: JSON.stringify(user)
        };
    });

}

/**
* Validate an email address. Throws an error if validation fails.
*/
function _validateEmailAddress (email) {
	validator.check(email, 'Invalid email address: ' + email).len(6, 64).isEmail();
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

    return gameDao.createGame(gameObj).then(function (gameID) {
        console.log('Created game ' + gameID);
        var newGameIdObj = gameIdFactory.getGameID(gameID, whiteKey);
        emailHandler.sendGameCreationEmail(player1Email, player2Email, newGameIdObj);
        return _buildEnterGameAttrMap(gameObj, newGameIdObj, 'W', true, null);
    });

}

function _enterExistingGame (gameID) {
    return gameDao.getGameObject(gameID.id).then(function (gameObj) {
        var perspective = _getPerspective(gameObj, gameID.key);
        var canMove = _playerCanMove(gameObj, gameID.key);
        return _buildEnterGameAttrMap(gameObj, gameID, perspective, canMove, null);
    });
}

function _generateKey () {
	var s = '';
    for (let i = 0; i < 5; i++) {
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
