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
    const ip = req.connection.remoteAddress;
	res.responseProps.promise = chessController.createGame(ip, req.getParams());
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

function logClientError (req, params) {
    console.log(`Client error: ${JSON.stringify(params)}; User agent: ${req.headers['user-agent']}`);
}

function renderIndex (res) {
    res.responseProps.file = 'index';
    // add the game config (as a string) needed by the client
    res.responseProps.obj = {config: JSON.stringify(getGameConfig())};
}

/*
* Build the game configuration.
*/
function getGameConfig () {
    return {
		recaptcha: {
			enabled: global.CONFIG.recaptcha.enabled,
			publicKey: global.CONFIG.recaptcha.publicKey
		},
        appUrl: global.APP_URL.url
	};
}
