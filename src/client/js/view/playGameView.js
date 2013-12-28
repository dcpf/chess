/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.PlayGameView = Backbone.View.extend({

    el: '#playGameView',

    show: function (whiteEmail, blackEmail) {
        this.$('#whiteEmail').html(whiteEmail);
        this.$('#blackEmail').html(blackEmail);
        this.$el.show();
    }

});
