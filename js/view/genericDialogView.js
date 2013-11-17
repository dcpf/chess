/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

/*
* View controller for rendering misc dialogs
*/
chess.GenericDialogView = Backbone.View.extend({

    el: '#genericDialog',

    initialize: function () {
        this.eventHandler = this.options.eventHandler;
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.error, this._renderErrorDialog);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.gameCreated, this._renderGameCreatedDialog);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.moveSaved, this._renderMoveSavedDialog);
    },

    _renderErrorDialog: function (error) {
        this.$('.genericDialogText').html(error.msg);
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
