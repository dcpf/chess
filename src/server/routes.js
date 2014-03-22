'use strict';

var q = require('q');
var chessController = require('./chessController');

// Timestamp of when the app was started. We use this for caching javascript and css files in the browser.
var _runtimestamp = new Date().getTime();

exports.index = function (req, res) {
    
    var params = getParams(req);
    
    if (params.gameID) {
        
        // GET enterGame request where gameID is passed as a URL param
        logRequest(req, 'enterGame');
        var promise = chessController.enterGame(getParams(req));
        promise.then(function (obj) {
            renderIndex(obj, res);
        });
        // If chessController.enterGame() failed, we'll render index.html with an err msg in the attr map.
        promise.fail(function (err) {
            console.warn(err);
            var buildDefaultEnterGameAttrMapResponse = chessController.buildDefaultEnterGameAttrMap(err);
            buildDefaultEnterGameAttrMapResponse.then(function (obj) {
                renderIndex(obj, res);
            });
            buildDefaultEnterGameAttrMapResponse.fail(function (err) {
                // what to do here?
                //deferred.reject(err);
            });
        });
        
    } else {
        
        // default request for index.html
        logRequest(req, 'index.html');
        var promise = chessController.buildDefaultEnterGameAttrMap();
        promise.then(function (obj) {
            renderIndex(obj, res);
        });
        promise.fail(function (err) {
            // what to do here?
            //deferred.reject(err);
        });
        
    }
};

// POST createGame request
exports.createGame = function (req, res) {
    logRequest(req, 'createGame');
	var ip = req.connection.remoteAddress;
	var promise = chessController.createGame(ip, getParams(req));
	promise.then(function (obj) {
		doJsonOutput(res, obj);
	});
    promise.fail(function (err) {
        doErrorOutput(res, err);
    });
};

// POST enterGame request
exports.enterGame = function (req, res) {
    logRequest(req, 'enterGame');
	var promise = chessController.enterGame(getParams(req));
    promise.then(function (obj) {
        doJsonOutput(res, obj);
    });
    promise.fail(function (err) {
        doErrorOutput(res, err);
    });
};

// POST saveMove request
exports.saveMove = function (req, res) {
    logRequest(req, 'saveMove');
    var promise = chessController.saveMove(getParams(req));
    promise.then(function (obj) {
        doJsonOutput(res, obj);
    });
    promise.fail(function (err) {
        doErrorOutput(res, err);
    });
};

// POST updateUserPrefs request
exports.updateUserPrefs = function (req, res) {
    logRequest(req, 'updateUserPrefs');
	var promise = chessController.updateUserPrefs(getParams(req));
    promise.then(function (obj) {
        doJsonOutput(res, obj);
    });
    promise.fail(function (err) {
        doErrorOutput(res, err);
    });
};

// POST logClientError request
exports.logClientError = function (req, res) {
    logClientError(req, getParams(req));
    doJsonOutput(res, {});
};

// private functions

function getParams (req) {
    var params = {};
    if (req.method === 'POST') {
        params = req.body;
    } else if (req.method === 'GET') {
        params = req.query;
    }
    return params;
}

function logClientError (req, params) {
    console.log('Client error: ' + JSON.stringify(params) + '; User agent: ' + req.headers['user-agent']);
}

function logRequest (req, path) {
    console.log('Request: ' + req.method + '; Path: ' + path + '; User agent: ' + req.headers['user-agent']);
}

function renderIndex (obj, res) {
    // add the runtimestamp for caching css and javascript
    obj.runtimestamp = _runtimestamp;
    // set layout to false 
    obj.layout = false;
    // set no-cache headers
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    // render
    res.render('index', obj);
}

function doJsonOutput (res, obj) {
	res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(obj));
	res.end();
}

function doErrorOutput (res, err) {
	res.writeHead(500, {'Content-Type': 'text/html'});
    res.write(err.message);
	res.end();
}
