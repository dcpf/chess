'use strict';

var gameIdFactory = require('../model/mongoGameIdFactory');
var gameDao = require('../dao/mongoGameDAO');
var customErrors = require('../error/customErrors');

function findGameById (gameID) {

    var gameIdObj;
	if (!gameID || !gameID.trim()) {
		return Promise.reject(new Error('Game ID is required'));
	}

	try {
		gameIdObj = gameIdFactory.getGameID(gameID);
	} catch (err) {
		return Promise.reject(err);
	}

    var promise = new Promise((resolve, reject) => {
        gameDao.getGameObject(gameIdObj.id).then((obj) => {
            resolve(obj);
        }).catch ((err) => {
            if (err instanceof customErrors.InvalidGameIdError) {
                err.message = `Invalid Game ID: ${gameIdObj.compositeID}`;
            }
            reject(err);
        });
    });

    return promise;

}

function findGamesByEmail (email) {
    if (!email || !email.trim()) {
        return Promise.reject(new Error('Email is required'));
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
