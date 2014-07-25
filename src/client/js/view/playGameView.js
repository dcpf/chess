/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var PlayGameView = Backbone.View.extend({

    el: '#playGameView',

    initialize: function () {

		this.eventHandler = this.options.eventHandler;

		// set up the listeners
		this.listenTo(this.eventHandler, this.eventHandler.messageNames.GAME_ENTERED, this.show);

    },

    show: function () {
        this.$('#whiteEmail').html(chessAttrs.vars.whiteEmail);
        this.$('#blackEmail').html(chessAttrs.vars.blackEmail);
        this.$('#optionsMenuContainer').show();
        this.$el.show();
    }

});
