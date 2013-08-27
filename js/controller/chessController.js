/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

/*
* Main controller for the chess game. Plays the middle man between the model and views.
* Plain JS object as opposed to a Backbone object.
*/
chess.controller = {

    doMove: function (pieceId, toRow, toCol) {

        var piece = new chess.Piece({id: pieceId});
        var pieceType = piece.type;
        var fromRow = piece.row;
        var fromCol = piece.column;

        // If there's a captured piece, put it in limbo awaiting confirmation from the player
        var x = ' ';
        var ep = '';
        var capturedPiece = chess.board.getPieceByCoords(toRow, toCol);
        if (capturedPiece) {
            // Put the captured piece in limbo
            chess.board.limbo = capturedPiece;
            // Remove it from the board
            chess.boardView.removePiece(capturedPiece);
            // Set the x variable for the capture notation
            x = 'x';
        } else if (piece.isPawn()) {
            // If this is an en-passant capture, set the x and ep variables for the capture notation
            var enPassantCapturablePiece = chess.board.enPassantCapture['' + toRow + toCol];
            if (enPassantCapturablePiece) {
                x = 'x';
                ep = ' e.p.';
            }
        }

        // Build the notation string
        var possibleMoves = [];
        var notation = pieceType + chess.board.letters[fromCol] + chess.board.rowNums[fromRow] + x + chess.board.letters[toCol] + chess.board.rowNums[toRow] + ep;
        possibleMoves.push({notation: notation, pieceId: pieceId, toRow: toRow, toCol: toCol});

        // See if this is a possible castle move
        if (piece.isRook() && !chess.board.rookAndKingMoves[piece.id]) {
            // Get the base row for the color: W = 7; B = 0
            var baseRow = (piece.isWhite()) ? 7 : 0;
            var origKingId = piece.color + 'K' + baseRow + '4';
            // If the king has not moved yet, and the rook is moving on the base row from either squares 7 - 5 or 0 - 3, this is a possible castle move
            if (!chess.board.rookAndKingMoves[origKingId] && fromRow == baseRow && toRow == baseRow) {
                var castleNotation;
                if (fromCol == 7 && toCol == 5) {
                    castleNotation = 'O-O';
                } else if (fromCol == 0 && toCol == 3) {
                    castleNotation = 'O-O-O';
                }
                if (castleNotation) {
                    possibleMoves.push({notation: castleNotation, pieceId: pieceId, toRow: toRow, toCol: toCol});
                }
            }
        }

        // Move the piece to the new location on the board
        chess.boardView.movePiece(pieceId, toRow, toCol);

        chess.boardView.hideLegalMoves();

        // Render the confirm dialog
        chess.confirmMoveDialogView.render(possibleMoves);

    },

    /**
    * Called when the user has cancelled their move via the confirm dialog.
    */
    cancelMove: function () {
         // Revert the board to the position that's still in the boardArray
        chess.boardView.updateBoard();
        // Remove the piece from limbo
        chess.board.limbo = null;
    },

    /**
    * Called when the user has confirmed their move via the confirm dialog.  Does the following:
    * Updates the board
    * Updates the boardArray
    * Updates captured pieces
    * Switches the player
    * Finds all legal moves
    */
    updateGameWithLatestMove: function (notation, pieceId, toRow, toCol) {

        // Update the boardArray with the new piece location
        var piece = new chess.Piece({id: pieceId});
        var fromRow = piece.row;
        var fromCol = piece.column;
        chess.board.boardArray[fromRow][fromCol] = ''; // Blank out the previous location
        chess.board.boardArray[toRow][toCol] = piece.qualifiedName; // Populate the new location
        // Variable to track if a piece was captured
        var capturedPiece;

        // If this is a pawn move, and it's capturing en-passant, remove the captured piece from the boardArray
        if (piece.isPawn()) {
            var enPassantCapturedPiece = chess.board.enPassantCapture['' + toRow + toCol];
            if (enPassantCapturedPiece) {
                capturedPiece = enPassantCapturedPiece;
                chess.capturedPieces.add(enPassantCapturedPiece);
                // Remove it from the boardArray
                chess.board.boardArray[enPassantCapturedPiece.row][enPassantCapturedPiece.column] = '';
            }
        }

        // Clear en-passant capturable square marked from the previous move
        chess.board.enPassantCapture = {};

        // If this is a castle move, move the king as well
        if (notation === 'O-O' || notation === 'O-O-O') {
            var newCol = (notation === 'O-O') ? 6 : 2;
            chess.board.boardArray[fromRow][4] = ''; // Blank out the orig king square
            chess.board.boardArray[fromRow][newCol] = piece.color + 'K'; // Put the king in the new location
            chess.board.rookAndKingMoves[piece.color + 'K' + fromRow + '4'] = 1; // Update the rookAndKingMoves map
        }

        // If this is a pawn move, and the pawn has moved from either row 6 to row 4 (white) or from row 1 to row 3 (black),
        // check to see if there's a pawn on an adjacent square that can capture it en-passant in the next move.
        if (piece.isPawn() && ((fromRow == 6 && toRow == 4) || (fromRow == 1 && toRow == 3))) {
            var rightPiece = chess.board.getPieceByCoords(toRow, toCol + 1);
            var leftPiece = chess.board.getPieceByCoords(toRow, toCol - 1);
            if ((rightPiece && rightPiece.isPawn()) || (leftPiece && leftPiece.isPawn())) {
                // Set the en-passant capturable coords
                var enPassantCaptureCoords = '' + ((fromRow + toRow)/2) + toCol;
                chess.board.enPassantCapture[enPassantCaptureCoords] = new chess.Piece({id: piece.qualifiedName + toRow + toCol});
            }
        }

        // If there's a piece in limbo, add it to the capturedPieces collection
        var purgedPiece = chess.board.limbo;
        if (purgedPiece) {
            capturedPiece = purgedPiece;
            chess.capturedPieces.add(purgedPiece);
            chess.board.limbo = null;
        }

        // Track rook or king moves, so we can determine castling possibilies
        if (piece.isRook() || piece.isKing()) {
            chess.board.rookAndKingMoves[pieceId] = 1;
        }

        // Switch player
        chess.board.currentPlayer = (chess.board.currentPlayer === 'W') ? 'B' : 'W';

        // Update the legal moves
        chess.board.findAllLegalMoves();

        // Update the board view
        chess.boardView.updateBoard();

        // Add the move to the 'moveHistory' collection
        chess.moveHistory.add({notation: notation, capturedPiece: capturedPiece});

    }

};

function log (msg) {
    console.log(msg);
}

chess.board.findAllLegalMoves();
chess.boardView.render();
