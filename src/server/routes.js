'use strict';

var renderUtils = require('./util/renderUtils');
var chessController = require('./chessController');

exports.index = function (req, res) {

    var params = getParams(req);

    if (params.gameID) {

        // GET enterGame request where gameID is passed as a URL param
        chessController.enterGame(getParams(req))
            .then(function (obj) {
                renderIndex(obj, res);
            })
            // If chessController.enterGame() failed, we'll render index.html with an err msg in the attr map.
            .fail(function (err) {
                console.warn(err);
                chessController.buildDefaultEnterGameAttrMap(err)
                    .then(function (obj) {
                        renderIndex(obj, res);
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
                renderIndex(obj, res);
            })
            .fail(function (err) {
                // what to do here?
                //deferred.reject(err);
            });

    }
};

exports.findGamesByEmail = function (req, res) {
  var params = getParams(req);
  chessController.findGamesByEmail(params.email)
    .then(function (obj) {
      doJsonOutput(res, obj);
    })
    .fail(function (err) {
      doErrorOutput(res, err);
    });
};

// POST createGame request
exports.createGame = function (req, res) {
  var ip = req.connection.remoteAddress;
	chessController.createGame(ip, getParams(req))
        .then(function (obj) {
            doJsonOutput(res, obj);
        })
        .fail(function (err) {
            doErrorOutput(res, err);
        });
};

// POST enterGame request
exports.enterGame = function (req, res) {
  chessController.enterGame(getParams(req))
        .then(function (obj) {
            doJsonOutput(res, obj);
        })
        .fail(function (err) {
            doErrorOutput(res, err);
        });
};

// POST saveMove request
exports.saveMove = function (req, res) {
    chessController.saveMove(getParams(req))
        .then(function (obj) {
            doJsonOutput(res, obj);
        })
        .fail(function (err) {
            doErrorOutput(res, err);
        });
};

// POST updateUserPrefs request
exports.updateUserPrefs = function (req, res) {
    chessController.updateUserPrefs(getParams(req))
        .then(function (obj) {
            doJsonOutput(res, obj);
        })
        .fail(function (err) {
            doErrorOutput(res, err);
        });
};

exports.sendFeedback = function (req, res) {
    var params = getParams(req);
    params.userAgent = req.headers['user-agent'];
    chessController.sendFeedback(params);
    doJsonOutput(res, {});
};

// POST logClientError request
exports.logClientError = function (req, res) {
    logClientError(req, getParams(req));
    doJsonOutput(res, {});
};

// private functions

function getParams (req) {
    return renderUtils.getParams(req);
}

function logClientError (req, params) {
    console.log('Client error: ' + JSON.stringify(params) + '; User agent: ' + req.headers['user-agent']);
}

function renderIndex (obj, res) {
    renderUtils.renderFile(res, 'index', obj);
}

function doJsonOutput (res, obj) {
    renderUtils.doJsonOutput(res, obj);
}

function doErrorOutput (res, err) {
    renderUtils.doErrorOutput(res, err);
}
