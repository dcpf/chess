/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

var PlayGameView = Backbone.View.extend({

    el: '#playGameView',

    render: function () {
        this.$el.show();
    },
    
    hide: function () {
        this.$el.hide();
    }

});
