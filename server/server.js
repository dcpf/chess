var http = require('http');
var fs = require('fs');
var urlUtil = require('url');
var qs = require('querystring');
var q = require('q');
var templateHandler = require('./templateHandler');
var appUrl = require('./model/appUrl');
var requestHandler = require('./requestHandler');

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

// For the Expires header
var daysArray = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu' ,'Fri' ,'Sat'];
var monthsArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Timestamp of when the app was started. We'll use this for caching javascript and css files in the browser.
var runtimestamp = new Date().getTime();

// read the config file
var configFile = process.argv[2] || 'server/conf/config.js';
var config = JSON.parse(fs.readFileSync(configFile, {encoding: 'utf8'}));

// set the ip and port from either the env vars or from the config file
var ip = process.env.IP || config.ip;
var port = process.env.PORT || config.port;
GLOBAL.APP_URL = appUrl.constructUrl(ip, port);

http.createServer(function (req, res) {

	try {

		// first, parse the URL
		var urlObj = urlUtil.parse(req.url, true);

		// get the path, path parts, and query string
		var path = urlObj.pathname.replace("/", "");
		var pathParts = path.split('/');
		var queryObj = urlObj.query;
		var deferred = q.defer();

		// if this is a POST request, extract the post data from the body 
		if (req.method === 'POST') {

			var body = '';
			req.on('data', function (data) {
				body += data;
			});

			req.on('end', function () {
				var postData = qs.parse(body);
				deferred.resolve(postData);
			});

		} else {
			deferred.resolve(null);
		}

		// once the deferred object has been resolved, call requestHandler.handleRequest() and then doOutput()
		deferred.promise.then(function(postData) {
			var params = postData || queryObj;
			var mav = requestHandler.handleRequest(req, path, params);
			if (mav) {
				if (mav.view) {
					doOutput(res, mav.view, mav.model);
				} else {
					doJsonOutput(res, mav.model);
				}
			} else {
				doOutput(res, path);
			}
		});

	} catch (e) {
		log(e);
	}

}).listen(APP_URL.port, APP_URL.domain);

log('Server running at ' + APP_URL.url);

function doOutput (res, path, attrs) {

	// get the file extension and set the contentType header
	var dotIndex = path.indexOf('.');
	var extension = path.substr(dotIndex + 1);
	var contentType = contentTypeMap[extension];
	var headers = {'Content-Type': contentType};

	if (contentType === contentTypeMap.gif || contentType === contentTypeMap.js || contentType === contentTypeMap.css) {
		// set cache headers for images, javascript, and css
		setCacheHeaders(headers);
	} else {
		// set no-cache headers for everything else
		setNoCacheHeaders(headers);
	}
	res.writeHead(200, headers);

	var fileContents;
	if (attrs) {
		// add the runtimestamp for caching css and javascript
		attrs.runtimestamp = runtimestamp;
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

function setNoCacheHeaders (headers) {
	headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
	headers['Pragma'] = 'no-cache';
	headers['Expires'] = '0';
}

function setCacheHeaders (headers) {
	headers['Cache-Control'] = 'max-age=31536000';
	headers['Expires'] = getExpiresHeader();
}

/*
* Returns a date value in the format: Thu, 01 Dec 1983 20:00:00 GMT
*/
function getExpiresHeader () {
	var date = new Date();
	var time = date.getTime();
	time += 31536000000;
	date.setTime(time);
	var dayStr = daysArray[date.getDay()];
	var day = formatDateDigit(date.getDate());
	var month = monthsArray[date.getMonth()];
	var year = date.getFullYear();
	var hour = formatDateDigit(date.getHours());
	var min = formatDateDigit(date.getMinutes());
	var sec = formatDateDigit(date.getSeconds());
	var value =  dayStr + ', ' + day + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec + ' GMT';
	return value;
}

/*
* Formats a single digit (1-9) to a double digit by prepending a 0. Examples:
* 1 > 01
* 5 > 05
*/
function formatDateDigit (s) {
	s = s.toString();
	if (s.length === 1) {
		s = '0' + s;
	}
	return s;
}
