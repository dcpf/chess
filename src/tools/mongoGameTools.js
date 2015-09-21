'use strict';

var databaseUrl = "chessdb"; // "username:password@example.com/mydb"
var mongojs = require("mongojs");

var db = mongojs(databaseUrl, ['games']);

function getGameById (gameID) {
  var id = mongojs.ObjectId(gameID);
  db.games.findOne({_id: id},
    function (err, record) {
      if (err) {
        console.log(err);
      } else if (!record) {
        console.log('no records found');
      } else {
        console.log(record);
      }
  });
};

function getAllGames () {
  db.games.find({},
    function (err, records) {
      if (err) {
        console.log(err);
      } else {
        let numRecords = records.length;
        for (let i = 0; i < numRecords; i++) {
          console.log(records[i]);
        }
      }
  });
};

function deleteAllGames () {
  db.games.remove();
};

var f = process.argv[2];

if (f === 'getGameById') {
  getGameById(process.argv[3]);
} else if (f === 'getAllGames') {
  getAllGames();
} else if (f === 'deleteAllGames') {
  deleteAllGames();
}
