import {
	CreateGameRequest,
	FeedbackData,
	FindGamesByEmailResponse,
	ForgotGameIdEmailGameData,
	GameContext,
	GameIdObject,
	GameObject,
	GameState,
	PlayerColor,
	SaveMoveRequest,
	SaveMoveResponse,
	SetUserPrefRequest,
	User,
} from "../types";
import * as gameDao from './dao/mongoGameDAO';
import * as userPrefsDao from './dao/mongoUserPrefsDAO';
import eventEmitter from './eventEmitter';
import * as gameIdFactory from './model/mongoGameIdFactory';
import { buildGameUrl } from "./util";
import * as customErrors from './error/customErrors';

const moment = require('moment');
const validator = require('validator');

const KEY_CHARS = '123456789';

export const createGame = async (request: CreateGameRequest): Promise<GameContext> => {
	const { player1Email, player2Email } = request;
	validateEmailAddress(player1Email, "Email Address is required");
	validateEmailAddress(player2Email, "Opponent's Email Address is required");
	return await doCreateGame(player1Email, player2Email);
};

export const enterGame = async (request) => {
	if (!request.gameID.trim()) {
		throw new Error('Game ID is required');
	}
	const gameID = gameIdFactory.getGameID(request.gameID);
	return await enterExistingGame(gameID);
};

export const saveMove = async (request: SaveMoveRequest): Promise<SaveMoveResponse | undefined> => {

	const gameID = gameIdFactory.getGameID(request.gameID);
	const obj = await gameDao.getGameObject(gameID.id);
	const { gameObj } = obj;

	if (!playerCanMove(gameObj, gameID.key)) {
		return;
	}

	const { move } = request;
	gameObj.moveHistory.push(move);

	await gameDao.updateMoveHistory(gameID.id, gameObj.moveHistory)
	console.log(`Updated game ${gameID.id} with move ${move}`);
	let opponentEmail = '';
	if (gameObj.moveHistory.length === 1) {
		opponentEmail = gameObj.B.email;
		eventEmitter.emit(eventEmitter.messages.SEND_INVITE_NOTIFICATION, gameObj, gameIdFactory.getGameID(gameID.id, gameObj.B.key), move);
	} else {
		const obj = (gameObj.moveHistory.length % 2 === 0) ? gameObj.W : gameObj.B;
		opponentEmail = obj.email;
		eventEmitter.emit(eventEmitter.messages.SEND_MOVE_NOTIFICATION, obj.email, gameIdFactory.getGameID(gameID.id, obj.key), move);
	}
	return { status: 'ok', opponentEmail: opponentEmail, move: move, gameID: gameID.compositeID };
};

export const updateUserPrefs = async (req: SetUserPrefRequest) => {
	const { userEmail, name, value } = req;
	await userPrefsDao.setUserPref(userEmail, name, value);
};

export const findGamesByEmail = async (email: string): Promise<FindGamesByEmailResponse> => {

	validateEmailAddress(email, "Email Address is required");

	// Lower-case the email address to make sure our queries work
	email = email.toLowerCase();

	const records = await gameDao.findGamesByEmail(email);
	const numGames = records.length;
	if (numGames === 0) {
		throw new Error(`No games found for email ${email}`);
	}

	const games = records.map<ForgotGameIdEmailGameData>((record) => {
		const gameObj = record.gameObj;
		let gameID: GameIdObject;
		if (gameObj.W.email === email) {
			gameID = gameIdFactory.getGameID(record._id, gameObj.W.key);
		} else if (gameObj.B.email === email) {
			gameID = gameIdFactory.getGameID(record._id, gameObj.B.key);
		}
		const createDate = formatDate(record.createDate);
		const lastMoveDate = gameObj.moveHistory.length ? formatDate(record.modifyDate) : '';
		return {
			id: gameID!.compositeID,
			createDate,
			lastMoveDate,
			url: buildGameUrl(gameID!),
		};
	});

	eventEmitter.emit(eventEmitter.messages.SEND_FORGOT_GAME_ID_NOTIFICATION, email, games);
	return { status: 'ok', email };

};

export const sendFeedback = (data: FeedbackData) => {
	eventEmitter.emit(eventEmitter.messages.SEND_FEEDBACK_NOTIFICATION, data);
};

//
// private functions
//

