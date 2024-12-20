import { GameObject } from "../../types";
import * as customErrors from "../error/customErrors";
import { getMongoClient } from "./mongoClient";

const { ObjectID } = require("mongodb");

const GAMES = "games";

type GameObjectRecord = {
  _id: string,
  createDate: Date;
  modifyDate: Date;
  gameObj: GameObject;
};

const getObjectId = (id: string): string => {
  try {
    return new ObjectID(id);
  } catch (err) {
    throw new customErrors.InvalidGameIdError();
  }
};

/**
 * Get the game object from the db by gameID.
 */
export const getGameObject = async (gameID: string): Promise<GameObjectRecord> => {
  try {
    const mongoClient = await getMongoClient();
    return await mongoClient
      .db()
      .collection(GAMES)
      .findOne({ _id: getObjectId(gameID) });
  } catch (_e) {
    throw new customErrors.InvalidGameIdError();
  }
};

export const updateMoveHistory = async (gameID: string, moveHistory: string[]): Promise<string> => {
  const mongoClient = await getMongoClient();
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

export const createGame = async (gameObj: GameObject): Promise<string> => {
  const obj = {
    createDate: new Date(),
    modifyDate: new Date(),
    gameObj,
  };

  try {
    const mongoClient = await getMongoClient();
    const res = await mongoClient
      .db()
      .collection(GAMES)
      .insertOne(obj);
    return res.insertedId;
  } catch (_e) {
    throw new Error("Error creating game");
  }
};

export const findGamesByEmail = async (email: string): Promise<GameObjectRecord[]> => {
  const mongoClient = await getMongoClient();
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
