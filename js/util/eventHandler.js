/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

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
	gameCreated: 'gameCreated',
	updatedLegalMoves: 'updatedLegalMoves',
	renderConfirmMoveDialog: 'renderConfirmMoveDialog',
	moveConfirmed: 'moveConfirmed',
	cancelMove: 'cancelMove',
	moveHistoryLinkClicked: 'moveHistoryLinkClicked',
	replayGameLinkClicked: 'replayGameLinkClicked'
};
