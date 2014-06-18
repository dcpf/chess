'use strict';

var mongojs = require("mongojs");
var q = require('q');
var customErrors = require('../error/customErrors');

var databaseUrl = GLOBAL.CONFIG.db.databaseUrl;
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
        deferred.reject(new customErrors.InvalidGameIdError());
        return deferred.promise;
    }

    db.games.findOne({_id: id}, function (err, record) {
        if (err) {
          deferred.reject(err);
        } else if (!record) {
          deferred.reject(new customErrors.InvalidGameIdError());
        } else {
          deferred.resolve(record.gameObj);
        }
    });

    return deferred.promise;

};

/**
* @param String gameID
* @param Array moveHistory
*/
var updateMoveHistory = function (gameID, moveHistory) {

  var deferred = q.defer();

  db.games.update(
    // query
    { _id: mongojs.ObjectId(gameID) },
    // update fields
    {
      $set: {
        modifyDate: new Date(),
        "gameObj.moveHistory": moveHistory
      }
    },
    // options
    {},
    // callback
    function (err, savedObj) {
      if (err) {
        deferred.reject(err);
      } else if (!savedObj) {
        deferred.reject(new Error('Game ' + gameID + ' not saved'));
      } else {
        deferred.resolve(gameID);
      }
  });

  return deferred.promise;

};

/**
* @param Object gameObj
*/
var createGame = function (gameObj) {

   var deferred = q.defer();
   var obj = {
     _id: null,
     createDate: new Date(),
     modifyDate: new Date(),
     gameObj: gameObj
   };

   db.games.insert(obj, function (err, savedObj) {
     if (err) {
       deferred.reject(err);
     } else if (!savedObj) {
       deferred.reject(new Error('Game ' + gameID + ' not saved'));
     } else {
       deferred.resolve(savedObj._id.toHexString());
     }
   });

   return deferred.promise;

};

/**
* Find games by email address
*/
var findGamesByEmail = function (email) {

    var deferred = q.defer();

    db.games.find(
      { $or: [
          {'gameObj.W.email': email},
          {'gameObj.B.email': email}
        ]
      },
      function (err, records) {
        if (err) {
          deferred.reject(err);
        } else {
          let gamesArray = [];
          if (records) {
            let numRecords = records.length,
                record = null,
                gameObj = null;
            for (let i = 0; i < numRecords; i++) {
              record = records[i];
              gameObj = record.gameObj;
              // Set the id field in the game object for convenience
              gameObj.id = record._id.toHexString();
              gamesArray.push(gameObj);
            }
          }
          deferred.resolve(gamesArray);
        }
    });

    return deferred.promise;

};

exports.getGameObject = getGameObject;
exports.updateMoveHistory = updateMoveHistory;
exports.createGame = createGame;
exports.findGamesByEmail = findGamesByEmail;
