'use strict';

const moment = require('moment');
const gameIdFactory = require('./model/mongoGameIdFactory');
const gameDao = require('./dao/mongoGameDAO');
const userPrefsDao = require('./dao/mongoUserPrefsDAO');
const validator = require('validator');
const eventEmitter = require('./eventEmitter');
const customErrors = require('./error/customErrors');

const KEY_CHARS = '123456789';

const createGame = async (postData) => {
	const { player1Email, player2Email } = postData;
	validateEmailAddress(player1Email, "Email Address is required");
	validateEmailAddress(player2Email, "Opponent's Email Address is required");
	return await doCreateGame(player1Email, player2Email);
};

const enterGame = async (postData) => {
	if (!postData.gameID.trim()) {
		throw new Error('Game ID is required');
	}
	const gameID = gameIdFactory.getGameID(postData.gameID);
	return await enterExistingGame(gameID);
};

const saveMove = async (postData) => {

	const gameID = gameIdFactory.getGameID(postData.gameID);
	const obj = await gameDao.getGameObject(gameID.id)
	const { gameObj } = obj;
	if (playerCanMove(gameObj, gameID.key)) {

		const { move } = postData;
		gameObj.moveHistory.push(move);

		await gameDao.updateMoveHistory(gameID.id, gameObj.moveHistory)
		console.log(`Updated game ${gameID.id} with move ${move}`);
		let opponentEmail = '';
		if (gameObj.moveHistory.length == 1) {
			opponentEmail = gameObj.B.email;
			eventEmitter.emit(eventEmitter.messages.SEND_INVITE_NOTIFICATION, gameObj, gameIdFactory.getGameID(gameID.id, gameObj.B.key), move);
		} else {
			const obj = (gameObj.moveHistory.length % 2 === 0) ? gameObj.W : gameObj.B;
			opponentEmail = obj.email;
			eventEmitter.emit(eventEmitter.messages.SEND_MOVE_NOTIFICATION, obj.email, gameIdFactory.getGameID(gameID.id, obj.key), move);
		}
		return { status: 'ok', opponentEmail: opponentEmail, move: move, gameID: gameID.compositeID };
	}
};

const updateUserPrefs = async (postData) => {
	const { userEmail, name, value } = postData;
	return await userPrefsDao.setUserPref(userEmail, name, value);
};

const findGamesByEmail = async (email) => {

	validateEmailAddress(email, "Email Address is required");

	// Lower-case the email address to make sure our queries work
	email = email.toLowerCase();

	const records = await gameDao.findGamesByEmail(email);
	const numGames = records?.length ?? 0;
	if (!numGames) {
		throw new Error(`No games found for email ${email}`);
	}

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
			gameID = gameIdFactory.getGameID(record._id, gameObj.W.key);
		} else if (gameObj.B.email === email) {
			gameID = gameIdFactory.getGameID(record._id, gameObj.B.key);
		}
		createDate = formatDate(record.createDate);
		lastMoveDate = gameObj.moveHistory ? formatDate(record.modifyDate) : '';
		games.push(
			{
				gameID,
				createDate,
				lastMoveDate
			}
		);
	}
	eventEmitter.emit(eventEmitter.messages.SEND_FORGOT_GAME_ID_NOTIFICATION, email, games);
	return { status: 'ok', email: email };

};

const sendFeedback = (data) => {
	eventEmitter.emit(eventEmitter.messages.SEND_FEEDBACK_NOTIFICATION, data);
};

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
const buildGameAttrMap = async (gameObj, gameID, perspective, canMove, error) => {

	// vars needed for the game
	const gameState = {
		gameID: gameID.compositeID,
		moveHistory: gameObj.moveHistory || [],
		perspective,
		canMove,
		whiteEmail: (gameObj.W) ? gameObj.W.email : '',
		blackEmail: (gameObj.B) ? gameObj.B.email : '',
		error: error?.message ?? ''
	};

	// user prefs
	const userEmail = getCurrentUserEmail(gameObj, gameID.key);
	const userPrefs = await userPrefsDao.getUserPrefs(userEmail);
	const user = {
		email: userEmail,
		prefs: userPrefs.prefs || {}
	};
	return {
		gameState,
		user
	};

};

/**
* Validate an email address. Throws an error if validation fails.
* @param String - Email address to validate
* @param String - Err msg to render for a missing required value
*/
const validateEmailAddress = (email, requiredMsg) => {
	if (!email?.trim()) {
		throw new Error(requiredMsg);
	}
	if (!validator.isEmail(email)) {
		throw new Error(`Invalid email address: ${email}`);
	}
};

const doCreateGame = async (player1Email, player2Email) => {

	// Get the keys for each player
	const whiteKey = generateKey();
	let blackKey = generateKey();

	// If the two keys happen to be the same, loop until they are unique.
	while (whiteKey === blackKey) {
		blackKey = generateKey();
	}

	// Build the game object, normalizing the email address to lower-case.
	const gameObj = {
		W: {
			email: player1Email.toLowerCase(),
			key: whiteKey
		},
		B: {
			email: player2Email.toLowerCase(),
			key: blackKey
		}
	};

	const gameID = await gameDao.createGame(gameObj);
	console.log(`Created game ${gameID}`);
	const newGameIdObj = gameIdFactory.getGameID(gameID, whiteKey);
	eventEmitter.emit(eventEmitter.messages.SEND_GAME_CREATION_NOTIFICATION, player1Email, player2Email, newGameIdObj);
	return buildGameAttrMap(gameObj, newGameIdObj, 'W', true, null);

};

const enterExistingGame = async (gameID) => {
	try {
		const obj = await gameDao.getGameObject(gameID.id);
		const { gameObj } = obj;
		const perspective = getPerspective(gameObj, gameID.key);
		const canMove = playerCanMove(gameObj, gameID.key);
		return buildGameAttrMap(gameObj, gameID, perspective, canMove, null);
	} catch (err) {
		if (err instanceof customErrors.InvalidGameIdError) {
			err.message = `Invalid Game ID: ${gameID.compositeID}`;
		}
		throw err;
	}
};

const generateKey = () => {
	let s = '';
	for (let i = 0; i < 5; i++) {
		s += KEY_CHARS.charAt(Math.floor(Math.random() * KEY_CHARS.length));
	}
	return s;
};

const getPerspective = (gameObj, key) => {
	return (gameObj.B.key == key) ? 'B' : 'W';
};

const getCurrentPlayer = (gameObj) => {
	gameObj.moveHistory = gameObj.moveHistory || [];
	return (gameObj.moveHistory.length % 2 === 0) ? 'W' : 'B';
};

const playerCanMove = (gameObj, key) => {
	const whiteKey = gameObj.W.key;
	const blackKey = gameObj.B.key;
	let canMove = false;
	const currentPlayer = getCurrentPlayer(gameObj);
	if ((key == whiteKey && currentPlayer === 'W') ||
		(key == blackKey && currentPlayer === 'B')) {
		canMove = true;
	}
	return canMove;
};

/**
* Gets the email of the current user based on the passed-in key
*/
const getCurrentUserEmail = (gameObj, key) => {
	let email = '';
	if (gameObj.W && key == gameObj.W.key) {
		email = gameObj.W.email;
	} else if (gameObj.B && key == gameObj.B.key) {
		email = gameObj.B.email;
	}
	return email;
};

/**
* Format the date as 07/19/2014 06:05 AM EDT
*/
const formatDate = (date) => {
	// parse the time zone out of the date string
	const tz = date.toString().split(' ').pop().replace(/[()]/g, '');
	return moment(date).format('MM/DD/YYYY hh:mm A') + ' ' + tz;
};
