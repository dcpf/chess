/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

'use strict';

var chess = chess || {};

chess.CapturedPieces = Backbone.Collection.extend({
	model: chess.Piece
});
