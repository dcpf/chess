var chess = chess || {};

chess.CapturedPieces = Backbone.Collection.extend({
	model: chess.Piece
});

chess.capturedPieces = new chess.CapturedPieces();
