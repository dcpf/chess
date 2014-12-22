/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

var ConfirmMoveDialogView = View.extend({

    initialize: function () {
        
        // set the passed-in options
        this.eventHandler = this.options.eventHandler;
        
        this.initDialog('confirmMoveDialog');
        
        // set up the listeners
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.RENDER_CONFIRM_MOVE_DIALOG, this._render);
    },

    _render: function (moveNotations) {

        var self = this;
        var possibleMoves = [];
        var i;

        for (i in moveNotations) {
            var notation = moveNotations[i];
            var moveLink = $('<a>').attr({href: '#'}).append(notation).click(self._generateConfirmMoveClickHandlerFunction(notation));
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
    * Generate the click handler function for a link in the 'confirm move' dialog 
    */
    _generateConfirmMoveClickHandlerFunction: function (notation) {
        var self = this;
        return function () {
            self._confirmMove(notation);
            return false;
        };
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
