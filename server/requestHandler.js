var qs = require('querystring');
var q = require('q');
var chessController = require('./chessController');
var modelAndView = require('./model/modelAndView');

exports.handleRequest = function (req, path, queryObj) {

	var attrs, mav;
	var deferred = q.defer();

	// Handle POST requests:
	// enterGame
	// saveMove
	if (req.method === 'POST') {

		var body = '';
		req.on('data', function (data) {
			body += data;
		});

		req.on('end', function () {
			var postData = qs.parse(body);
			attrs = eval('chessController.' + path + '(req, postData)');
			mav = modelAndView.getModelAndView(attrs);
			deferred.resolve(mav);
		});

	} else if (queryObj.gameID) {

		// GET enterGame request where gameID is passed as a URL param
		attrs = chessController.enterGame(req, queryObj);
		mav = modelAndView.getModelAndView(attrs, 'html/index.html');
		deferred.resolve(mav);

	} else if (!path) {

		// if path does not exist, use index.html by default
		attrs = chessController.buildEnterGameAttrMap({}, '', '', '', false);
		mav = modelAndView.getModelAndView(attrs, 'html/index.html');
		deferred.resolve(mav);

	} else {

		// path exists, so use that
		mav = modelAndView.getModelAndView(attrs, path);
		deferred.resolve(mav);

	}

	return deferred.promise;

};