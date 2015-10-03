'use strict';

var mongojs = require("mongojs");

var databaseUrl = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || GLOBAL.CONFIG.db.databaseUrl;
console.log('databaseUrl: ' + databaseUrl);
var db = mongojs(databaseUrl, ['userPrefs']);

function setUserPref (email, name, value) {

    var promise = new Promise((resolve, reject) => {
        getUserPrefs(email)
        .then((userPrefs) => {
            userPrefs.prefs = userPrefs.prefs || {};
            var id = userPrefs._id || null;
            var modifyDate = new Date();
            var createDate = userPrefs.createDate || modifyDate;
            userPrefs.prefs[name] = _valueConverter(value);
            var obj = {
                _id: id,
                createDate: createDate,
                modifyDate: modifyDate,
                email: email,
                prefs: userPrefs.prefs
            };
            db.userPrefs.save(obj, (err, savedObj) => {
                if (err) {
                    reject(err);
                } else if (!savedObj) {
                    reject(new Error(`Error setting user pref for ${email}: ${name} = ${value}`));
                } else {
                    console.log(`Set user pref for ${email}: ${name} = ${value}`);
                    resolve(userPrefs);
                }
            });
        })
        .catch((err) => {
            reject(err);
        });
    });

    return promise;

}

function getUserPrefs (email) {
    var promise = new Promise((resolve, reject) => {
        if (email) {
            db.userPrefs.findOne({email: email}, (err, userPrefs) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(userPrefs || {});
                }
            });
        } else {
            resolve({});
        }
    });
    return promise;
}

exports.setUserPref = setUserPref;
exports.getUserPrefs = getUserPrefs;

/**
* Converts certain values into what we need in the JSON
*/
function _valueConverter (value) {

	// convert boolean 'strings' to real booleans
	if (value === 'false') {
		return false;
	}
	if (value === 'true') {
		return true;
	}

	return value;

}
