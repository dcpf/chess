'use strict';

var q = require('q');
var gameIdFactory = require('../model/mongoGameIdFactory');
var gameDao = require('../dao/mongoGameDAO');
var customErrors = require('../error/customErrors');

function findGameById (postData) {
	var gameID;
	var deferred = q.defer();
	if (!postData.gameID.trim()) {
		deferred.reject(new Error('Game ID is required'));
		return deferred.promise;
	}
	try {
		gameID = gameIdFactory.getGameID(postData.gameID);
	} catch (err) {
		deferred.reject(err);
		return deferred.promise;
	}
	gameDao.getGameObject(gameID.id).then(function (gameObj) {
        deferred.resolve(gameObj);
    }).fail (function (err) {
        if (err instanceof customErrors.InvalidGameIdError) {
            err.message = 'Invalid Game ID: ' + gameID.compositeID;
        }
        deferred.reject(err);
    });
	return deferred.promise;
}

function findGamesByEmail (postData) {
    var email = postData.email;
    var deferred = q.defer();
    if (!email.trim()) {
        deferred.reject(new Error('Email is required'));
        return deferred.promise;
    }
    gameDao.findGamesByEmail(email).then(function (games) {
        deferred.resolve(games);
    }).fail (function (err) {
        deferred.reject(err);
    });
    return deferred.promise;
}

exports.findGameById = findGameById;
exports.findGamesByEmail = findGamesByEmail;
