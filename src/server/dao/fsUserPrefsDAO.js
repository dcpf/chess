'use strict';

/*
* FileSystem-based implementation
*/

var fs = require('fs');

const DATA_DIR = '.user_prefs/';

// Create the user prefs dir if it doesn't alreay exist
if (!fs.existsSync(DATA_DIR)) {
	fs.mkdirSync(DATA_DIR);
	console.log('Created user pref dir: ' + DATA_DIR);
}

var setUserPref = function (email, name, value) {
	var userPrefs = getUserPrefs(email);
	userPrefs[name] = value;
	var file = DATA_DIR + email;
	fs.writeFileSync(file, JSON.stringify(userPrefs, valueConverter));
	console.log('Set user pref for ' + email + ': ' + name + ' = ' + value);
	return userPrefs;
};

var getUserPrefs = function (email) {
	var userPrefs = {};
	if (email) {
		let file = DATA_DIR + email;
		if (fs.existsSync(file)) {
			let jsonStr = fs.readFileSync(file, {encoding: 'utf8'});
			userPrefs = JSON.parse(jsonStr);
		}
	}
	return userPrefs;
};

exports.setUserPref = setUserPref;
exports.getUserPrefs = getUserPrefs;

/**
* This is a "replacer" function to convert certain values into what we need in the JSON
*/
function valueConverter (key, value) {

	// convert boolean 'strings' to real booleans
	if (value === 'false') {
		return false;
	}
	if (value === 'true') {
		return true;
	}

	return value;

}
