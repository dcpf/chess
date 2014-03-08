'use strict';

var mongojs = require("mongojs");
var q = require('q');

var databaseUrl = GLOBAL.CONFIG.db.databaseUrl;
var db = mongojs(databaseUrl, ['games']);

/**
* Get the game object from the db by gameID.
*/
var getGameObject = function (gameID) {
    
    var deferred = q.defer(),
        id;
    
    try {
        id = mongojs.ObjectId(_deobfuscateGameID(gameID));
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
    var id = (gameID) ? mongojs.ObjectId(_deobfuscateGameID(gameID)) : null;
	db.games.save({_id: id, gameObj: gameObj}, function (err, savedObj) {
        if (err) {
            deferred.reject(err);
        } else if (!savedObj) {
            deferred.reject(new Error('Game ' + gameID + ' not saved'));
        } else {
            gameID = gameID || _obfuscateGameID(savedObj._id.toHexString());
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

/**
* Obfuscate the gameID by replacing all 0s at the end of the ID with a single hyphen.
* 5313a204d2cfc5da53000001 > 5313a204d2cfc5da53-1
* 5313a204d2cfc5da53000017 > 5313a204d2cfc5da53-17
*/
function _obfuscateGameID (gameID) {
    return gameID.replace(/0+([^0]+)$/, '-$1');
}

/**
* De-obfuscate the gameID by replacing the hyphen with the correct number of 0s.
* 5313a204d2cfc5da53-1 > 5313a204d2cfc5da53000001
* 5313a204d2cfc5da53-17 > 5313a204d2cfc5da53000017
*/
function _deobfuscateGameID (gameID) {
    var zeros = '',
        parts = gameID.split('-'),
        numZeros = 25 - gameID.length;
    while (zeros.length != numZeros) {
        zeros += '0';
    }
    return parts[0] + zeros + parts[1];
}
