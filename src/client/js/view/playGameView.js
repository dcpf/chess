/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.PlayGameView = Backbone.View.extend({

    el: '#playGameView',

    initialize: function () {

		this.eventHandler = this.options.eventHandler;

		// set up the listeners
		this.listenTo(this.eventHandler, this.eventHandler.messageNames.GAME_ENTERED, this.show);

    },

    show: function () {
        this.$('#whiteEmail').html(chess.vars.whiteEmail);
        this.$('#blackEmail').html(chess.vars.blackEmail);
        this.$el.show();
    }

});
