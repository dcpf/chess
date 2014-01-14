/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

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
    * Normally, the array will contain one move, but for a castle move, it will contain two moves: one for the rook, and one for the king.
    *
    * @param move notation
    * @param currentPlayer (W or B)
    * @returns an object with the piece, toRow, and toCol
    */
    this.convertNotation = function (notation, currentPlayer) {

        // If this is castle move, figure out the coords for king-side or queen-side castle for either white or black.
        if (notation.indexOf('O-O') === 0) {

            // get the moves
            var rook, king, rookMove, kingMove;
            if (notation === 'O-O') {
                // king-side castle
                if (currentPlayer === 'W') {
                    rook = new chess.Piece({id: currentPlayer + 'R77'});
                    king = new chess.Piece({id: currentPlayer + 'K74'});
                    rookMove = {piece: rook, toRow: 7, toCol: 5};
                    kingMove = {piece: king, toRow: 7, toCol: 6};
                } else {
                    rook = new chess.Piece({id: currentPlayer + 'R07'});
                    king = new chess.Piece({id: currentPlayer + 'K04'});
                    rookMove = {piece: rook, toRow: 0, toCol: 5};
                    kingMove = {piece: king, toRow: 0, toCol: 6};
                }
            } else if (notation === 'O-O-O') {
                // queen-side castle
                if (currentPlayer === 'W') {
                    rook = new chess.Piece({id: currentPlayer + 'R70'});
                    king = new chess.Piece({id: currentPlayer + 'K74'});
                    rookMove = {piece: rook, toRow: 7, toCol: 3};
                    kingMove = {piece: king, toRow: 7, toCol: 2};
                } else {
                    rook = new chess.Piece({id: currentPlayer + 'R00'});
                    king = new chess.Piece({id: currentPlayer + 'K04'});
                    rookMove = {piece: rook, toRow: 0, toCol: 3};
                    kingMove = {piece: king, toRow: 0, toCol: 2};
                }
            }
            return [rookMove, kingMove];
        }

        // If it's not a castle move, figure out the coords by parsing the move notation string.
        var pieceType = notation.substr(0, 1);
        var fromCol = notation.substr(1, 1);
        var fromRow = notation.substr(2, 1);
        var toCol = notation.substr(4, 1);
        var toRow = notation.substr(5, 1);
        var enPassantCapture = (notation.indexOf('e.p.') > 0);
        var i, letter, rowNum, enPassantCaptureCoords;
        for (i in this.letters) {
            letter = this.letters[i];
            if (letter == fromCol) {
                fromCol = i;
                break;
            }
        }
        for (i in this.letters) {
            letter = this.letters[i];
            if (letter == toCol) {
                toCol = i;
                break;
            }
        }
        for (i in this.rowNums) {
            rowNum = this.rowNums[i];
            if (rowNum == fromRow) {
                fromRow = i;
                break;
            }
        }
        for (i in this.rowNums) {
            rowNum = this.rowNums[i];
            if (rowNum == toRow) {
                toRow = i;
                break;
            }
        }

        // make sure these are numbers
        toRow = parseInt(toRow, 10);
        toCol = parseInt(toCol, 10);

        // If this move is an enPassant capture, get the coords of the captured piece.
        if (enPassantCapture) {
            enPassantCaptureCoords = {
                row: (currentPlayer === 'W') ? toRow + 1 : toRow - 1,
                col: toCol
            };
        }

        var piece = new chess.Piece({id: currentPlayer + pieceType + fromRow + fromCol});
        var move = {piece: piece, toRow: toRow, toCol: toCol, enPassantCaptureCoords: enPassantCaptureCoords};
        return [move];

    };
};
