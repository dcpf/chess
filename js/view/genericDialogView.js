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
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.gameCreated, this._renderGameCreatedDialog);
    },

    _renderGameCreatedDialog: function (obj) {
        this.$('.genericDialogText').html('Your game has begun - make your first move!');
        this.$el.modal();

    }

});
