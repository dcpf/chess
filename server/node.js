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
	    		var view = eval('chessController.' + action + '(req, postData)');
	    		doOutput(res, view.getName(), view.getAttributes());
			});

		} else {

			// if path does not exist, set it to index.html by default
			if (!path) {
				path = 'html/index.html';
			}
	    	doOutput(res, path);

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
