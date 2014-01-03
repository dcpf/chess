'use strict';

var fs = require('fs');

var DATA_DIR = '.user_prefs/';

exports.setUserPrefs = function (email, userPrefs) {
	var file = DATA_DIR + email;
	fs.writeFileSync(file, JSON.stringify(userPrefs));
}

exports.getUserPrefs = function (email) {
	var userPrefs = {};
	var file = DATA_DIR + email;
	if (fs.existsSync(file)) {
		var jsonStr = fs.readFileSync(file, {encoding: 'utf8'});
		userPrefs = JSON.parse(jsonStr);
	}
	return userPrefs;
}
