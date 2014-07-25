/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var ConfirmMoveDialogView = Backbone.View.extend({

    el: '#confirmMoveDialog',

    initialize: function () {
        this.eventHandler = this.options.eventHandler;
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.RENDER_CONFIRM_MOVE_DIALOG, this._render);
    },

    _render: function (moveNotations) {

        var self = this;
        var possibleMoves = [];
        var i;

        for (i in moveNotations) {
            var moveNotation = moveNotations[i];
            var moveLink = $('<a>').attr({href: '#'}).append(moveNotation).click(function(){self._confirmMove(moveNotation); return false;});
            possibleMoves.push(moveLink);
        }

        var cancelLink = $('<a>').attr({href: '#'}).append('Cancel').click(function(){self._cancelMove(); return false;});
        possibleMoves.push(cancelLink);
        var ul = $('<ul>');
        for (i in possibleMoves) {
            $(ul).append($('<li>').append(possibleMoves[i]));
        }

        // Render the dialog
        this.$('#possibleMoves').html(ul);
        this.$el.modal();

    },

    /*
    * Called from the confirm dialog
    */
    _confirmMove: function (notation) {
        this.$el.modal('hide');
        this.eventHandler.trigger(this.eventHandler.messageNames.MOVE_CONFIRMED, notation);
    },

    /*
    * Called from the confirm dialog
    */
    _cancelMove: function () {
        this.$el.modal('hide');
        this.eventHandler.trigger(this.eventHandler.messageNames.CANCEL_MOVE);
    }

});
