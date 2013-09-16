exports.enterGame = function (postData) {

	var newOrExisting = postData['new_or_existing'];
	if (newOrExisting === 'N') {
		var player1Email = postData['Player1 Email'];
		var player2Email = postData['Player2 Email'];
		var newGameName = postData['New Game Name'];
		createGame(player1Email, player2Email, newGameName);
	} else {
		var existingGameName = postData['Existing Game Name'];
		var key = postData['key'];
		enterExistingGame(existingGameName, key);
	}

	console.log(postData);
	return 'chess.html';

};

function createGame (player1Email, player2Email, newGameName) {

}

function enterExistingGame (existingGameName, key) {

}
