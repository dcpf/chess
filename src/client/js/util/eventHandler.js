/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

const EventHandler = function () {

	// this is the object we'll return
	let obj = {
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
EventHandler.prototype.messageNames = {
	ERROR: 'error',
	CREATE_GAME: 'createGame',
	ENTER_GAME: 'enterGame',
	GAME_CREATED: 'gameCreated',
	GAME_ENTERED: 'gameEntered',
	CREATE_GAME_ERROR: 'createGameError',
	ENTER_GAME_ERROR: 'enterGameError',
	FORGOT_GAME_ID_LINK_CLICKED: 'forgotGameIdLinkClicked',
	FIND_GAMES_BY_EMAIL: 'findGamesByEmail',
	FOUND_GAMES_BY_EMAIL: 'foundGamesByEmail',
	FIND_GAMES_BY_EMAIL_ERROR: 'findGamesByEmailError',
	UPDATED_LEGAL_MOVES: 'updatedLegalMoves',
	RENDER_CONFIRM_MOVE_DIALOG: 'renderConfirmMoveDialog',
	MOVE_CONFIRMED: 'moveConfirmed',
	SAVE_MOVE: 'saveMove',
	MOVE_SAVED: 'moveSaved',
	CANCEL_MOVE: 'cancelMove',
    OPPONENT_HAS_MOVED: 'opponentHasMoved',
	MOVE_HISTORY_LINK_CLICKED: 'moveHistoryLinkClicked',
	REPLAY_GAME_LINK_CLICKED: 'replayGameLinkClicked',
	FEEDBACK_LINK_CLICKED: 'feedbackLinkClicked',
	FEEDBACK_SUBMIT: 'feedbackSubmit',
	FEEDBACK_SUCCESS: 'feedbackSuccess',
    PLAYER_ONLINE: 'playerOnline',
    PLAYER_OFFLINE: 'playerOffline'
};
