/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

/*
* View controller for rendering misc dialogs
*/
const GenericDialogView = View.extend({

    initialize: function () {
        
        // set the passed-in options
        this.eventHandler = this.options.eventHandler;
        
        this.initDialog('genericDialog');
        
        // set up the listeners
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.ERROR, this._renderErrorDialog);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.GAME_CREATED, this._renderGameCreatedDialog);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.MOVE_SAVED, this._renderMoveSavedDialog);
        
    },

    _renderErrorDialog: function (msg) {
        this.$('.genericDialogText').html(msg);
        this.$el.modal();
    },

    _renderGameCreatedDialog: function () {
        this.$('.genericDialogText').html('Your game has begun - make your first move!');
        this.$el.modal();
    },

    _renderMoveSavedDialog: function (obj) {
        this.$('.genericDialogText').html('Your move has been saved, and an email has been sent to your opponent at: ' + obj.opponentEmail);
        this.$el.modal();
    }

});
