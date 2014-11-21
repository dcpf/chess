/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

var PlayerInfoView = View.extend({

    initialize: function () {
        
        // set the passed-in options
        this.parent = this.options.parent;
        this.gameState = this.options.gameState;

        var data = {
            whiteEmail: this.gameState.getWhiteEmail(),
            blackEmail: this.gameState.getBlackEmail()
        };
        this.initTemplate('playerInfo', data);

    }

});
