/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

const MessagesView = Backbone.View.extend({

    initialize: function () {

        // set the passed-in options
        let parent = this.options.parent;
        this.eventHandler = this.options.eventHandler;
        this.board = this.options.board;

        // This view has no template, so just attach the default el to the parent.
        parent.empty();
        parent.append(this.$el);

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
        const winner = (this.board.currentPlayer === 'W') ? 'Black' : 'White';
        this.$el.html('Checkmate! ' + winner + ' wins!!');
    }

});
