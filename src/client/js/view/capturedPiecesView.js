/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

const CapturedPiecesView = View.extend({

    initialize: function () {
        
        this.parent = this.options.parent;
        this.capturedPieces = this.options.capturedPieces;
        
        this.listenTo(this.capturedPieces, 'add', this._updateCapturedPieces);
        
        this.initTemplate('capturedPieces');
        
    },

    /*
    * Listens to the capturedPieces collection. When a piece is added, updated the view.
    */
    _updateCapturedPieces: function () {
      // The objects in the collection are in the form: {pieceId: 'WP34'}
      // So we'll get a handle on the object, and construct a new Piece using the id.
      const obj = this.capturedPieces.at(this.capturedPieces.length - 1);
      const piece = new Piece({id: obj.get('pieceId')});
      const targetId = (piece.isBlack()) ? '#capturedBlackPieces' : '#capturedWhitePieces';
      const capturedPiecesElem = this.$(targetId);
      capturedPiecesElem.append('<img src="/webapp/images/' + piece.qualifiedName + '.gif" />');
    }

});
