'use strict';

var adminController = require('./adminController');

exports.index = function (req, res, next) {
    req.responseProps.file = 'admin';
    next();
};

exports.findGameById = function (req, res, next) {
    req.responseProps.promise = adminController.findGameById(req.getParam('gameID'));
    next();
};

exports.findGamesByEmail = function (req, res, next) {
    req.responseProps.promise = adminController.findGamesByEmail(req.getParam('email'));
    next();
};

exports.editGame = function (req, res, next) {
    req.responseProps.promise = adminController.editGame(req.getParam('obj'));
    next();
};
