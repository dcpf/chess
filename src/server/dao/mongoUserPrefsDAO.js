"use strict";

const { MongoClient, ObjectID } = require("mongodb");

const USER_PREFS = "userPrefs";

const databaseUrl = process.env.MONGODB_URI || global.CONFIG.db.databaseUrl;
const mongoClient = new MongoClient(databaseUrl, { useUnifiedTopology: true });
mongoClient.connect();

const setUserPref = async (email, name, value) => {
  const userPrefs = await getUserPrefs(email);
  userPrefs.prefs = userPrefs.prefs || {};
  const modifyDate = new Date();
  const createDate = userPrefs.createDate || modifyDate;
  userPrefs.prefs[name] = valueConverter(value);
  const obj = {
    createDate,
    modifyDate,
    email,
    prefs: userPrefs.prefs,
  };
  try {
    const result = await mongoClient
      .db()
      .collection(USER_PREFS)
      .updateOne({ email }, { $set: obj }, { upsert: true });
    console.log(`Set user pref for ${email}: ${name} = ${value}`);
  } catch(_e) {
    throw new Error(`Error setting user pref for ${email}: ${err.toString()}`)
  }
};

const getUserPrefs = async (email) => {
  if (!email) {
    return {};
  }
  const userPrefs = await mongoClient
    .db()
    .collection(USER_PREFS)
    .findOne({ email });
  return userPrefs ?? {};
};

exports.setUserPref = setUserPref;
exports.getUserPrefs = getUserPrefs;

/**
 * Converts certain values into what we need in the JSON
 */
const valueConverter = (value) => {
  if (value === "false") {
    return false;
  }
  if (value === "true") {
    return true;
  }

  return value;
}
