/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

/*
* The only real purpose of this class is to be able to save a move to the server. To use, create a new object and then call save:
*
* var move = new chess.Move({gameID: chess.vars.gameID, move: notation});
* move.save();
*
*/
chess.Move = Backbone.Model.extend({

    baseUrl: '/save/',

    initialize: function () {
        this.url = this.baseUrl + this.gameID + '/' + this.move;
    }

});
