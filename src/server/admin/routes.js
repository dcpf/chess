'use strict';

var adminController = require('./adminController');

exports.index = (req, res, next) => {
    res.responseProps.file = 'admin';
    next();
};

exports.findGameById = (req, res, next) => {
    res.responseProps.promise = adminController.findGameById(req.getParam('gameID'));
    next();
};

exports.findGamesByEmail = (req, res, next) => {
    res.responseProps.promise = adminController.findGamesByEmail(req.getParam('email'));
    next();
};

exports.editGame = (req, res, next) => {
    res.responseProps.promise = adminController.editGame(req.getParam('obj'));
    next();
};
