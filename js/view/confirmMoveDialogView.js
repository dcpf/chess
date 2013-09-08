/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.ConfirmMoveDialogView = Backbone.View.extend({

    el: '#confirmMoveDialog',

    initialize: function () {
        this.eventHandler = this.options.eventHandler;
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.renderConfirmMoveDialog, this._render);
    },

    _render: function (moves) {

        var self = this;
        var possibleMoves = [];
        for (var i in moves) {
            var move = moves[i];
            var moveLink = $('<a>').attr({href: '#'}).append(move.notation).click(function(){self._confirmMove({notation: move.notation, pieceId: move.pieceId, toRow: move.toRow, toCol: move.toCol}); return false;});
            possibleMoves.push(moveLink);
        }

        var cancelLink = $('<a>').attr({href: '#'}).append('Cancel').click(function(){self._cancelMove(); return false;});
        possibleMoves.push(cancelLink);
        var ul = $('<ul>')
        for (var i in possibleMoves) {
            $(ul).append($('<li>').append(possibleMoves[i]));
        }

        // Render the dialog
        this.$('#possibleMoves').html(ul);
        this.$el.modal();

    },

    /*
    * Called from the confirm dialog
    */
    _confirmMove: function (args) {
        this.$el.modal('hide');
        var notation = args['notation'];
        var pieceId = args['pieceId'];
        var toRow = args['toRow'] * 1;
        var toCol = args['toCol'] * 1;
        this.eventHandler.trigger(this.eventHandler.messageNames.updateGameWithLatestMove, notation, pieceId, toRow, toCol);
    },

    /*
    * Called from the confirm dialog
    */
    _cancelMove: function () {
        this.$el.modal('hide');
        this.eventHandler.trigger(this.eventHandler.messageNames.cancelMove);
    }

});
