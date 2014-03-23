'use strict';

var mongojs = require("mongojs");
var q = require('q');

var databaseUrl = GLOBAL.CONFIG.db.databaseUrl;
var db = mongojs(databaseUrl, ['userPrefs']);

var setUserPref = function (email, name, value) {
    
    var deferred = q.defer();
    getUserPrefs(email)
        .then(function (userPrefs) {
            userPrefs.prefs = userPrefs.prefs || {};
            value = _valueConverter(value);
            var id = userPrefs._id || null;
            userPrefs.prefs[name] = value;
            db.userPrefs.save({_id: id, email: email, prefs: userPrefs.prefs}, function (err, savedObj) {
                if (err) {
                    deferred.reject(err);
                } else if (!savedObj) {
                    deferred.reject(new Error('Error setting user pref for ' + email + ': ' + name + ' = ' + value));
                } else {
                    console.log('Set user pref for ' + email + ': ' + name + ' = ' + value);
                    deferred.resolve(userPrefs);
                }
            });
        })
        .fail(function (err) {
            deferred.reject(err);
        });
    
    return deferred.promise;
    
};

var getUserPrefs = function (email) {
    var deferred = q.defer();
    if (email) {
        db.userPrefs.findOne({email: email}, function (err, userPrefs) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(userPrefs || {});
            }
        });
    } else {
        deferred.resolve({});
    }
    return deferred.promise;
};

exports.setUserPref = setUserPref;
exports.getUserPrefs = getUserPrefs;

/**
* Converts certain values into what we need in the JSON
*/
var _valueConverter = function (value) {

	// convert boolean 'strings' to real booleans
	if (value === 'false') {
		return false;
	}
	if (value === 'true') {
		return true;
	}

	return value;

};
