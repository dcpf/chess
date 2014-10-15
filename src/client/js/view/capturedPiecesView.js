/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var CapturedPiecesView = Backbone.View.extend({

    el: '#capturedPiecesView',

    initialize: function (attrs) {
        
        this.capturedPieces = attrs.capturedPieces;
        
        this.listenTo(this.capturedPieces, 'add', this._updateCapturedPieces);
        
        // Create the template
        this.template = _.template(
            $('#capturedPiecesTemplate').html()
        );
        
        // Render the template
        this.$el.html(
            this.template()
        );
        
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
