/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.eventHandler = {
	messageNames: {
		updatedLegalMoves: 'updatedLegalMoves',
		moveHistoryLinkClicked: 'moveHistoryLinkClicked'
	}
};

// mixin the backbone event module
_.extend(chess.eventHandler, Backbone.Events);
