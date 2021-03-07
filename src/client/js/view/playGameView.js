/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

const PlayGameView = Backbone.View.extend({

    initialize: function () {
        this.parent = this.options.parent;
    },

    render: function () {
        this.parent.show();
    },
    
    hide: function () {
        this.parent.hide();
    }

});
