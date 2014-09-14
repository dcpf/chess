'use strict';

// Timestamp of when the app was started. We use this for caching javascript and css files in the browser.
var runtimestamp = new Date().getTime();

exports.getParams = function (req) {
    var params = {};
    if (req.method === 'POST') {
        params = req.body;
    } else if (req.method === 'GET') {
        params = req.query;
    }
    return params;
};

exports.renderFile = function (res, file, obj) {
    obj = obj || {};
    // add the runtimestamp for versioning css and javascript
    obj.runtimestamp = runtimestamp;
    // set layout to false
    obj.layout = false;
    // set no-cache headers
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    // render
    res.render(file, obj);
};

exports.doJsonOutput = function (res, obj) {
	res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(obj));
	res.end();
};

exports.doErrorOutput = function (res, err) {
    console.error(err);
    res.writeHead(500, {'Content-Type': 'text/html'});
    res.write(err.message);
	res.end();
};