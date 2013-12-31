/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.MessagesView = Backbone.View.extend({

    el: '#messageContainer',

    initialize: function () {

        // set the passed-in options
        this.eventHandler = this.options.eventHandler;
        this.board = this.options.board;

        // set up the listener
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.UPDATED_LEGAL_MOVES, this._handleLegalMovesUpdate);

    },

    _handleLegalMovesUpdate: function () {
        if (this.board.isStalemate()) {
            this._renderStalemateMessage();
        }
        if (this.board.isCheckmate()) {
            this._renderCheckmateMessage();
        }
    },

    _renderStalemateMessage: function () {
        this.$el.html('Stalemate - the game is a draw.');
    },

    _renderCheckmateMessage: function () {
        var winner = (this.board.currentPlayer === 'W') ? 'Black' : 'White';
        this.$el.html('Checkmate! ' + winner + ' wins!!');
    }

});
