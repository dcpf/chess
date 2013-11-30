/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.NotationConverter = function () {

    this.letters = ['a','b','c','d','e','f','g','h'];
    this.rowNums = [8,7,6,5,4,3,2,1];

    /*
    * Given col and row coords, return the notation equivalent
    */
    this.getNotation = function (col, row) {
        return this.letters[col] + this.rowNums[row];
    };

	/*
    * Converts the move notation string to a piece, and toRow and toCol. Note that the return type is an array to handle a castle move, where both the rook and king need to move.
    * Normally, the array will contain one move, but for a castle move, it needs to contain two moves: one for the rook, and one for the king.
    *
    * @param move notation
    * @param 0-based index of the move in the moveHistory collection
    * @returns an object with the piece, toRow, and toCol
    */
    this.convertNotation = function (notation, index) {

        // get the color
        var color = (index == 0 || index % 2 == 0) ? 'W' : 'B';

        // If this is castle move, figure out the coords for king-side or queen-side castle for either white or black.
        if (notation.indexOf('O-O') == 0) {

            // get the moves
            var rook, king, rookMove, kingMove;
            if (notation === 'O-O') {
                // king-side castle
                if (color === 'W') {
                	rook = new chess.Piece({id: color + 'R77'});
                	king = new chess.Piece({id: color + 'K74'});
                	rookMove = {piece: rook, toRow: 7, toCol: 5};
                	kingMove = {piece: king, toRow: 7, toCol: 6};
                } else {
                	rook = new chess.Piece({id: color + 'R07'});
                	king = new chess.Piece({id: color + 'K04'});
                	rookMove = {piece: rook, toRow: 0, toCol: 5};
                	kingMove = {piece: king, toRow: 0, toCol: 6};
                }
            } else if (notation === 'O-O-O') {
                // queen-side castle
                if (color === 'W') {
                	rook = new chess.Piece({id: color + 'R70'});
                	king = new chess.Piece({id: color + 'K74'});
                	rookMove = {piece: rook, toRow: 7, toCol: 3};
                	kingMove = {piece: king, toRow: 7, toCol: 2};
                } else {
                	rook = new chess.Piece({id: color + 'R00'});
                	king = new chess.Piece({id: color + 'K04'});
                	rookMove = {piece: rook, toRow: 0, toCol: 3};
                	kingMove = {piece: king, toRow: 0, toCol: 2};
                }
            }
            return [rookMove, kingMove];
        }

        // If it's not a castle move, figure out the coords by parsing the move notation string.
        var type = notation.substr(0, 1);
        var fromCol = notation.substr(1, 1);
        var fromRow = notation.substr(2, 1);
        var toCol = notation.substr(4, 1);
        var toRow = notation.substr(5, 1);
        for (var i in this.letters) {
            var letter = this.letters[i];
            if (letter == fromCol) {
                fromCol = i;
                break;
            }
        }
        for (var i in this.letters) {
            var letter = this.letters[i];
            if (letter == toCol) {
                toCol = i;
                break;
            }
        }
        for (var i in this.rowNums) {
            var rowNum = this.rowNums[i];
            if (rowNum == fromRow) {
                fromRow = i;
                break;
            }
        }
        for (var i in this.rowNums) {
            var rowNum = this.rowNums[i];
            if (rowNum == toRow) {
                toRow = i;
                break;
            }
        }
        var piece = new chess.Piece({id: color + type + fromRow + fromCol});
        var move = {piece: piece, toRow: toRow, toCol: toCol};
        return [move];

    };
};
