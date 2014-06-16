'use strict';

/*
* FileSystem-based implementation
*/

var fs = require('fs');

const DATA_DIR = '.data/';
const GAME_ID_CHARS = 'abcdefghijkmnopqrstuvwxyz234567890';

// Create the user prefs dir if it doesn't alreay exist
if (!fs.existsSync(DATA_DIR)) {
	fs.mkdirSync(DATA_DIR);
	console.log('Created game data dir: ' + DATA_DIR);
}

/**
* Get the game object from disk by gameID. Throws an error if no game exists by the ID.
*/
var getGameObject = function (gameID) {
	var gameObj = {};
	var file = DATA_DIR + gameID;
	try {
		let jsonStr = fs.readFileSync(file, {encoding: 'utf8'});
		gameObj = JSON.parse(jsonStr);
	} catch (err) {
		err.message = 'Invalid Game ID: ' + gameID;
		throw err;
	}
	return gameObj;
};

var saveGame = function (gameID, gameObj) {
	var file = DATA_DIR + gameID;
	fs.writeFileSync(file, JSON.stringify(gameObj));
};

var createGame = function (gameObj) {
	var gameID, file;
	while (true) {
		gameID = generateRandomGameID();
		file = DATA_DIR + gameID;
		if (!fs.existsSync(file)) {
			saveGame(gameID, gameObj);
			console.log('created file ' + file);
			break;
		}
	}
	return gameID;
};

exports.getGameObject = getGameObject;
exports.saveGame = saveGame;
exports.createGame = createGame;

//
// private functions
//

function generateRandomGameID () {
	var s = '';
  for (let i = 0; i < 12; i++) {
		s += GAME_ID_CHARS.charAt(Math.floor(Math.random() * GAME_ID_CHARS.length));
  }
  return s;
}
