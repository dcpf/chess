var http = require('http');
var fs = require('fs');
var urlUtil = require('url');
var qs = require('querystring');
var templateHandler = require('./templateHandler');
var chessController = require('./chessController');
var chessUrl = require('./model/chessUrl');

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

/*
* Self-executing init function
*/
(function () {

	// Get the IP in the following order:
	// 1) From the 1st command-line arg
	// 2) From the IP env var
	// 3) Use '127.0.0.1' by default
	var ip = process.argv[2];
	if (!ip) {
		ip = process.env.IP;
	}
	if (!ip) {
		ip = '127.0.0.1';
	}

	// Get the port in the following order:
	// 1) From the 2nd command-line arg
	// 2) From the PORT env var
	// 3) Use '1337' by default
	var port = process.argv[3];
	if (!port) {
		port = process.env.PORT;
	}
	if (!port) {
		port = '1337';
	}

	// Set the chess url object based on the ip and port
	GLOBAL.CHESS_URL = chessUrl.constructUrl(ip, port);

})();

http.createServer(function (req, res) {

	try {

		// first, parse the URL
		var urlObj = urlUtil.parse(req.url, true);

		// get the path, path parts, and query string
		var path = urlObj.path.replace("/", "");
		var pathParts = path.split('/');
		var queryObj = urlObj.query;
		var attrs;

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
				doJsonOutput(res, attrs);
			});

		} else if (queryObj.gameID && queryObj.key) {

			// GET enterGame request where gameID and key are passed as URL params
			attrs = chessController.enterGame(req, queryObj);
			doOutput(res, 'html/index.html', attrs);

		} else {

			// if path does not exist, set it to index.html by default
			if (!path) {
				path = 'html/index.html';
				attrs = chessController.buildEnterGameAttrMap('', '', [], false);
			}
	    	doOutput(res, path, attrs);

	    }

	} catch (e) {
		log(e);
	}

}).listen(CHESS_URL.port, CHESS_URL.domain);

log('Server running at ' + CHESS_URL.url);

function doOutput (res, path, attrs) {

	// get the file extension and set the contentType header
	var dotIndex = path.indexOf('.');
	var extension = path.substr(dotIndex + 1);
	var contentType = contentTypeMap[extension];
	var headers = {'Content-Type': contentType};

	// set cache headers for images
	if (contentType === contentTypeMap.gif) {
		headers['Cache-Control'] = 'max-age=31556926';
	}

	res.writeHead(200, headers);

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
