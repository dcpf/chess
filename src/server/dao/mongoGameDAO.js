"use strict";

const { MongoClient, ObjectID } = require("mongodb");
const customErrors = require("../error/customErrors");

const GAMES = "games";

const databaseUrl = process.env.MONGODB_URI || global.CONFIG.db.databaseUrl;
const mongoClient = new MongoClient(databaseUrl, { useUnifiedTopology: true });
mongoClient.connect();

const getObjectId = (id) => {
  try {
    return new ObjectID(id);
  } catch (err) {
    throw new customErrors.InvalidGameIdError();
  }
};

/**
 * Get the game object from the db by gameID.
 */
const getGameObject = async (gameID) => {
  try {
    return await mongoClient
      .db()
      .collection(GAMES)
      .findOne({ _id: getObjectId(gameID) });
  } catch (_e) {
    throw new customErrors.InvalidGameIdError();
  }
};

/**
 * @param String gameID
 * @param Array moveHistory
 */
const updateMoveHistory = async (gameID, moveHistory) => {
  await mongoClient
    .db()
    .collection(GAMES)
    .updateOne(
      { _id: new ObjectID(gameID) },
      {
        $set: {
          modifyDate: new Date(),
          "gameObj.moveHistory": moveHistory,
        },
      }
    );
  return gameID;
};

/**
 * @param Object gameObj
 */
const createGame = async (gameObj) => {
  const obj = {
    createDate: new Date(),
    modifyDate: new Date(),
    gameObj,
  };

  try {
    const res = await mongoClient
      .db()
      .collection(GAMES)
      .insertOne(obj);
    return res.insertedId;
  } catch (_e) {
    throw new Error("Error creating game");
  }
};

/**
 * Find games by email address
 */
const findGamesByEmail = async (email) => {
  const cursor = mongoClient
    .db()
    .collection(GAMES)
    .find(
      {
        $or: [{ "gameObj.W.email": email }, { "gameObj.B.email": email }],
      },
      {
        sort: { modifyDate: -1 },
      }
    );
  return await cursor.toArray();
};

exports.getGameObject = getGameObject;
exports.updateMoveHistory = updateMoveHistory;
exports.createGame = createGame;
exports.findGamesByEmail = findGamesByEmail;