/**
* Generate the gameState and user objects needed by the game.
*/
const buildGameAttrMap = async (
	gameObj: GameObject,
	gameID: GameIdObject,
	perspective: PlayerColor,
	canMove: boolean,
	error?: Error
): Promise<GameContext> => {

	// vars needed for the game
	const gameState: GameState = {
		gameID: gameID.compositeID,
		moveHistory: gameObj.moveHistory,
		perspective,
		canMove,
		whiteEmail: (gameObj.W) ? gameObj.W.email : '',
		blackEmail: (gameObj.B) ? gameObj.B.email : '',
		error: error?.message ?? '',
	};

	// user prefs
	const userEmail = getCurrentUserEmail(gameObj, gameID.key);
	const userPrefs = await userPrefsDao.getUserPrefs(userEmail);
	const user: User = {
		email: userEmail,
		prefs: userPrefs.prefs ?? {}
	};

	return {
		gameState,
		user,
	};

};

/**
* Validate an email address. Throws an error if validation fails.
*/
const validateEmailAddress = (email: string, requiredMsg: string) => {
	if (!email?.trim()) {
		throw new Error(requiredMsg);
	}
	if (!validator.isEmail(email)) {
		throw new Error(`Invalid email address: ${email}`);
	}
};

const doCreateGame = async (player1Email: string, player2Email: string): Promise<GameContext> => {

	// Get the keys for each player
	const whiteKey = generateKey();
	let blackKey = generateKey();

	// If the two keys happen to be the same, loop until they are unique.
	while (whiteKey === blackKey) {
		blackKey = generateKey();
	}

	// Build the game object, normalizing the email addresses to lower-case.
	const gameObj: GameObject = {
		W: {
			email: player1Email.toLowerCase(),
			key: whiteKey,
		},
		B: {
			email: player2Email.toLowerCase(),
			key: blackKey,
		},
		moveHistory: [],
	};

	const gameID = await gameDao.createGame(gameObj);
	console.log(`Created game ${gameID}`);
	const newGameIdObj = gameIdFactory.getGameID(gameID, whiteKey);
	eventEmitter.emit(eventEmitter.messages.SEND_GAME_CREATION_NOTIFICATION, player1Email, player2Email, newGameIdObj);
	return await buildGameAttrMap(gameObj, newGameIdObj, 'W', true);

};

const enterExistingGame = async (gameID: GameIdObject): Promise<GameContext> => {
	try {
		const { gameObj } = await gameDao.getGameObject(gameID.id);
		const perspective = getPerspective(gameObj, gameID.key);
		const canMove = playerCanMove(gameObj, gameID.key);
		return await buildGameAttrMap(gameObj, gameID, perspective, canMove);
	} catch (err) {
		if (err instanceof customErrors.InvalidGameIdError) {
			err.message = `Invalid Game ID: ${gameID.compositeID}`;
		}
		throw err;
	}
};

const generateKey = (): string => {
	let s = '';
	for (let i = 0; i < 5; i++) {
		s += KEY_CHARS.charAt(Math.floor(Math.random() * KEY_CHARS.length));
	}
	return s;
};

const getPerspective = (gameObj: GameObject, key: string): PlayerColor => {
	return (gameObj.B.key === key) ? 'B' : 'W';
};

const getCurrentPlayer = (gameObj: GameObject): PlayerColor => {
	return (gameObj.moveHistory.length % 2 === 0) ? 'W' : 'B';
};

const playerCanMove = (gameObj: GameObject, key: string): boolean => {
	const whiteKey = gameObj.W.key;
	const blackKey = gameObj.B.key;
	const currentPlayer = getCurrentPlayer(gameObj);
	return (key === whiteKey && currentPlayer === 'W') || (key === blackKey && currentPlayer === 'B');
};

/**
* Gets the email of the current user based on the passed-in key
*/
const getCurrentUserEmail = (gameObj: GameObject, key: string): string => {
	let email = '';
	if (gameObj.W && key === gameObj.W.key) {
		email = gameObj.W.email;
	} else if (gameObj.B && key === gameObj.B.key) {
		email = gameObj.B.email;
	}
	return email;
};

/**
* Format the date as 07/19/2014 06:05 AM EDT
*/
const formatDate = (date: Date): string => {
	// parse the time zone out of the date string
	const tz = date.toString().split(' ').pop()!.replace(/[()]/g, '');
	return moment(date).format('MM/DD/YYYY hh:mm A') + ' ' + tz;
};
