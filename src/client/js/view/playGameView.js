/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var PlayGameView = Backbone.View.extend({

    el: '#playGameView',

    initialize: function () {
        this.gameState = this.options.gameState;
    },

    render: function () {
        this.$('#whiteEmail').html(this.gameState.getWhiteEmail());
        this.$('#blackEmail').html(this.gameState.getBlackEmail());
        this.$('#optionsMenuContainer').show();
        this.$el.show();
    },
    
    hide: function () {
        this.$('#whiteEmail').html('');
        this.$('#blackEmail').html('');
        this.$('#optionsMenuContainer').hide();
        this.$el.hide();
    }

});
