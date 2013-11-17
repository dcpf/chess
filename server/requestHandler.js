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
		dfrd.promise.then(function(attrs){
			mav = modelAndView.getModelAndView(attrs);
			deferred.resolve(mav);
		});

	} else if (path === 'enterGame') {

		// POST enterGame request
		var attrs = chessController.enterGame(params);
		mav = modelAndView.getModelAndView(attrs);
		deferred.resolve(mav);

	} else if (path === 'saveMove') {

		// POST saveMove request
		var attrs = chessController.saveMove(params);
		mav = modelAndView.getModelAndView(attrs);
		deferred.resolve(mav);

	} else if (params.gameID) {

		// GET enterGame request where gameID is passed as a URL param
		var attrs = chessController.enterGame(params);
		mav = modelAndView.getModelAndView(attrs, 'html/index.html');
		deferred.resolve(mav);

	} else if (!path) {

		// if path does not exist, use index.html by default
		var attrs = chessController.buildDefaultEnterGameAttrMap();
		mav = modelAndView.getModelAndView(attrs, 'html/index.html');
		deferred.resolve(mav);

	} else {

		// path exists, so use that
		mav = modelAndView.getModelAndView(attrs, path);
		deferred.resolve(mav);

	}

	return deferred;

};