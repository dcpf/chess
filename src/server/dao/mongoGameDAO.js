"use strict";

const { MongoClient, ObjectID } = require("mongodb");
const customErrors = require("../error/customErrors");

const DB_NAME = GLOBAL.CONFIG.db.name;
const GAMES = "games";

const databaseUrl = process.env.MONGODB_URI || GLOBAL.CONFIG.db.databaseUrl;
const mongoClient = new MongoClient(databaseUrl, { useUnifiedTopology: true });
mongoClient.connect();

function getObjectId(id, reject) {
  try {
    return new ObjectID(id);
  } catch (err) {
    reject(new customErrors.InvalidGameIdError());
  }
}

/**
 * Get the game object from the db by gameID.
 */
function getGameObject(gameID) {
  return new Promise((resolve, reject) => {
    mongoClient
      .db(DB_NAME)
      .collection(GAMES)
      .findOne({ _id: getObjectId(gameID, reject) })
      .then((record) => {
        if (record) {
          resolve(record);
        } else {
          reject(new customErrors.InvalidGameIdError());
        }
      });
  });
}

/**
 * @param String gameID
 * @param Array moveHistory
 */
function updateMoveHistory(gameID, moveHistory) {
  return new Promise((resolve, reject) => {
    mongoClient
      .db(DB_NAME)
      .collection(GAMES)
      .updateOne(
        // query
        { _id: new ObjectID(gameID) },
        // update fields
        {
          $set: {
            modifyDate: new Date(),
            "gameObj.moveHistory": moveHistory,
          },
        }
      )
      .then(() => resolve(gameID));
  });
}

/**
 * @param Object gameObj
 */
function createGame(gameObj) {
  const obj = {
    createDate: new Date(),
    modifyDate: new Date(),
    gameObj: gameObj,
  };

  return new Promise((resolve, reject) => {
    mongoClient
      .db(DB_NAME)
      .collection(GAMES)
      .insertOne(obj)
      .then((res) => {
        resolve(res.insertedId);
      })
      .catch((err) => {
        reject(new Error("Error creating game"));
      });
  });
}

/**
 * Find games by email address
 */
function findGamesByEmail(email) {
  return new Promise((resolve, reject) => {
    const cursor = mongoClient
      .db(DB_NAME)
      .collection(GAMES)
      .find(
        {
          $or: [{ "gameObj.W.email": email }, { "gameObj.B.email": email }],
        },
        {
          sort: { modifyDate: -1 },
        }
      );
    resolve(cursor.toArray());
  });
}

/**
 * This is for admin purposes only
 */
function editGame(obj) {
  // If moveHistory has been modified, it will be a string, so convert it back to an array.
  let moveHistory = obj.gameObj.moveHistory;
  if (typeof moveHistory === "string") {
    moveHistory = moveHistory.split(",");
  }

  return new Promise((resolve, reject) => {
    mongoClient.connect((dbErr) => {
      const collection = mongoClient.db(DB_NAME).collection(GAMES);
      collection.updateOne(
        // query
        { _id: obj._id },
        // update fields
        {
          $set: {
            modifyDate: new Date(),
            "gameObj.moveHistory": moveHistory,
            "gameObj.W.email": obj.gameObj.W.email,
            "gameObj.B.email": obj.gameObj.B.email,
          },
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
            resolve({ status: "ok" });
          }
        }
      );
      mongoClient.close();
    });
  });
}

exports.getGameObject = getGameObject;
exports.updateMoveHistory = updateMoveHistory;
exports.createGame = createGame;
exports.findGamesByEmail = findGamesByEmail;
exports.editGame = editGame;
