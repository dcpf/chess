'use strict';

/**
* Represents the gameID, which is a combination of an mongodb objectID and a random 5-digit game "key".
* For example, the gameID 53ca3eb9b90fec0200d731c047672-88389 is the equivalent of:
*
* Mongodb ID: 53ca3eb9b90fec0200d731c047672
* Key: 88389
*
*/

exports.getGameID = function (id, key) {

    var obj = {};

    if (key) {
      obj.id = id;
      obj.key = key;
      obj.compositeID = id + '-' + key;
    } else {
      try {
        let parts = id.split('-');
        obj.id = parts[0];
        obj.key = parts[1];
        obj.compositeID = id;
      } catch (err) {
        throw(new Error(`Invalid game ID: ${id}`));
      }
    }

    return obj;
};
