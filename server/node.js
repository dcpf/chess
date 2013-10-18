var http = require('http');
var fs = require('fs');
var urlUtil = require('url');
var qs = require('querystring');
var templateHandler = require('./templateHandler');
var chessController = require('./chessController');

var log = function (msg) {
	console.log(msg);
}

var contentTypeMap = {
	html: 'text/html',
	js: 'application/javascript',
	json: 'application/json',
	css: 'text/css',
	gif: 'image/gif'
};

http.createServer(function (req, res) {

	try {

		// first, parse the URL
		var urlObj = urlUtil.parse(req.url, true);

		// get the path, path parts, and query string
		var path = urlObj.path.replace("/", "");
		var pathParts = path.split('/');
		var queryObj = urlObj.query;
		var attrs;

		// For enterGame requests, get the POST data and call the controller
		if (path === 'enterGame') {

			var body = '';
			req.on('data', function (data) {
				body += data;
			});

			req.on('end', function () {
				var postData = qs.parse(body);
	    		log('Action: ' + path);
				attrs = eval('chessController.' + path + '(req, postData)');
				doJsonOutput(res, attrs);
			});

		} else if (queryObj.gameID && queryObj.key) {
			attrs = chessController.enterGame(req, queryObj);
			doOutput(res, 'html/index.html', attrs);
		} else {

			// if path does not exist, set it to index.html by default
			if (!path) {
				path = 'html/index.html';
				attrs = chessController.buildAttrMap('', '', [], false);
			}
	    	doOutput(res, path, attrs);

	    }

	} catch (e) {
		log(e);
	}

}).listen(1337, '127.0.0.1');

log('Server running at http://127.0.0.1:1337/');

function doOutput (res, path, attrs) {

	// get the file extension and set the contentType header
	var dotIndex = path.indexOf('.');
	var extension = path.substr(dotIndex + 1);
	var contentType = contentTypeMap[extension];
	res.writeHead(200, {'Content-Type': contentType});

	var fileContents;
	if (attrs) {
		fileContents = templateHandler.processTemplate(path, attrs);
	} else {
		fileContents = fs.readFileSync(path);
	}

	res.write(fileContents);
	res.end();

}

function doJsonOutput (res, obj) {
	res.writeHead(200, {'Content-Type': contentTypeMap.json});
   	res.write(JSON.stringify(obj));
   	res.end();
}
