/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

/*
* View controller for rendering misc dialogs
*/
var GenericDialogView = View.extend({

    initialize: function () {
        
        // set the passed-in options
        this.parent = this.options.parent;
        this.eventHandler = this.options.eventHandler;
        
        this.initTemplate('genericDialog');
        
        // set up the listeners
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.ERROR, this._renderErrorDialog);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.GAME_CREATED, this._renderGameCreatedDialog);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.MOVE_SAVED, this._renderMoveSavedDialog);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.OPPONENT_HAS_MOVED, this._renderOpponentHasMovedDialog);
        
    },

    _renderErrorDialog: function (msg) {
        this.$('.genericDialogText').html(msg);
        this.parent.modal();
    },

    _renderGameCreatedDialog: function () {
        this.$('.genericDialogText').html('Your game has begun - make your first move!');
        this.parent.modal();
    },

    _renderMoveSavedDialog: function (obj) {
        this.$('.genericDialogText').html('Your move has been saved, and an email has been sent to your opponent at: ' + obj.opponentEmail);
        this.parent.modal();
    },

    _renderOpponentHasMovedDialog: function (obj) {
        this.$('.genericDialogText').html('<p>Your opponent has made the following move:</p><p><b>' + obj.move + '</b></p><p>Close this dialog to make your move.</p>');
        this.parent.modal();
    },

});
