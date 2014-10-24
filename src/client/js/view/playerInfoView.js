/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

var PlayerInfoView = View.extend({

    initialize: function () {
        
        // set the passed-in options
        this.parent = this.options.parent;
        this.gameState = this.options.gameState;

        this.initTemplate('playerInfoTemplate');
        
        this._render();

    },

    _render: function () {
        this.$('#whiteEmail').html(this.gameState.getWhiteEmail());
        this.$('#blackEmail').html(this.gameState.getBlackEmail());
    }

});
