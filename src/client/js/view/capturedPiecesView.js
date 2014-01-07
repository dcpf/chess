/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

chess.CapturedPiecesView = Backbone.View.extend({

    el: '#capturedPiecesContainer',

    initialize: function (attrs) {
        this.capturedPieces = attrs.capturedPieces;
        this.listenTo(this.capturedPieces, 'add', this._updateCapturedPieces);
    },

    /*
    * Listens to the capturedPieces collection. When a piece is added, updated the view.
    */
    _updateCapturedPieces: function () {
        var piece = this.capturedPieces.at(this.capturedPieces.length - 1);
        var targetId = (piece.isBlack()) ? '#capturedBlackPieces' : '#capturedWhitePieces';
        var capturedPiecesElem = this.$(targetId);
        capturedPiecesElem.append('<img src="src/client/images/' + piece.qualifiedName + '.gif" />');
    }

});
