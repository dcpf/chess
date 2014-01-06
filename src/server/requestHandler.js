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
		var ip = req.connection.remoteAddress;
		var dfrd = chessController.createGame(ip, params);
		dfrd.promise.then(function(obj){
			mav = modelAndView.getModelAndView(obj);
			deferred.resolve(mav);
		});

	} else if (path === 'enterGame') {

		// POST enterGame request
		obj = chessController.enterGame(params);
		mav = modelAndView.getModelAndView(obj);
		deferred.resolve(mav);

	} else if (path === 'saveMove') {

		// POST saveMove request
		obj = chessController.saveMove(params);
		mav = modelAndView.getModelAndView(obj);
		deferred.resolve(mav);

	} else if (path === 'updateUserPrefs') {

		// POST updateUserPrefs request
		obj = chessController.updateUserPrefs(params);
		mav = modelAndView.getModelAndView(obj);
		deferred.resolve(mav);

	} else if (params.gameID) {

		// GET enterGame request where gameID is passed as a URL param
		obj = chessController.enterGame(params);
		if (obj instanceof Error) {
			obj = chessController.buildDefaultEnterGameAttrMap(obj);
		}
		mav = modelAndView.getModelAndView(obj, 'src/client/html/index.html');
		deferred.resolve(mav);

	} else if (!path) {

		// if path does not exist, use index.html by default
		obj = chessController.buildDefaultEnterGameAttrMap();
		mav = modelAndView.getModelAndView(obj, 'src/client/html/index.html');
		deferred.resolve(mav);

	} else {

		// path exists, so use that
		mav = modelAndView.getModelAndView(obj, path);
		deferred.resolve(mav);

	}

	return deferred;

};