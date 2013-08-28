/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.notationConverter = {

	/*
    * Converts the move notation string to coords. Note that the return type is an array to handle a castle move, where both the rook and king need to move.
    * Normally, the array will contain one set of coords, but for a castle move, it needs to contain two sets of coords: one for the rook, and one for the king.
    *
    * @param move notation
    * @param 0-based index of the move in the moveHistory collection
    * @return array of coords
    */
    convertNotationToCoords: function (board, notation, index) {

        // get the color
        var color = (index == 0 || index % 2 == 0) ? 'W' : 'B';

        // If this is castle move, figure out the coords for king-side or queen-side castle for either white or black.
        if (notation.indexOf('O-O') == 0) {

            // get the move coords
            var rookCoords, kingCoords;
            if (notation === 'O-O') {
                // king-side castle
                if (color === 'W') {
                    rookCoords = {fromRow: 7, fromCol: 7, toRow: 7, toCol: 5};
                    kingCoords = {fromRow: 7, fromCol: 4, toRow: 7, toCol: 6};
                } else {
                    rookCoords = {fromRow: 0, fromCol: 7, toRow: 0, toCol: 5};
                    kingCoords = {fromRow: 0, fromCol: 4, toRow: 0, toCol: 6};
                }
            } else if (notation === 'O-O-O') {
                // queen-side castle
                if (color === 'W') {
                    rookCoords = {fromRow: 7, fromCol: 0, toRow: 7, toCol: 3};
                    kingCoords = {fromRow: 7, fromCol: 4, toRow: 7, toCol: 2};
                } else {
                    rookCoords = {fromRow: 0, fromCol: 0, toRow: 0, toCol: 3};
                    kingCoords = {fromRow: 0, fromCol: 4, toRow: 0, toCol: 2};
                }
            }
            rookCoords.color = color;
            rookCoords.type = 'R';
            kingCoords.color = color;
            kingCoords.type = 'K';
            return [rookCoords, kingCoords];
        }

        // If it's not a castle move, figure out the coords by parsing the move notation string.
        var type = notation.substr(0, 1);
        var fromCol = notation.substr(1, 1);
        var fromRow = notation.substr(2, 1);
        var toCol = notation.substr(4, 1);
        var toRow = notation.substr(5, 1);
        for (var i in board.letters) {
            var letter = board.letters[i];
            if (letter == fromCol) {
                fromCol = i;
                break;
            }
        }
        for (var i in board.letters) {
            var letter = board.letters[i];
            if (letter == toCol) {
                toCol = i;
                break;
            }
        }
        for (var i in board.rowNums) {
            var rowNum = board.rowNums[i];
            if (rowNum == fromRow) {
                fromRow = i;
                break;
            }
        }
        for (var i in board.rowNums) {
            var rowNum = board.rowNums[i];
            if (rowNum == toRow) {
                toRow = i;
                break;
            }
        }
        var coords = {color: color, type: type, fromRow: fromRow, fromCol: fromCol, toRow: toRow, toCol: toCol};
        return [coords];

    }

};
