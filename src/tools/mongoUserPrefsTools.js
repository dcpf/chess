'use strict';

var databaseUrl = "chessdb"; // "username:password@example.com/mydb"
var mongojs = require("mongojs");

var db = mongojs(databaseUrl, ['userPrefs']);

var getAllUserPrefs = function () {
    db.userPrefs.find({}, function (err, userPrefs) {
        if (err) {
            console.log(err);
        } else {
            console.log(userPrefs);
        }
    });
};

var deleteAllUserPrefs = function () {
    db.userPrefs.remove({}, function (err, userPrefs) {
        if (err) {
            console.log(err);
        } else {
            console.log(userPrefs);
        }
    });
};

var f = process.argv[2];

if (f === 'getAllUserPrefs') {
    getAllUserPrefs();
} else if (f === 'deleteAllUserPrefs') {
    deleteAllUserPrefs();
}
