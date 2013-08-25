/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.CapturedPiecesView = Backbone.View.extend({

    el: '#capturedPiecesContainer',

    initialize: function () {
        this.listenTo(chess.capturedPieces, 'add', this._updateCapturedPieces);
    },

    /*
    * Listens to the capturedPieces collection. When a piece is added, updated the view.
    */
    _updateCapturedPieces: function () {
        var piece = chess.capturedPieces.at(chess.capturedPieces.length - 1);
        var targetId = (piece.isBlack()) ? '#capturedBlackPieces' : '#capturedWhitePieces';
        var capturedPiecesElem = this.$(targetId);
        capturedPiecesElem.append('<img src="images/' + piece.qualifiedName + '.gif" />');
    }

});

// This is just a listener, so no need to assign to a variable
new chess.CapturedPiecesView();
