"use strict";

const { MongoClient, ObjectID } = require("mongodb");

const DB_NAME = GLOBAL.CONFIG.db.name;
const USER_PREFS = "userPrefs";

const databaseUrl = process.env.MONGODB_URI || GLOBAL.CONFIG.db.databaseUrl;
const mongoClient = new MongoClient(databaseUrl, { useUnifiedTopology: true });
mongoClient.connect();

function setUserPref(email, name, value) {
  return new Promise((resolve, reject) => {
    getUserPrefs(email)
      .then((userPrefs) => {
        userPrefs.prefs = userPrefs.prefs || {};
        const modifyDate = new Date();
        const createDate = userPrefs.createDate || modifyDate;
        userPrefs.prefs[name] = _valueConverter(value);
        const obj = {
          createDate,
          modifyDate,
          email,
          prefs: userPrefs.prefs,
        };
        mongoClient
          .db(DB_NAME)
          .collection(USER_PREFS)
          .updateOne({ email }, { $set: obj }, { upsert: true })
          .then((result) => {
            console.log(`Set user pref for ${email}: ${name} = ${value}`);
            resolve();
          })
          .catch((err) => {
            reject(new Error(`Error setting user pref for ${email}: ${err.toString()}`));
          });
      });
  });
}

function getUserPrefs(email) {
  return new Promise((resolve) => {
    if (email) {
      mongoClient
        .db(DB_NAME)
        .collection(USER_PREFS)
        .findOne({ email })
        .then((record) => {
          resolve(record || {});
        });
    } else {
      resolve({});
    }
  });
}

exports.setUserPref = setUserPref;
exports.getUserPrefs = getUserPrefs;

/**
 * Converts certain values into what we need in the JSON
 */
function _valueConverter(value) {
  // convert boolean 'strings' to real booleans
  if (value === "false") {
    return false;
  }
  if (value === "true") {
    return true;
  }

  return value;
}
