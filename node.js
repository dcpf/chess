var http = require('http');
var fs = require('fs');

var contentTypeMap = {
	html: 'text/html',
	js: 'application/javascript',
	css: 'text/css',
	gif: 'image/gif'
};

http.createServer(function (req, res) {
	var buf = '',
		url = '',
		urlParts,
		extension = '';
	try {
	    url = req.url.replace("/", "");
	    urlParts = url.split('.');
	    extension = urlParts.pop();
	    var fileContents = fs.readFileSync(url);
	    buf = new Buffer(fileContents);
	} catch (e) {
	}
	var contentType = contentTypeMap[extension];
	res.writeHead(200, {'Content-Type': contentType});
	res.end(buf);
    }).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
