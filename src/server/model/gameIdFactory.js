'use strict';

/**
* Represents the gameID, which is a combination of an obfuscated mongodb objectID and a random 5-digit game "key".
* For example, the gameID 531cda8e144d1b671e-1-88389 is the equivalent of:
*
* Mongodb ID: 531cda8e144d1b671e000001
* Key: 88389
*
* The zeros at the end of the 24-digit mongodb ID are replaced with a single dash, and the game key is tacked on to the end.
*
*/

const MONGO_DB_REGEXP = /0+([^0]+)$/;

exports.getGameID = function (id, key) {

    var obj = {};

    if (key) {
        obj.key = key;
        obj.id = id;
        obj.compositeID = _obfuscateGameID(id) + '-' + key;
    } else {
        let parts = id.split('-');
        obj.key = parts[2];
        obj.id = _deobfuscateGameID(parts[0], parts[1]);
        obj.compositeID = id;
    }

    return obj;
};

/**
* Obfuscate the gameID by replacing all 0s at the end of the ID with a single hyphen.
* 5313a204d2cfc5da53000001 > 5313a204d2cfc5da53-1
* 5313a204d2cfc5da53000017 > 5313a204d2cfc5da53-17
*/
function _obfuscateGameID (id) {
    return id.replace(MONGO_DB_REGEXP, '-$1');
}

/**
* De-obfuscate the gameID by replacing the hyphen with the correct number of 0s.
* 5313a204d2cfc5da53-1 > 5313a204d2cfc5da53000001
* 5313a204d2cfc5da53-17 > 5313a204d2cfc5da53000017
*/
function _deobfuscateGameID (part1, part2) {
    var zeros = '',
        numZerosNeeded = 24 - part1.length - part2.length,
        deobfuscatedID;
    while (zeros.length < numZerosNeeded) {
        zeros += '0';
    }
    deobfuscatedID = part1 + zeros + part2;
    if (deobfuscatedID.length != 24) {
        console.error("De-obfuscated ID is not the expected length of 24: " + deobfuscatedID);
    }
    return deobfuscatedID;
}
