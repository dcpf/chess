'use strict';

var renderUtils = require('../util/renderUtils');
var adminController = require('./adminController');

exports.index = function (req, res) {
    renderUtils.renderFile(res, 'admin');
};

exports.findGameById = function (req, res) {
    var params = renderUtils.getParams(req);
    adminController.findGameById(params).then(function (obj) {
        renderUtils.doJsonOutput(res, obj);
    })
    .fail(function (err) {
        renderUtils.doErrorOutput(res, err);
    });
};

exports.findGamesByEmail = function (req, res) {
    var params = renderUtils.getParams(req);
    adminController.findGamesByEmail(params).then(function (obj) {
        renderUtils.doJsonOutput(res, obj);
    })
    .fail(function (err) {
        renderUtils.doErrorOutput(res, err);
    });
};

exports.editGame = function (req, res) {
    var params = renderUtils.getParams(req);
    adminController.editGame(params).then(function (obj) {
        renderUtils.doJsonOutput(res, obj);
    })
    .fail(function (err) {
        renderUtils.doErrorOutput(res, err);
    });
};
