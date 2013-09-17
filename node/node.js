var http = require('http');
var fs = require('fs');
var urlUtil = require('url');
var qs = require('querystring');
var chessController = require('./chessController');

var log = function (msg) {
	console.log(msg);
}

var contentTypeMap = {
	html: 'text/html',
	js: 'application/javascript',
	css: 'text/css',
	gif: 'image/gif'
};

http.createServer(function (req, res) {

	try {

		// first, parse the URL
		var urlObj = urlUtil.parse(req.url, true);

		// get the path and path parts
		var path = urlObj.path.replace("/", "");
		var pathParts = path.split('/');

		// if this is a POST request, get the POST data and call the controller
		if (req.method === 'POST') {

			var body = '';
			req.on('data', function (data) {
				body += data;
			});

			req.on('end', function () {
				var postData = qs.parse(body);
				var action = path;
	    		log('Action: ' + action);
	    		path = eval('chessController.' + action + '(req, postData)');
	    		log('Got path from controller: ' + path);
	    		doOutput(path, res);
			});

		} else {

			// if path does not exist, set it to index.html by default
			if (!path) {
				path = 'index.html';
			}
			var filename = pathParts[pathParts.length - 1];
			var dotIndex = filename.indexOf('.');
	    	doOutput(path, res);

	    }

	} catch (e) {
		log(e);
	}

    }).listen(1337, '127.0.0.1');
log('Server running at http://127.0.0.1:1337/');


function doOutput (path, res) {
	var fileContents = fs.readFileSync(path);
	var buf = new Buffer(fileContents);
	var dotIndex = path.indexOf('.');
	var extension = path.substr(dotIndex + 1);
	var contentType = contentTypeMap[extension];
	res.writeHead(200, {'Content-Type': contentType});
	res.end(buf);
}
