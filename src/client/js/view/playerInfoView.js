/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

var PlayerInfoView = Backbone.View.extend({

    initialize: function () {
        
        // set the passed-in options
        var parent = this.options.parent;
        this.gameState = this.options.gameState;

        // Create and attach the template
        var template = _.template($('#playerInfoTemplate').html());
        this.$el.html(template());
        parent.append(this.$el);
        
        this._render();

    },

    _render: function () {
        this.$('#whiteEmail').html(this.gameState.getWhiteEmail());
        this.$('#blackEmail').html(this.gameState.getBlackEmail());
    }

});
