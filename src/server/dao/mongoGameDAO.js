'use strict';

var mongojs = require("mongojs");
var customErrors = require('../error/customErrors');

var databaseUrl = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || GLOBAL.CONFIG.db.databaseUrl;
var db = mongojs(databaseUrl, ['games'], {authMechanism: 'ScramSHA1'});

/**
* Get the game object from the db by gameID.
*/
function getGameObject (gameID) {

    var id;

    try {
        id = mongojs.ObjectId(gameID);
    } catch (err) {
        // If ObjectId() throws an error, it means the gameID is invalid
        return Promise.reject(new customErrors.InvalidGameIdError());
    }

    var promise = new Promise((resolve, reject) => {
        db.games.findOne({_id: id}, (err, record) => {
            if (err) {
                reject(err);
            } else if (!record) {
                reject(new customErrors.InvalidGameIdError());
            } else {
                resolve(record);
            }
        });
    });
    
    return promise;

}

/**
* @param String gameID
* @param Array moveHistory
*/
function updateMoveHistory (gameID, moveHistory) {

    var promise = new Promise((resolve, reject) => {
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
                    reject(err);
                } else if (!savedObj) {
                    reject(new Error(`Game ${gameID} not saved`));
                } else {
                    resolve(gameID);
                }
            });
    });
    
    return promise;
}

/**
* @param Object gameObj
*/
function createGame (gameObj) {

   var obj = {
     _id: null,
     createDate: new Date(),
     modifyDate: new Date(),
     gameObj: gameObj
   };

    var promise = new Promise((resolve, reject) => {
        db.games.insert(obj, (err, savedObj) => {
            if (err) {
                reject(err);
            } else if (!savedObj) {
                reject(new Error('Error creating game'));
            } else {
                resolve(savedObj._id.toHexString());
            }
        });
    });

    return promise;
}

/**
* Find games by email address
*/
function findGamesByEmail (email) {

    var promise = new Promise((resolve, reject) => {
        db.games.find(
            {
                $query: {
                    $or: [
                        {'gameObj.W.email': email},
                        {'gameObj.B.email': email}
                    ]
                },
                $orderby: {'modifyDate': -1}
            },
            function (err, records) {
                if (err) {
                    reject(err);
                } else {
                    resolve(records);
                }
            });
    });

    return promise;
}

/**
* This is for admin purposes only
*/
function editGame (obj) {
    
    // If moveHistory has been modified, it will be a string, so convert it back to an array.
    var moveHistory = obj.gameObj.moveHistory;
    if (typeof moveHistory === 'string') {
        moveHistory = moveHistory.split(',');
    }
    
    var promise = new Promise((resolve, reject) => {
        db.games.update(
            // query
            { _id: mongojs.ObjectId(obj._id) },
            // update fields
            {
                $set: {
                    modifyDate: new Date(),
                    "gameObj.moveHistory": moveHistory,
                    "gameObj.W.email": obj.gameObj.W.email,
                    "gameObj.B.email": obj.gameObj.B.email
                }
            },
            // options
            {},
            // callback
            function (err, savedObj) {
                if (err) {
                    reject(err);
                } else if (!savedObj) {
                    reject(new Error(`Error saving game ${obj._id}`));
                } else {
                    console.log(`Edited game: ${JSON.stringify(obj)}`);
                    resolve({status: 'ok'});
                }
            });
    });
    
    return promise;
    
}

exports.getGameObject = getGameObject;
exports.updateMoveHistory = updateMoveHistory;
exports.createGame = createGame;
exports.findGamesByEmail = findGamesByEmail;
exports.editGame = editGame;
