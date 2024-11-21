import { UserPrefs } from "../../types";
import { getMongoClient } from "./mongoClient";

type UserPrefsRecord = {
  createDate: Date;
  modifyDate: Date;
  email: string;
  prefs: UserPrefs;
};

const USER_PREFS = "userPrefs";

export const setUserPref = async (email: string, name: string, value: unknown) => {
  const userPrefs = await getUserPrefs(email);
  userPrefs.prefs = userPrefs.prefs ?? {};
  const modifyDate = new Date();
  const createDate = userPrefs.createDate ?? modifyDate;
  userPrefs.prefs[name] = valueConverter(value);
  const obj = {
    createDate,
    modifyDate,
    email,
    prefs: userPrefs.prefs,
  };
  try {
    const mongoClient = await getMongoClient();
    const result = await mongoClient
      .db()
      .collection(USER_PREFS)
      .updateOne({ email }, { $set: obj }, { upsert: true });
    console.log(`Set user pref for ${email}: ${name} = ${value}`);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
    throw new Error(`Error setting user pref for ${email}: ${errMsg}`);
  }
};

export const getUserPrefs = async (email: string): Promise<UserPrefsRecord> => {
  if (!email) {
    return {} as UserPrefsRecord;
  }
  const mongoClient = await getMongoClient();
  const userPrefs = await mongoClient
    .db()
    .collection(USER_PREFS)
    .findOne({ email });
  return userPrefs ?? {};
};

/**
 * Converts certain values into what we need in the JSON
 */
const valueConverter = (value: unknown): unknown => {
  if (value === "false") {
    return false;
  }
  if (value === "true") {
    return true;
  }

  return value;
}
