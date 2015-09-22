'use strict';

var fs = require('fs');
var moment = require('moment');
var gameIdFactory = require('./model/mongoGameIdFactory');
var gameDao = require('./dao/mongoGameDAO');
var userPrefsDao = require('./dao/mongoUserPrefsDAO');
var validator = require('validator');
var reCaptchaHandler = require('./reCaptchaHandler');
var eventEmitter = require('./eventEmitter');
var customErrors = require('./error/customErrors');

const KEY_CHARS = '123456789';

//
// public functions
//

function createGame (ip, postData) {

	// get emails and validate them
	var player1Email = postData.player1Email;
	var player2Email = postData.player2Email;
	try {
		_validateEmailAddress(player1Email, "Email Address is required");
		_validateEmailAddress(player2Email, "Opponent's Email Address is required");
	} catch (err) {
		return Promise.reject(err);
	}

    var promise = new Promise((resolve, reject) => {
        // Email validation has passed. Now validate the captcha and create the game.
        reCaptchaHandler.validateCaptcha(ip, postData.captchaResponse)
		  .then(() => {
            resolve(_createGame(player1Email, player2Email));
        })
        .catch((err) => {
            reject(err);
        });
    });

    return promise;

}

function enterGame (postData) {
	var gameID;
	if (!postData.gameID.trim()) {
		return Promise.reject(new Error('Game ID is required'));
	}
	try {
		gameID = gameIdFactory.getGameID(postData.gameID);
	} catch (err) {
		return Promise.reject(err);
	}
	return _enterExistingGame(gameID);
}

function saveMove (postData) {

    var gameID = gameIdFactory.getGameID(postData.gameID);

    var promise = new Promise((resolve, reject) => {
        gameDao.getGameObject(gameID.id)
            .then((obj) => {
        
                var gameObj = obj.gameObj;
        
                if (_playerCanMove(gameObj, gameID.key)) {

                    let move = postData.move;
                    gameObj.moveHistory.push(move);

                    gameDao.updateMoveHistory(gameID.id, gameObj.moveHistory)
                        .then(() => {
                            console.log(`Updated game ${gameID.id} with move ${move}`);
                            var opponentEmail = '';
                            if (gameObj.moveHistory.length == 1) {
                                opponentEmail = gameObj.B.email;
                                eventEmitter.emit(eventEmitter.messages.SEND_INVITE_NOTIFICATION, gameObj, gameIdFactory.getGameID(gameID.id, gameObj.B.key), move);
                            } else {
                                let obj = (gameObj.moveHistory.length % 2 === 0) ? gameObj.W : gameObj.B;
                                opponentEmail = obj.email;
                                eventEmitter.emit(eventEmitter.messages.SEND_MOVE_NOTIFICATION, obj.email, gameIdFactory.getGameID(gameID.id, obj.key), move);
                            }
                        resolve({status: 'ok', opponentEmail: opponentEmail, move: move, gameID: gameID.compositeID});
                    })
                    .catch((err) => {
                        reject(err);
                    });

                }

        })
        .catch((err) => {
            reject(err);
        });
    });
    
    return promise;
    
}

function updateUserPrefs (postData) {
	var userEmail = postData.userEmail;
	var name = postData.name;
	var value = postData.value;
	return userPrefsDao.setUserPref(userEmail, name, value);
}

function findGamesByEmail (email) {

	try {
		_validateEmailAddress(email, "Email Address is required");
	} catch (err) {
		return Promise.reject(err);
	}

	// Lower-case the email address to make sure our queries work
	email = email.toLowerCase();

    var promise = new Promise((resolve, reject) => {
        gameDao.findGamesByEmail(email)
		  .then((records) => {
            var numGames = records ? records.length : 0;
            if (numGames) {
                let games = [],
					record = null,
					gameObj = null,
					gameID = null,
					createDate = null,
					lastMoveDate = null;
				for (let i = 0; i < numGames; i++) {
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
                eventEmitter.emit(eventEmitter.messages.SEND_FORGOT_GAME_ID_NOTIFICATION, email, games);
				resolve({status: 'ok', email: email});
            } else {
                reject(new Error(`No games found for email ${email}`));
            }
        })
		.catch ((err) => {
            reject(err);
        });
    });
    
    return promise;
        
}

function sendFeedback (data) {
    eventEmitter.emit(eventEmitter.messages.SEND_FEEDBACK_NOTIFICATION, data);
}

exports.createGame = createGame;
exports.enterGame = enterGame;
exports.saveMove = saveMove;
exports.updateUserPrefs = updateUserPrefs;
exports.findGamesByEmail = findGamesByEmail;
exports.sendFeedback = sendFeedback;

//
// private functions
//

/**
* Generate the gameState and user objects needed by the game.
*/
function _buildGameAttrMap (gameObj, gameID, perspective, canMove, error) {

	// vars needed for the game
	var gameState = {
		gameID: gameID.compositeID,
		moveHistory: gameObj.moveHistory || [],
		perspective: perspective,
		canMove: canMove,
		whiteEmail: (gameObj.W) ? gameObj.W.email : '',
		blackEmail: (gameObj.B) ? gameObj.B.email : '',
		error: (error) ? error.message : ''
	};

    // user prefs
    var userEmail = _getCurrentUserEmail(gameObj, gameID.key);
    return userPrefsDao.getUserPrefs(userEmail).then((userPrefs) => {
        var user = {
            email: userEmail,
            prefs: userPrefs.prefs || {}
        };
        return {
            gameState: gameState,
            user: user
        };
    });

}

/**
* Validate an email address. Throws an error if validation fails.
* @param String - Email address to validate
* @param String - Err msg to render for a missing required value
*/
function _validateEmailAddress (email, requiredMsg) {
	if (!email || !email.trim()) {
		throw new Error(requiredMsg);
	}
	if (!validator.isEmail(email)) {
		throw new Error(`Invalid email address: ${email}`);
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

    return gameDao.createGame(gameObj).then((gameID) => {
        console.log(`Created game ${gameID}`);
        var newGameIdObj = gameIdFactory.getGameID(gameID, whiteKey);
        eventEmitter.emit(eventEmitter.messages.SEND_GAME_CREATION_NOTIFICATION, player1Email, player2Email, newGameIdObj);
        return _buildGameAttrMap(gameObj, newGameIdObj, 'W', true, null);
    });

}

function _enterExistingGame (gameID) {
    var promise = new Promise((resolve, reject) => {
        gameDao.getGameObject(gameID.id).then((obj) => {
            var gameObj = obj.gameObj;
            var perspective = _getPerspective(gameObj, gameID.key);
            var canMove = _playerCanMove(gameObj, gameID.key);
            resolve(_buildGameAttrMap(gameObj, gameID, perspective, canMove, null));
        }).catch ((err) => {
            if (err instanceof customErrors.InvalidGameIdError) {
                err.message = `Invalid Game ID: ${gameID.compositeID}`;
            }
            reject(err);
        });
    });
    return promise;
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

/**
* Format the date as 07/19/2014 06:05 AM EDT
*/
function _formatDate (date) {
	// parse the time zone out of the date string
	var tz = date.toString().split(' ').pop().replace(/[()]/g, '');
	return moment(date).format('MM/DD/YYYY hh:mm A') + ' ' + tz;
}
