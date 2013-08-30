/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.EventHandler = function () {

	// static messages object
	var messageNames = {
		updatedLegalMoves: 'updatedLegalMoves',
		moveHistoryLinkClicked: 'moveHistoryLinkClicked',
		replayGameLinkClicked: 'replayGameLinkClicked'
	};

	// this is the object we'll return
	var obj = {
		messageNames: this.messageNames
	};

	// mixin the backbone event module
	_.extend(obj, Backbone.Events);

	// return the object
	return obj;

};

chess.eventHandler = new chess.EventHandler();
