/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

var OpponentHasMovedDialogView = View.extend({

    initialize: function () {

        var self = this;

        // set the passed-in options
        // set the passed-in options
        this.eventHandler = this.options.eventHandler;

        this.initDialog('opponentHasMovedDialog');

        this.listenTo(this.eventHandler, this.eventHandler.messageNames.OPPONENT_HAS_MOVED, this._renderDialog);

        this.$('#updateBoardWithOpponentsMoveLink').click(function(event){
            event.preventDefault();
            // passing in null for the gameID will use the gameID for the current game
            self.eventHandler.trigger(self.eventHandler.messageNames.ENTER_GAME, null, false);
            self.$el.modal('hide');
        });

        this.$('#dontUpdateBoardWithOpponentsMoveLink').click(function(event){
            event.preventDefault();
            self.$el.modal('hide');
        });

    },

    _renderDialog: function (obj) {
        this.$('#move').html(obj.move);
        this.$el.modal();
    }

});
