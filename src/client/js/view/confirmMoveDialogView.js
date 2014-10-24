/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var ConfirmMoveDialogView = Backbone.View.extend({

    initialize: function () {
        
        // set the passed-in options
        this.parent = this.options.parent;
        this.eventHandler = this.options.eventHandler;
        
        // Create and attach the template
        var template = _.template($('#confirmMoveDialogTemplate').html());
        this.$el.html(template());
        this.parent.empty();
        this.parent.append(this.$el);
        
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
        this.parent.modal();

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
        this.parent.modal('hide');
        this.eventHandler.trigger(this.eventHandler.messageNames.MOVE_CONFIRMED, notation);
    },

    /*
    * Called from the confirm dialog
    */
    _cancelMove: function () {
        this.parent.modal('hide');
        this.eventHandler.trigger(this.eventHandler.messageNames.CANCEL_MOVE);
    }

});
