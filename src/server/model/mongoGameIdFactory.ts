import { GameIdObject } from "../../types";

/**
* Represents the gameID, which is a combination of an mongodb objectID and a random 5-digit game "key".
* For example, the gameID 53ca3eb9b90fec0200d731c047672-88389 is the equivalent of:
*
* Mongodb ID: 53ca3eb9b90fec0200d731c047672
* Key: 88389
*
*/

export const getGameID = (id: string, key?: string): GameIdObject => {

  if (key) {
    return {
      id,
      key,
      compositeID: `${id}-${key}`,
    }
  }

  try {
    const parts = id.split('-');
    return {
      id: parts[0],
      key: parts[1],
      compositeID: id,
    };
  } catch (err) {
    throw (new Error(`Invalid game ID: ${id}`));
  }
};
