'use strict';

var chessController = require('./chessController');

exports.index = function (req, res, next) {
    
    var params = req.getParams();

    if (params.gameID) {

        // GET enterGame request where gameID is passed as a URL param
        chessController.enterGame(params)
            .then(function (obj) {
                renderIndex(obj, req);
                next();
            })
            // If chessController.enterGame() failed, we'll render index.html with an err msg in the attr map.
            .fail(function (err) {
                console.warn(err);
                chessController.buildDefaultEnterGameAttrMap(err)
                    .then(function (obj) {
                        renderIndex(obj, req);
                        next();
                    })
                    .fail(function (err) {
                        // what to do here?
                        //deferred.reject(err);
                    });
            });

    } else {

        // default request for index.html
        chessController.buildDefaultEnterGameAttrMap()
            .then(function (obj) {
                renderIndex(obj, req);
                next();
            })
            .fail(function (err) {
                // what to do here?
                //deferred.reject(err);
            });

    }
    
};

exports.findGamesByEmail = function (req, res, next) {
    req.responseProps.promise = chessController.findGamesByEmail(req.getParam('email'));
    next();
};

// POST createGame request
exports.createGame = function (req, res, next) {
    var ip = req.connection.remoteAddress;
	req.responseProps.promise = chessController.createGame(ip, req.getParams());
    next();
};

// POST enterGame request
exports.enterGame = function (req, res, next) {
    req.responseProps.promise = chessController.enterGame(req.getParams());
    next();
};

// POST saveMove request
exports.saveMove = function (req, res, next) {
    req.responseProps.promise = chessController.saveMove(req.getParams());
    next();
};

// POST updateUserPrefs request
exports.updateUserPrefs = function (req, res, next) {
    req.responseProps.promise = chessController.updateUserPrefs(req.getParams());
    next();
};

exports.sendFeedback = function (req, res, next) {
    var params = req.getParams();
    params.userAgent = req.headers['user-agent'];
    chessController.sendFeedback(params);
    next();
};

// POST logClientError request
exports.logClientError = function (req, res, next) {
    logClientError(req, req.getParams());
    next();
};

// private functions

function logClientError (req, params) {
    console.log('Client error: ' + JSON.stringify(params) + '; User agent: ' + req.headers['user-agent']);
}

function renderIndex (obj, req) {
    req.responseProps.file = 'index';
    req.responseProps.obj = obj;
}
