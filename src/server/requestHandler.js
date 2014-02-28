'use strict';

var q = require('q');
var chessController = require('./chessController');
var modelAndView = require('./model/modelAndView');

exports.handleRequest = function (req, path, params) {

	var deferred = q.defer();
	var mav = null;
	var obj;

	if (path === 'createGame') {

		// POST createGame request
        logRequest(req, path);
		var ip = req.connection.remoteAddress;
		var createGameResponse = chessController.createGame(ip, params);
		createGameResponse.then(function(obj){
			mav = modelAndView.getModelAndView(obj);
			deferred.resolve(mav);
		});

	} else if (path === 'enterGame') {

		// POST enterGame request
        logRequest(req, path);
		obj = chessController.enterGame(params);
		mav = modelAndView.getModelAndView(obj);
		deferred.resolve(mav);

	} else if (path === 'saveMove') {

		// POST saveMove request
        logRequest(req, path);
		obj = chessController.saveMove(params);
		mav = modelAndView.getModelAndView(obj);
		deferred.resolve(mav);

	} else if (path === 'updateUserPrefs') {

		// POST updateUserPrefs request
        logRequest(req, path);
		obj = chessController.updateUserPrefs(params);
		mav = modelAndView.getModelAndView(obj);
		deferred.resolve(mav);

    } else if (path === 'logClientError') {

        // POST logClientError request
        logClientError(req, params);
        mav = modelAndView.getModelAndView({});
        deferred.resolve(mav);

	} else if (params.gameID) {

		// GET enterGame request where gameID is passed as a URL param
        logRequest(req, 'enterGame');
		obj = chessController.enterGame(params);
		if (obj instanceof Error) {
			obj = chessController.buildDefaultEnterGameAttrMap(obj);
		}
		mav = modelAndView.getModelAndView(obj, 'src/client/html/index.html');
		deferred.resolve(mav);

	} else if (!path) {

		// if path does not exist, use index.html by default
        logRequest(req, 'index.html');
		obj = chessController.buildDefaultEnterGameAttrMap();
		mav = modelAndView.getModelAndView(obj, 'src/client/html/index.html');
		deferred.resolve(mav);

	} else {

		// path exists, so use that
		mav = modelAndView.getModelAndView(obj, path);
		deferred.resolve(mav);

	}

	return deferred.promise;

};

function logClientError (req, params) {
    console.log('Client error: ' + JSON.stringify(params) + '; User agent: ' + req.headers['user-agent']);
}

function logRequest (req, path) {
    console.log('Request: ' + req.method + '; Path: ' + path + '; User agent: ' + req.headers['user-agent']);
}
