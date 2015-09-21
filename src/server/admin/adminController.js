'use strict';

var q = require('q');
var gameIdFactory = require('../model/mongoGameIdFactory');
var gameDao = require('../dao/mongoGameDAO');
var customErrors = require('../error/customErrors');

function findGameById (gameID) {
	var deferred = q.defer();
    var gameIdObj;
	if (!gameID || !gameID.trim()) {
		deferred.reject(new Error('Game ID is required'));
		return deferred.promise;
	}
	try {
		gameIdObj = gameIdFactory.getGameID(gameID);
	} catch (err) {
		deferred.reject(err);
		return deferred.promise;
	}
	gameDao.getGameObject(gameIdObj.id).then(function (obj) {
        deferred.resolve(obj);
    }).fail (function (err) {
        if (err instanceof customErrors.InvalidGameIdError) {
            err.message = `Invalid Game ID: ${gameIdObj.compositeID}`;
        }
        deferred.reject(err);
    });
	return deferred.promise;
}

function findGamesByEmail (email) {
    var deferred = q.defer();
    if (!email || !email.trim()) {
        deferred.reject(new Error('Email is required'));
        return deferred.promise;
    }
    return gameDao.findGamesByEmail(email);
}

function editGame (obj) {
    // obj is a string, so we need to convert it into an object
    return gameDao.editGame(JSON.parse(obj));
}

exports.findGameById = findGameById;
exports.findGamesByEmail = findGamesByEmail;
exports.editGame = editGame;
