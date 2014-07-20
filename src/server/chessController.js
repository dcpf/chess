'use strict';

var fs = require('fs');
var q = require('q');
var moment = require('moment');
var gameIdFactory = require('./model/mongoGameIdFactory');
var gameDao = require('./dao/mongoGameDAO');
var userPrefsDao = require('./dao/mongoUserPrefsDAO');
var validator = require('validator');
var reCaptchaHandler = require('./reCaptchaHandler');
var emailHandler = require('./emailHandler');
var customErrors = require('./error/customErrors');

// TODO: Use const with ES6
var KEY_CHARS = '123456789';

//
// public functions
//

function createGame (ip, postData) {

	var deferred = q.defer();

    reCaptchaHandler.validateCaptcha(ip, postData.captchaChallenge, postData.captchaResponse)
        .then(function() {

            console.log('captcha validation passed');

            // get emails and validate them
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
		// TODO: Use let with ES6
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

                // TODO: Use let with ES6
                var move = postData.move;
                gameObj.moveHistory.push(move);

                gameDao.updateMoveHistory(gameID.id, gameObj.moveHistory)
                    .then(function () {
                      console.log('Updated game ' + gameID.id + ' with move ' + move);
											var opponentEmail = '';
                      if (gameObj.moveHistory.length == 1) {
                          opponentEmail = gameObj.B.email;
                          emailHandler.sendInviteEmail(gameObj.W.email, gameObj.B.email, gameIdFactory.getGameID(gameID.id, gameObj.B.key), move);
                      } else {
													// TODO: Use let with ES6
                          var obj = (gameObj.moveHistory.length % 2 === 0) ? gameObj.W : gameObj.B;
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

function findGamesByEmail (email) {

	var deferred = q.defer();

	try {
		_validateEmailAddress(email);
	} catch (err) {
		deferred.reject(err);
		return deferred.promise;
	}

	// Lower-case the email address to make sure our queries work
	email = email.toLowerCase();

	gameDao.findGamesByEmail(email)
		.then(function (records) {
			var numGames = records ? records.length : 0;
			if (numGames) {
				// TODO: Use let with ES6
				var games = [],
					record = null,
					gameObj = null,
					gameID = null,
					createDate = null,
					lastMoveDate = null;
				// TODO: Use let with ES6
				for (var i = 0; i < numGames; i++) {
					record = records[i];
					gameObj = record.gameObj;
					if (gameObj.W.email === email) {
						gameID = gameIdFactory.getGameID(record._id.toHexString(), gameObj.W.key);
					} else if (gameObj.B.email === email) {
						gameID = gameIdFactory.getGameID(record._id.toHexString(), gameObj.B.key);
					}
					createDate = _formatDate(record.createDate);
					lastMoveDate = gameObj.moveHistory ? _formatDate(record.modifyDate) : '';
					games.push(
						{
							gameID: gameID,
							createDate: createDate,
							lastMoveDate: lastMoveDate
						}
					);
				}
				emailHandler.sendForgotGameIdEmail(email, games);
				deferred.resolve({status: 'ok', email: email});
			} else {
				deferred.reject(new Error('No games found for email ' + email));
			}
		})
		.fail (function (err) {
			deferred.reject(err);
		});

	return deferred.promise;

}

exports.createGame = createGame;
exports.enterGame = enterGame;
exports.saveMove = saveMove;
exports.updateUserPrefs = updateUserPrefs;
exports.buildDefaultEnterGameAttrMap = buildDefaultEnterGameAttrMap;
exports.findGamesByEmail = findGamesByEmail;

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
	if (!validator.isEmail(email)) {
		throw new Error('Invalid email address: ' + email);
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

    // Build the game object, normalizing the email address to lower-case.
    var gameObj = {
        W: {
            email: player1Email.toLowerCase(),
            key: whiteKey
        },
        B: {
            email: player2Email.toLowerCase(),
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
	var deferred = q.defer();
	gameDao.getGameObject(gameID.id).then(function (gameObj) {
		var perspective = _getPerspective(gameObj, gameID.key);
		var canMove = _playerCanMove(gameObj, gameID.key);
		deferred.resolve(_buildEnterGameAttrMap(gameObj, gameID, perspective, canMove, null));
	}).fail (function (err) {
		if (err instanceof customErrors.InvalidGameIdError) {
			err.message = 'Invalid Game ID: ' + gameID.compositeID;
		}
		deferred.reject(err);
	});
	return deferred.promise;
}

function _generateKey () {
	var s = '';
	// TODO: Use let with ES6
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

/**
* Format the date as 07/19/2014 06:05 AM EDT 
*/
function _formatDate (date) {
	// parse the time zone out of the date string
	var tz = date.toString().split(' ').pop().replace(/[()]/g, '');
	return moment(date).format('MM/DD/YYYY hh:mm A') + ' ' + tz;
}
