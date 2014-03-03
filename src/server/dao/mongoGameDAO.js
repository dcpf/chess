'use strict';

var databaseUrl = "chessdb"; // "username:password@example.com/mydb"
var mongojs = require("mongojs");
var q = require('q');

var db = mongojs(databaseUrl, ['games']);

/**
* Get the game object from the db by gameID.
*/
var getGameObject = function (gameID) {
    
    var deferred = q.defer(),
        id;
    
    try {
        id = mongojs.ObjectId(gameID);
    } catch (err) {
        // If ObjectId() throws an error, it means the gameID is invalid
        deferred.reject(new Error('Invalid Game ID: ' + gameID));
        return deferred.promise;
    }
    
    db.games.findOne({_id: id}, function (err, game) {
        if (err) {
            deferred.reject(err);
        } else if (!game) {
            deferred.reject(new Error('Invalid Game ID: ' + gameID));
        } else {
            deferred.resolve(game.gameObj);
        }
    });
    
    return deferred.promise;
    
};

var saveGame = function (gameID, gameObj) {
    var deferred = q.defer();
    var id = (gameID) ? mongojs.ObjectId(gameID) : null;
	db.games.save({_id: id, gameObj: gameObj}, function (err, savedObj) {
        if (err) {
            deferred.reject(err);
        } else if (!savedObj) {
            deferred.reject(new Error('Game ' + gameID + ' not saved'));
        } else {
            gameID = gameID || savedObj._id;
            deferred.resolve(gameID);
        }
    });
    return deferred.promise;
};

var createGame = function (gameObj) {
   return saveGame(null, gameObj);
};

exports.getGameObject = getGameObject;
exports.saveGame = saveGame;
exports.createGame = createGame;
