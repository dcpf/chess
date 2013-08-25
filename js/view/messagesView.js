/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.MessagesView = Backbone.View.extend({

    el: '#messageContainer',

    initialize: function () {
        this.listenTo(chess.eventHandler, chess.eventHandler.messageNames.updatedLegalMoves, this._handleLegalMovesUpdate);
    },

    _handleLegalMovesUpdate: function () {
        if (chess.board.isStalemate()) {
            this._renderStalemateMessage();
        }
        if (chess.board.isCheckmate()) {
            this._renderCheckmateMessage();
        }
    },

    _renderStalemateMessage: function () {
        this.$el.html('Stalemate - the game is a draw.');
    },

    _renderCheckmateMessage: function () {
        var winner = (chess.board.currentPlayer === 'W') ? 'Black' : 'White';
        this.$el.html('Checkmate! ' + winner + ' wins!!');
    }

});

// This is just a listener, so no need to assign to a variable
new chess.MessagesView();
