var chessController = require('./chessController');
var modelAndView = require('./model/modelAndView');

exports.handleRequest = function (req, path, params) {

	var mav = null;

	// Handle POST requests:
	// enterGame
	// saveMove
	if (req.method === 'POST') {

		var attrs = eval('chessController.' + path + '(params)');
		mav = modelAndView.getModelAndView(attrs);

	} else if (params.gameID) {

		// GET enterGame request where gameID is passed as a URL param
		var attrs = chessController.enterGame(params);
		mav = modelAndView.getModelAndView(attrs, 'html/index.html');

	} else if (!path) {

		// if path does not exist, use index.html by default
		var attrs = chessController.buildDefaultEnterGameAttrMap();
		mav = modelAndView.getModelAndView(attrs, 'html/index.html');

	} else {

		// path exists, so use that
		mav = modelAndView.getModelAndView(attrs, path);

	}

	return mav;

};