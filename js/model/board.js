/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

/*
* Represents the board, piece positions, and all logic regarding chess rules, legal moves, etc.
*/
chess.Board = Backbone.Model.extend({

    initialize: function (attrs) {

        if (attrs) {
            this.eventHandler = attrs.eventHandler;
        }

        // start with the default player of white and the default game board
        this.currentPlayer = 'W';
        this.boardArray = [
            ['BR','BN','BB','BQ','BK','BB','BN','BR'],
            ['BP','BP','BP','BP','BP','BP','BP','BP'],
            ['','','','','','','',''],
            ['','','','','','','',''],
            ['','','','','','','',''],
            ['','','','','','','',''],
            ['WP','WP','WP','WP','WP','WP','WP','WP'],
            ['WR','WN','WB','WQ','WK','WB','WN','WR']
        ];
        // map of all legal moves
        this.legalMovesMap = {};
        // temporary holding place for a captured piece, while we await the user's response to the 'are you sure' dialog
        this.limbo = null;
        // temporary holding place for a piece that's capturable via en-passant
        this.enPassantCapture = {};
        // map for tracking rook and king moves to determine if castling is possible
        this.rookAndKingMoves = {};
        // allows us to examine the board in a hypothetical situation
        this._hypothetical = false;

    },

    getPieceByCoords: function (row, col) {
        var piece = null;
        var contents = this.boardArray[row][col];
        if (contents) {
            piece = new chess.Piece({id: contents + row + col});
        }
        return piece;
    },

    isLegalMove: function (pieceId, coords) {
        var legalMoves = this.legalMovesMap[pieceId];
        for (var i in legalMoves) {
            if (legalMoves[i] === coords) {
                return true;
            }
        }
        return false;
    },

    /*
    * Populate the legalMovesMap with all legal moves.
    * Publish an 'updatedLegalMoves' message when completed.
    */
    findAllLegalMoves: function () {
        this.legalMovesMap = {}; // Reset the legal moves map
        for (var row in this.boardArray) {
            var cols = this.boardArray[row];
            for (var col in cols) {
                var piece = this.getPieceByCoords(row, col);
                if (piece) {
                    // Get all of the legal moves for this piece
                    this._getLegalMoves(piece);
                }
            }
        }
        if (!this._hypothetical) {
            // only publish if not in hypothetical mode
            this.eventHandler.trigger(this.eventHandler.messageNames.updatedLegalMoves);
        }
    },

    /*
    * If there are no legal moves and the king is NOT in check, it's stalemate!
    */
    isStalemate: function () {
        for (var prop in this.legalMovesMap) {
            if (this.legalMovesMap.hasOwnProperty(prop)) {
                return false;
            }
        }
        return !this._isKingInCheck();
    },

    /*
    * If there are no legal moves and the king is in check, it's checkmate!
    */
    isCheckmate: function () {
        for (var prop in this.legalMovesMap) {
            if (this.legalMovesMap.hasOwnProperty(prop)) {
                return false;
            }
        }
        return this._isKingInCheck();
    },

    _getLegalMoves: function (piece) {
        if (piece.color === this.currentPlayer) {
            if (piece.isRook()) {
                this._getLegalMovesRight(piece);
                this._getLegalMovesLeft(piece);
                this._getLegalMovesUp(piece);
                this._getLegalMovesDown(piece);
            } else if (piece.isBishop()) {
                this._getLegalMovesDiagUpRight(piece);
                this._getLegalMovesDiagDownRight(piece);
                this._getLegalMovesDiagDownLeft(piece);
                this._getLegalMovesDiagUpLeft(piece);
            } else if (piece.isQueen()) {
                this._getLegalMovesRight(piece);
                this._getLegalMovesLeft(piece);
                this._getLegalMovesUp(piece);
                this._getLegalMovesDown(piece);
                this._getLegalMovesDiagUpRight(piece);
                this._getLegalMovesDiagDownRight(piece);
                this._getLegalMovesDiagDownLeft(piece);
                this._getLegalMovesDiagUpLeft(piece);
            } else if (piece.isKing()) {
                this._getLegalMovesRight(piece, true);
                this._getLegalMovesLeft(piece, true);
                this._getLegalMovesUp(piece, true);
                this._getLegalMovesDown(piece, true);
                this._getLegalMovesDiagUpRight(piece, true);
                this._getLegalMovesDiagDownRight(piece, true);
                this._getLegalMovesDiagDownLeft(piece, true);
                this._getLegalMovesDiagUpLeft(piece, true);
            } else if (piece.isKnight()) {
                this._getLegalKnightMoves(piece);
            } else if (piece.isPawn()) {
                this._getLegalPawnMoves(piece);
            }
        }
    },

    _getLegalMovesRight: function (piece, singleSpace) {
        var row = piece.row;
        var col = piece.column;
        for (col++; col <= 7; col++) {
            var doBreak = this._evaluateMove(piece, row, col);
            if (doBreak || singleSpace) {
                break;
            }
        }
    },

    _getLegalMovesLeft: function (piece, singleSpace) {
        var row = piece.row;
        var col = piece.column;
        for (col--; col >= 0; col--) {
            var doBreak = this._evaluateMove(piece, row, col);
            if (doBreak || singleSpace) {
                break;
            }
        }
    },

    _getLegalMovesUp: function (piece, singleSpace) {
        var row = piece.row;
        var col = piece.column;
        for (row--; row >= 0; row--) {
            var doBreak = this._evaluateMove(piece, row, col);
            if (doBreak || singleSpace) {
                break;
            }
        }
    },

    _getLegalMovesDown: function (piece, singleSpace) {
        var row = piece.row;
        var col = piece.column;
        for (row++; row <= 7; row++) {
            var doBreak = this._evaluateMove(piece, row, col);
            if (doBreak || singleSpace) {
                break;
            }
        }
    },

    _getLegalMovesDiagUpRight: function (piece, singleSpace) {
        var row = piece.row;
        var col = piece.column;
        for (col++, row--; col <= 7 && row >= 0; col++, row--) {
            var doBreak = this._evaluateMove(piece, row, col);
            if (doBreak || singleSpace) {
                break;
            }
        }
    },

    _getLegalMovesDiagDownRight: function (piece, singleSpace) {
        var row = piece.row;
        var col = piece.column;
        for (col++, row++; col <= 7 && row <= 7; col++, row++) {
            var doBreak = this._evaluateMove(piece, row, col);
            if (doBreak || singleSpace) {
                break;
            }
        }
    },

    _getLegalMovesDiagDownLeft: function (piece, singleSpace) {
        var row = piece.row;
        var col = piece.column;
        for (col--, row++; col >= 0 && row <= 7; col--, row++) {
            var doBreak = this._evaluateMove(piece, row, col);
            if (doBreak || singleSpace) {
                break;
            }
        }
    },

    _getLegalMovesDiagUpLeft: function (piece, singleSpace) {
        var row = piece.row;
        var col = piece.column;
        for (col--, row--; col >= 0 && row >= 0; col--, row--) {
            var doBreak = this._evaluateMove(piece, row, col);
            if (doBreak || singleSpace) {
                break;
            }
        }
    },

    _getLegalKnightMoves: function (piece) {
        var row = piece.row;
        var col = piece.column;
        this._evaluateMove(piece, row + 1, col + 2);
        this._evaluateMove(piece, row + 1, col - 2);
        this._evaluateMove(piece, row + 2, col + 1);
        this._evaluateMove(piece, row + 2, col - 1);
        this._evaluateMove(piece, row - 1, col + 2);
        this._evaluateMove(piece, row - 1, col - 2);
        this._evaluateMove(piece, row - 2, col + 1);
        this._evaluateMove(piece, row - 2, col - 1);
    },

    _getLegalPawnMoves: function (piece) {
        var row = piece.row;
        var col = piece.column;
        if (this.currentPlayer === 'W') {
            var otherPiece = this.boardArray[row - 1][col];
            if (!otherPiece) {
                this._updateLegalMovesMap(piece, row - 1, col);
                if (row == 6) {
                    otherPiece = this.boardArray[row - 2][col];
                    if (!otherPiece) {
                        this._updateLegalMovesMap(piece, row - 2, col);
                    }
                }
            }
            this._evaluatePawnCapture(piece, row - 1, col - 1);
            this._evaluatePawnCapture(piece, row - 1, col + 1);
        } else {
            var otherPiece = this.boardArray[row + 1][col];
            if (!otherPiece) {
                this._updateLegalMovesMap(piece, row + 1, col);
                if (row == 1) {
                    otherPiece = this.boardArray[row + 2][col];
                    if (!otherPiece) {
                        this._updateLegalMovesMap(piece, row + 2, col);
                    }
                }
            }
            this._evaluatePawnCapture(piece, row + 1, col - 1);
            this._evaluatePawnCapture(piece, row + 1, col + 1);
        }
    },

    /**
    * Evaluates if a move is legal or not. If it's legal, update the legalMovesMap. If the square is occupied,
    * return true, telling the caller to stop looking for more legal moves in this direction.
    */
    _evaluateMove: function (piece, toRow, toCol) {
        if (this._isOutOfBounds(toRow, toCol)) {
            return false;
        }
        var otherPiece = this.getPieceByCoords(toRow, toCol);
        if (otherPiece) {
            if (otherPiece.color !== this.currentPlayer) {
                // capture - add move to map
                this._updateLegalMovesMap(piece, toRow, toCol);
                return true;
            } else {
                // same color piece - illegal move
                return true;
            }
        }
        // empty space - add move to map
        this._updateLegalMovesMap(piece, toRow, toCol);
        return false;
    },

    _evaluatePawnCapture: function (piece, toRow, toCol) {
        if (!this._isOutOfBounds(toRow, toCol)) {
            var otherPiece = this.getPieceByCoords(toRow, toCol);
            if (!otherPiece) {
                // If we didn't find a piece in the capturable spot, see if there's a potential en-passant capture there
                var enPassantCapturePiece = this.enPassantCapture['' + toRow + toCol];
                if (enPassantCapturePiece) {
                    otherPiece = enPassantCapturePiece;
                }
            }
            if (otherPiece) {
                if (otherPiece.color !== this.currentPlayer) {
                    // valid capture - add move to map
                    this._updateLegalMovesMap(piece, toRow, toCol);
                }
            }
        }
    },

    /**
    * Update the legalMovesMap, but only if either:
    *
    * 1) We are in hypothetical mode
    *   or
    * 2) The king will not be in check after the move
    * 
    */
    _updateLegalMovesMap: function (piece, toRow, toCol) {
        if (this._hypothetical || !this._isKingInCheck(piece, toRow, toCol)) {
            var id = piece.id;
            var legalMoves = this.legalMovesMap[id];
            if (!legalMoves) {
                legalMoves = [];
            }
            legalMoves.push('' + toRow + toCol);
            this.legalMovesMap[id] = legalMoves;
        }
    },

    /*
    * Test if the current player's king is in check. If args are passed in, it will perform the test after the move
    * has been made (to see if it's legal). If no args are passed in, it will examine the board in the current state.
    */
    _isKingInCheck: function (piece, toRow, toCol) {
        // Create a new Board object in hypothetical mode
        var board2 = this._clone();
        board2._hypothetical = true;
        // Switch the player
        board2.currentPlayer = (board2.currentPlayer === 'W') ? 'B' : 'W';
        // If args were passed in, update the board array with this move
        if (piece && toRow >= 0 && toCol >= 0) {
            var cellContents = board2.boardArray[piece.row][piece.column];
            board2.boardArray[piece.row][piece.column] = '';
            board2.boardArray[toRow][toCol] = cellContents;
        }
        // Find the location of current player's king
        var kingCoords;
        outer:
        for (var i in board2.boardArray) {
            var rowArray = board2.boardArray[i];
            for (var j in rowArray) {
                var testPiece = board2.getPieceByCoords(i, j);
                if (testPiece && testPiece.color === this.currentPlayer && testPiece.isKing()) {
                    kingCoords = '' + i + j;
                    break outer;
                }
            }
        }
        // Get all legal moves
        board2.findAllLegalMoves();
        // Now go through all legal moves to see if the king is in check
        for (var key in board2.legalMovesMap) {
            var legalMovesArray = board2.legalMovesMap[key];
            for (var i in legalMovesArray) {
                if (legalMovesArray[i] === kingCoords) {
                    return true;
                }
            }
        }
        return false;
    },

    _isOutOfBounds: function (row, col) {
       return (row < 0 || row > 7 || col < 0 || col > 7);
    },

    /*
    * Used to clone the current board state into a new object. Useful for analyzing future moves.
    */
    _clone: function () {
        var clone = new chess.Board();
        clone.currentPlayer = this.currentPlayer;
        clone.boardArray = [];
        for (var i in this.boardArray) {
            clone.boardArray[i] = [];
            var cols = this.boardArray[i];
            for (var j in cols) {
                clone.boardArray[i][j] = cols[j];
            }
        }
        return clone;
    }

});
