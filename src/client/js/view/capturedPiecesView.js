/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var CapturedPiecesView = View.extend({

    initialize: function () {
        
        this.parent = this.options.parent;
        this.capturedPieces = this.options.capturedPieces;
        
        this.listenTo(this.capturedPieces, 'add', this._updateCapturedPieces);
        
        this.renderTemplate('capturedPieces');
        
    },

    /*
    * Listens to the capturedPieces collection. When a piece is added, updated the view.
    */
    _updateCapturedPieces: function () {
      // The objects in the collection are in the form: {pieceId: 'WP34'}
      // So we'll get a handle on the object, and construct a new Piece using the id.
      var obj = this.capturedPieces.at(this.capturedPieces.length - 1);
      var piece = new Piece({id: obj.get('pieceId')});
      var targetId = (piece.isBlack()) ? '#capturedBlackPieces' : '#capturedWhitePieces';
      var capturedPiecesElem = this.$(targetId);
      capturedPiecesElem.append('<img src="/webapp/images/' + piece.qualifiedName + '.gif" />');
    }

});
