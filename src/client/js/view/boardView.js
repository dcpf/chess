/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.BoardView = Backbone.View.extend({

    el: '#chessBoardContainer',

    // Variable to track the piece being moved. Normally, we would use the dataTransfer object, but that does not appear to work properly.
    pieceInMotion: '',

    // flag for enabling/disabling showLegalMoves()
    showLegalMovesEnabled: true,

    initialize: function () {

        // set the passed-in options
        this.board = this.options.board;
        this.eventHandler = this.options.eventHandler;
        this.capturedPieces = this.options.capturedPieces;
        this.moveHistory = this.options.moveHistory;
        this.notationConverter = this.options.notationConverter;

        // set mode to view for 'view-only' rendering
        this.mode = this.options.mode;

        // set up the listeners
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.moveConfirmed, function (notation, pieceId, toRow, toCol) {
            this.updateGameWithLatestMove(notation, pieceId, toRow, toCol, true);
        });
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.moveConfirmed, this._saveMove);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.cancelMove, this._cancelMove);

        // set up the drag/drop event handlers for all squares on the board where the id starts with 'sq'
        var self = this;
        this.$el.on('drop', 'td[id^="sq"]', function (e) {
            self.drop(e);
        });
        this.$el.on('dragover', 'td[id^="sq"]', function (e) {
            self.allowDrop(e);
        });

        // set up the drag/drop event handlers for any piece added to the board with draggable=true attr
        this.$el.on('dragstart', 'img[draggable="true"]', function (e) {
            self.drag(e);
        });
        this.$el.on('dragend', 'img[draggable="true"]', function (e) {
            self.dragEnd(e);
        });
        this.$el.on('mouseover', 'img[draggable="true"]', function (e) {
            self.showLegalMoves(e);
        });
        this.$el.on('mouseout', 'img[draggable="true"]', function () {
            self.hideLegalMoves();
        });

    },

    _buildPieceImageElem: function (piece) {
        var legalMoves = this.board.legalMovesMap[piece.id];
        var draggable = (this.mode !== 'view' && legalMoves && legalMoves.length > 0) ? true : false;
        var imgTag = '<img id="' + piece.id + '" src="src/client/images/' + piece.qualifiedName + '.gif" draggable="' + draggable + '"';
        imgTag += '/>';
        return imgTag;
    },

    /*
    * Called from the UI when a piece is dragged
    */
    drag: function (e) {
        e.target.style.opacity = '.5';
        this.pieceInMotion = e.target.id;
    },

    // On drag-end, set the opacity of the object back to 1
    dragEnd: function (e) {
        var pieceId = e.target.id;
        this.$('#' + pieceId).css('opacity', '1');
    },

    /*
    * Called from the UI when a piece is either dragged over or dropped
    */
    allowDrop: function (e) {
        var pieceId = this.pieceInMotion;
        var coords = e.target.id.substr(2);
        if (this.board.isLegalMove(pieceId, coords)) {
            e.preventDefault();
            return true;
        }
        return false;
    },

    /*
    * Called from the UI when a piece is dropped
    */
    drop: function (e) {
        if (this.allowDrop(e)) {
            var pieceId = this.pieceInMotion;
            var toRow = e.target.id.substr(2, 1);
            var toCol = e.target.id.substr(3, 1);
            this.doMove(pieceId, toRow, toCol, true);
        }
    },

    /*
    * Called from the UI when a piece is hovered over
    */
    showLegalMoves: function (e) {
        if (!this.showLegalMovesEnabled) {
            return;
        }
        var legalMoves = this.board.legalMovesMap[e.target.id];
        if (legalMoves) {
            for (var i in legalMoves) {
                this.$('#sq' + legalMoves[i]).addClass('moveableSquare');
            }
        }
    },

    /*
    * Called from the UI when a piece on mouse out
    */
    hideLegalMoves: function () {
        this.$('td').removeClass('moveableSquare');
    },

    /*
    * Generate the board
    * @param perspective - Needed to draw the board in the correct perspective for the current viewer
    */
    _generateBoard: function (perspective) {
    
        // Set the board coords based on the current player. For black, we want to turn the board upside down.
        var letters = _.clone(this.notationConverter.letters),
            dimStart = 0,
            dimEnd = 7,
            dimIncrement = 1;
        if (perspective === 'B') {
            letters = letters.reverse();
            dimStart = 7;
            dimEnd = 0;
            dimIncrement = -1;
        }

        var gameBoard = '<table id="chessBoard" border="1"><tr><td>&nbsp;</td>';
    
        // Draw the top row of column letters
        for (var i in letters) {
            gameBoard += '<td>' + letters[i] + '</td>';
        }
    
        gameBoard += '<td>&nbsp;</td></tr>';

        var bgcolor = 'fff';
        for (var row = dimStart; row >= 0 && row <= 7; row += dimIncrement) {
            bgcolor = (bgcolor === 'ccc') ? 'fff' : 'ccc';
            gameBoard += '<tr><td>' + this.notationConverter.rowNums[row] + '</td>';
            for (var col = dimStart; col >= 0 && col <= 7; col += dimIncrement) {
                bgcolor = (bgcolor === 'ccc') ? 'fff' : 'ccc';
                gameBoard += '<td id="sq' + row + col + '" bgcolor="#' + bgcolor + '"';
                gameBoard += '></td>';
            }
            gameBoard += '<td>' + this.notationConverter.rowNums[row] + '</td></tr>';
        }
    
        gameBoard += '<tr><td>&nbsp;</td>';
    
        // Draw the bottom row of column letters
        for (var i in letters) {
            gameBoard += '<td>' + letters[i] + '</td>';
        }
    
        gameBoard += '<td>&nbsp;</td></tr></table>'
    
        return gameBoard;

    },

    /*
    * Draw the board
    */
    render: function (perspective) {
        var gameBoard = this._generateBoard(perspective);
        this.$el.html(gameBoard);
        this.updateBoard();
    },

    /*
    * Update the board based on the Chess object's boardArray
    */
    updateBoard: function () {
        for (var row in this.board.boardArray) {
            var cols = this.board.boardArray[row];
            for (var col in cols) {
                // Wipe out whatever's currently on the square (if anything)
                this.$('#sq' + row + col).html('');
                var piece = this.board.getPieceByCoords(row, col);
                if (piece) {
                    // Put the piece on the square
                    this.$('#sq' + row + col).html(this._buildPieceImageElem(piece));
                }
            }
        }
    },

    /*
    * Remove a piece from the board
    */
    removePiece: function (piece) {
        this.$('#' + piece.id).remove();
    },

    /*
    * Move a piece to a new location on the board
    */
    movePiece: function (pieceId, toRow, toCol) {
        // Append the piece to the new location on the board
        var pieceElem = this.$('#' + pieceId);
        this.$('#sq' + toRow + toCol).append(pieceElem);
    },

    /**
    * Called when the user has cancelled their move via the confirm dialog.
    */
    _cancelMove: function () {
         // Revert the board to the position that's still in the boardArray
        this.updateBoard();
        // Remove the piece from limbo
        this.board.limbo = null;
    },

    /*
    * This can be called under 1 of 2 conditions:
    * 
    * 1. When a player has moved a piece via the UI
    * 2. During game initization
    *
    * In the case of #1, it performs some computations and board mgmt functions, then renders the "confirm move" dialog to the player.
    * In the case of #2, it performs the same computations and board mgmt functions without the UI interaction.
    *
    * @param pieceId
    * @param toRow
    * @param toCol
    * @param ui - true = confirm dialog, false = no dialog
    */
    doMove: function (pieceId, toRow, toCol, ui) {

        var piece = new chess.Piece({id: pieceId});
        var pieceType = piece.type;
        var fromRow = piece.row;
        var fromCol = piece.column;

        // If there's a captured piece, put it in limbo awaiting confirmation from the player
        var x = ' ';
        var ep = '';
        var capturedPiece = this.board.getPieceByCoords(toRow, toCol);
        if (capturedPiece) {
            // Put the captured piece in limbo
            this.board.limbo = capturedPiece;
            // Remove it from the board
            this.removePiece(capturedPiece);
            // Set the x variable for the capture notation
            x = 'x';
        } else if (piece.isPawn()) {
            // If this is an en-passant capture, set the x and ep variables for the capture notation
            var enPassantCapturablePiece = this.board.enPassantCapture['' + toRow + toCol];
            if (enPassantCapturablePiece) {
                x = 'x';
                ep = ' e.p.';
            }
        }

        // The stuff in here only needs to be done in UI mode
        if (ui) {

            // Build the notation string
            var possibleMoves = [];
            var notation = pieceType + this.notationConverter.getNotation(fromCol, fromRow) + x + this.notationConverter.getNotation(toCol, toRow) + ep;
            possibleMoves.push({notation: notation, pieceId: pieceId, toRow: toRow, toCol: toCol});

            // See if this is a possible castle move, and add the notation string to the possibleMoves array.
            if (piece.isRook() && !this.board.rookAndKingMoves[piece.id]) {
                // Get the base row for the color: W = 7; B = 0
                var baseRow = (piece.isWhite()) ? 7 : 0;
                var origKingId = piece.color + 'K' + baseRow + '4';
                // If the king has not moved yet, and the rook is moving on the base row from either squares 7 - 5 or 0 - 3, this is a possible castle move
                if (!this.board.rookAndKingMoves[origKingId] && fromRow == baseRow && toRow == baseRow) {
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
        }

        // Move the piece to the new location on the board
        this.movePiece(pieceId, toRow, toCol);

        this.hideLegalMoves();

        // Render the confirm dialog if in UI mode
        if (ui) {
            this.eventHandler.trigger(this.eventHandler.messageNames.renderConfirmMoveDialog, possibleMoves);
        }

    },

    /**
    * This can be called under 1 of 2 conditions:
    * 
    * 1. When a player has confirmed their move via the confirm dialog (confirmedByPlayer = true)
    * 2. During game initization (confirmedByPlayer = undefined)
    *
    * In both cases, it does the following:
    *
    * Updates the board
    * Updates the boardArray
    * Updates captured pieces
    * Switches the player
    * Finds all legal moves
    *
    */
    updateGameWithLatestMove: function (notation, pieceId, toRow, toCol, confirmedByPlayer) {

        // Update the boardArray with the new piece location
        var piece = new chess.Piece({id: pieceId});
        var fromRow = piece.row;
        var fromCol = piece.column;
        this.board.boardArray[fromRow][fromCol] = ''; // Blank out the previous location
        this.board.boardArray[toRow][toCol] = piece.qualifiedName; // Populate the new location
        // Variable to track if a piece was captured
        var capturedPiece;

        // If this is a pawn move, and it's capturing en-passant, remove the captured piece from the boardArray
        if (piece.isPawn()) {
            var enPassantCapturedPiece = this.board.enPassantCapture['' + toRow + toCol];
            if (enPassantCapturedPiece) {
                capturedPiece = enPassantCapturedPiece;
                this.capturedPieces.add(enPassantCapturedPiece);
                // Remove it from the boardArray
                this.board.boardArray[enPassantCapturedPiece.row][enPassantCapturedPiece.column] = '';
            }
        }

        // Clear en-passant capturable square marked from the previous move
        this.board.enPassantCapture = {};

        // If this is a castle move, move the king as well
        if (notation === 'O-O' || notation === 'O-O-O') {
            var newCol = (notation === 'O-O') ? 6 : 2;
            this.board.boardArray[fromRow][4] = ''; // Blank out the orig king square
            this.board.boardArray[fromRow][newCol] = piece.color + 'K'; // Put the king in the new location
            this.board.rookAndKingMoves[piece.color + 'K' + fromRow + '4'] = 1; // Update the rookAndKingMoves map
        }

        // If this is a pawn move, and the pawn has moved from either row 6 to row 4 (white) or from row 1 to row 3 (black),
        // check to see if there's a pawn on an adjacent square that can capture it en-passant in the next move.
        if (piece.isPawn() && ((fromRow == 6 && toRow == 4) || (fromRow == 1 && toRow == 3))) {
            var rightPiece = this.board.getPieceByCoords(toRow, toCol + 1);
            var leftPiece = this.board.getPieceByCoords(toRow, toCol - 1);
            if ((rightPiece && rightPiece.isPawn()) || (leftPiece && leftPiece.isPawn())) {
                // Set the en-passant capturable coords
                var enPassantCaptureCoords = '' + ((parseInt(fromRow) + parseInt(toRow))/2) + toCol;
                this.board.enPassantCapture[enPassantCaptureCoords] = new chess.Piece({id: piece.qualifiedName + toRow + toCol});
            }
        }

        // If there's a piece in limbo, add it to the capturedPieces collection
        var purgedPiece = this.board.limbo;
        if (purgedPiece) {
            capturedPiece = purgedPiece;
            this.capturedPieces.add(purgedPiece);
            this.board.limbo = null;
        }

        // Track rook or king moves, so we can determine castling possibilies
        if (piece.isRook() || piece.isKing()) {
            this.board.rookAndKingMoves[pieceId] = 1;
        }

        // Switch player
        this.board.currentPlayer = (this.board.currentPlayer === 'W') ? 'B' : 'W';

        // If this move was confirmed by the player, put the board into view mode, and set canMove to false;
        // It's no longer their turn, so they shouldn't be able to move.
        if (confirmedByPlayer) {
            this.mode = 'view';
            chess.vars.canMove = false;
        }

        // Update the legal moves
        this.board.findAllLegalMoves();

        // Update the board view
        this.updateBoard();

        // Add the move to the 'moveHistory' collection
        this.moveHistory.add({notation: notation, capturedPiece: capturedPiece});

    },

    // Save the move to the server
    _saveMove: function (notation) {
        var self = this;
        var deferred = $.post('/saveMove', {
            gameID: chess.vars.gameID,
            key: chess.vars.key,
            move: notation
        });
        deferred.done(function(res) {
            self.eventHandler.trigger(self.eventHandler.messageNames.moveSaved, res);
        });
    }

});