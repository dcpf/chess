/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.ConfirmMoveDialogView = Backbone.View.extend({

    el: '#confirmMoveDialog',

    render: function (moves) {

        var possibleMoves = [];
        for (var i in moves) {
            var move = moves[i];
            var moveLink = $('<a>').attr({href: '#'}).append(move.notation).click(function(){chess.confirmMoveDialogView.confirmMove({notation: move.notation, pieceId: move.pieceId, toRow: move.toRow, toCol: move.toCol}); return false;});
            possibleMoves.push(moveLink);
        }

        var cancelLink = $('<a>').attr({href: '#'}).append('Cancel').click(function(){chess.confirmMoveDialogView.cancelMove(); return false;});
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
    confirmMove: function (args) {
        this.$el.modal('hide');
        var notation = args['notation'];
        var pieceId = args['pieceId'];
        var toRow = args['toRow'] * 1;
        var toCol = args['toCol'] * 1;
        chess.controller.updateGameWithLatestMove(notation, pieceId, toRow, toCol);
    },

    /*
    * Called from the confirm dialog
    */
    cancelMove: function () {
        this.$el.modal('hide');
        chess.controller.cancelMove();
    }

});

chess.confirmMoveDialogView = new chess.ConfirmMoveDialogView();
