const { MongoClient } = require("mongodb");
import { decrypt } from '../crypto';

let mongoClient: typeof MongoClient;

const getDbUrl = (): string => {
  const dbUrl = process.env.MONGODB_URI ?? global.CONFIG.db.databaseUrl;
  const dbPass = decrypt(global.CONFIG.db.pass);
  return dbUrl.replace('<password>', dbPass);
};

export const getMongoClient = async () => {
  if (!mongoClient) {
    const url = getDbUrl();
    console.log(`Connecting to mongo: ${url}`);
    mongoClient = new MongoClient(url, { useUnifiedTopology: true });
    await mongoClient.connect();
  }
  return mongoClient;
};
