'use strict';

const chessController = require('./chessController');

exports.index = (req, res, next) => {
	renderIndex(res);
	next();
};

exports.findGamesByEmail = (req, res, next) => {
	res.responseProps.promise = chessController.findGamesByEmail(req.getParam('email'));
	next();
};

// POST createGame request
exports.createGame = (req, res, next) => {
	res.responseProps.promise = chessController.createGame(req.getParams());
	next();
};

// POST enterGame request
exports.enterGame = (req, res, next) => {
	res.responseProps.promise = chessController.enterGame(req.getParams());
	next();
};

// POST saveMove request
exports.saveMove = (req, res, next) => {
	res.responseProps.promise = chessController.saveMove(req.getParams());
	next();
};

// POST updateUserPrefs request
exports.updateUserPrefs = (req, res, next) => {
	res.responseProps.promise = chessController.updateUserPrefs(req.getParams());
	next();
};

exports.sendFeedback = (req, res, next) => {
	const params = req.getParams();
	params.userAgent = req.headers['user-agent'];
	chessController.sendFeedback(params);
	next();
};

// POST logClientError request
exports.logClientError = (req, res, next) => {
	logClientError(req, req.getParams());
	next();
};

// private functions

const logClientError = (req, params) => {
	console.log(`Client error: ${JSON.stringify(params)}; User agent: ${req.headers['user-agent']}`);
};

const renderIndex = (res) => {
	res.responseProps.file = 'index';
	// add the game config (as a string) needed by the client
	res.responseProps.obj = { config: JSON.stringify(getGameConfig()) };
};

/*
* Build the game configuration.
*/
const getGameConfig = () => {
	return {
		recaptcha: {
			enabled: global.CONFIG.recaptcha.enabled,
			publicKey: global.CONFIG.recaptcha.publicKey
		},
		appUrl: global.APP_URL.url
	};
};
