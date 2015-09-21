'use strict';

var chessController = require('./chessController');

exports.index = function (req, res, next) {
    renderIndex(res);
    next();
};

exports.findGamesByEmail = function (req, res, next) {
    res.responseProps.promise = chessController.findGamesByEmail(req.getParam('email'));
    next();
};

// POST createGame request
exports.createGame = function (req, res, next) {
    var ip = req.connection.remoteAddress;
	res.responseProps.promise = chessController.createGame(ip, req.getParams());
    next();
};

// POST enterGame request
exports.enterGame = function (req, res, next) {
    res.responseProps.promise = chessController.enterGame(req.getParams());
    next();
};

// POST saveMove request
exports.saveMove = function (req, res, next) {
    res.responseProps.promise = chessController.saveMove(req.getParams());
    next();
};

// POST updateUserPrefs request
exports.updateUserPrefs = function (req, res, next) {
    res.responseProps.promise = chessController.updateUserPrefs(req.getParams());
    next();
};

exports.sendFeedback = function (req, res, next) {
    var params = req.getParams();
    params.userAgent = req.headers['user-agent'];
    chessController.sendFeedback(params);
    next();
};

// POST logClientError request
exports.logClientError = function (req, res, next) {
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
			enabled: GLOBAL.CONFIG.recaptcha.enabled,
			publicKey: GLOBAL.CONFIG.recaptcha.publicKey
		},
        appUrl: GLOBAL.APP_URL.url
	};
}
