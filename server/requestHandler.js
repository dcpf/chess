var q = require('q');
var chessController = require('./chessController');
var modelAndView = require('./model/modelAndView');

exports.handleRequest = function (req, path, params) {

	var deferred = q.defer();
	var mav = null;

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
		var obj = chessController.enterGame(params);
		mav = modelAndView.getModelAndView(obj);
		deferred.resolve(mav);

	} else if (path === 'saveMove') {

		// POST saveMove request
		var obj = chessController.saveMove(params);
		mav = modelAndView.getModelAndView(obj);
		deferred.resolve(mav);

	} else if (params.gameID) {

		// GET enterGame request where gameID is passed as a URL param
		var obj = chessController.enterGame(params);
		mav = modelAndView.getModelAndView(obj, 'html/index.html');
		deferred.resolve(mav);

	} else if (!path) {

		// if path does not exist, use index.html by default
		var obj = chessController.buildDefaultEnterGameAttrMap();
		mav = modelAndView.getModelAndView(obj, 'html/index.html');
		deferred.resolve(mav);

	} else {

		// path exists, so use that
		mav = modelAndView.getModelAndView(obj, path);
		deferred.resolve(mav);

	}

	return deferred;

};