/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

chess.EventHandler = function () {

	// this is the object we'll return
	var obj = {
		// defined below using prototype
		messageNames: this.messageNames
	};

	// mixin the backbone event module
	_.extend(obj, Backbone.Events);

	// return the object
	return obj;

};

/*
* Static message names defined here so only one copy exists.
*/
chess.EventHandler.prototype.messageNames = {
	ERROR: 'error',
	CREATE_GAME: 'createGame',
	ENTER_GAME: 'enterGame',
	GAME_CREATED: 'gameCreated',
	GAME_ENTERED: 'gameEntered',
	CREATE_GAME_ERROR: 'createGameError',
	ENTER_GAME_ERROR: 'enterGameError',
	UPDATED_LEGAL_MOVES: 'updatedLegalMoves',
	RENDER_CONFIRM_MOVE_DIALOG: 'renderConfirmMoveDialog',
	MOVE_CONFIRMED: 'moveConfirmed',
	SAVE_MOVE: 'saveMove',
	MOVE_SAVED: 'moveSaved',
	CANCEL_MOVE: 'cancelMove',
	MOVE_HISTORY_LINK_CLICKED: 'moveHistoryLinkClicked',
	REPLAY_GAME_LINK_CLICKED: 'replayGameLinkClicked'
};
