/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.CapturedPieces = Backbone.Collection.extend({
	model: chess.Piece
});

chess.capturedPieces = new chess.CapturedPieces();
