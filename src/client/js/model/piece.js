/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.Piece = Backbone.Model.extend({

    initialize: function () {
        if (!this.id) {
            return null;
        }
        var array = this.id.split('');
        if (!array || array.length !== 4 || (array[0] !== 'W' && array[0] !== 'B')) {
            return null;
        }

        this.color = array[0];
        this.type = array[1];
        this.row = parseInt(array[2], 10);
        this.column = parseInt(array[3], 10);
        this.qualifiedName = this.color + this.type;
    },

    isBlack: function () {
        return this.color === 'B';
    },

    isWhite: function () {
        return this.color === 'W';
    },

    isPawn: function () {
        return this.type === 'P';
    },

    isRook: function () {
        return this.type === 'R';
    },

    isKnight: function () {
        return this.type === 'N';
    },

    isBishop: function () {
        return this.type === 'B';
    },

    isKing: function () {
        return this.type === 'K';
    },

    isQueen: function () {
        return this.type === 'Q';
    }

});