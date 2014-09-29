/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var BoardView = Backbone.View.extend({

    el: '#chessBoardContainer',

    // Variable to track the piece being moved. Normally, we would use the dataTransfer object, but that does not appear to work properly.
    pieceInMotion: '',

    initialize: function () {

        // set the passed-in options
        this.board = this.options.board;
        this.eventHandler = this.options.eventHandler;
        this.userPrefs = this.options.userPrefs;
        this.notationConverter = this.options.notationConverter;

        // set this to true for 'view-only' rendering
        this.viewMode = false;

        // set up the listeners
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.MOVE_CONFIRMED, function (notation) {
            this._updateGameWithLatestMove(notation);
        });
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.MOVE_CONFIRMED, this._saveMove);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.CANCEL_MOVE, this._cancelMove);

        // set up the drag/drop event handlers for all squares on the board where the id starts with 'sq'
        var self = this;
        this.$el.on('drop', 'td[id^="sq"]', function (event) {
            self.drop(event);
        });
        this.$el.on('dragover', 'td[id^="sq"]', function (event) {
            self.allowDrop(event);
        });

        // set up the drag/drop event handlers for any piece added to the board with draggable=true attr
        this.$el.on('dragstart', 'img[draggable="true"]', function (event) {
            self.drag(event);
        });
        this.$el.on('dragend', 'img[draggable="true"]', function (event) {
            self.dragEnd(event);
        });
        this.$el.on('mouseover', 'img[draggable="true"]', function (event) {
            self.showLegalMoves(event);
        });
        this.$el.on('mouseout', 'img[draggable="true"]', function () {
            self.hideLegalMoves();
        });

    },

    _buildPieceImageElem: function (piece) {
        var legalMoves = this.board.legalMovesMap[piece.id];
        var draggable = (!this.viewMode && legalMoves && legalMoves.length > 0) ? true : false;
        var imgTag = '<img id="' + piece.id + '" src="/webapp/images/' + piece.qualifiedName + '.gif" draggable="' + draggable + '"';
        imgTag += '/>';
        return imgTag;
    },

    /*
    * Called from the UI when a piece is dragged
    */
    drag: function (event) {
        event.target.style.opacity = '.5';
        this.pieceInMotion = event.target.id;
    },

    // On drag-end, set the opacity of the object back to 1
    dragEnd: function (event) {
        var pieceId = event.target.id;
        this.$('#' + pieceId).css('opacity', '1');
    },

    /*
    * Called from the UI when a piece is either dragged over or dropped
    */
    allowDrop: function (event) {
        var pieceId = this.pieceInMotion;
        var coords = event.target.id.substr(2);
        if (this.board.isLegalMove(pieceId, coords)) {
            event.preventDefault();
            return true;
        }
        return false;
    },

    /*
    * Called from the UI when a piece is dropped
    */
    drop: function (event) {
        if (this.allowDrop(event)) {
            var pieceId = this.pieceInMotion;
            var toRow = event.target.id.substr(2, 1);
            var toCol = event.target.id.substr(3, 1);
            this._doMove(pieceId, toRow, toCol);
        }
    },

    /*
    * Called from the UI when a piece is hovered over
    */
    showLegalMoves: function (event) {
        if (this.userPrefs.isShowLegalMovesEnabled()) {
            var legalMoves = this.board.legalMovesMap[event.target.id];
            if (legalMoves) {
                for (var i in legalMoves) {
                    this.$('#sq' + legalMoves[i]).addClass('moveableSquare');
                }
            }
        }
    },

    /*
    * Called from the UI when a piece on mouse out
    */
    hideLegalMoves: function () {
        if (this.userPrefs.isShowLegalMovesEnabled()) {
            this.$('td').removeClass('moveableSquare');
        }
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
                gameBoard += '<td id="sq' + row + col + '" style="background-color: #' + bgcolor + '"';
                gameBoard += '></td>';
            }
            gameBoard += '<td>' + this.notationConverter.rowNums[row] + '</td></tr>';
        }

        gameBoard += '<tr><td>&nbsp;</td>';

        // Draw the bottom row of column letters
        for (i in letters) {
            gameBoard += '<td>' + letters[i] + '</td>';
        }

        gameBoard += '<td>&nbsp;</td></tr></table>';

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
    },

    /*
    * Called when a player has moved a piece via the UI. Performs some computations and board mgmt functions, then renders the "confirm move" dialog to the player.
    */
    _doMove: function (pieceId, toRow, toCol) {

        // make sure these are numbers
        toRow = parseInt(toRow, 10);
        toCol = parseInt(toCol, 10);

        var piece = new Piece({id: pieceId});
        var pieceType = piece.type;
        var fromRow = piece.row;
        var fromCol = piece.column;

        var x = ' ';
        var ep = '';
        var capturedPiece = this.board.getPieceByCoords(toRow, toCol);
        if (capturedPiece) {
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

        var possibleMoves = [];
        // Build the notation string
        var notation = pieceType + this.notationConverter.getNotation(fromCol, fromRow) + x + this.notationConverter.getNotation(toCol, toRow) + ep;
        possibleMoves.push(notation);

        // See if this is a possible castle move, and add the notation string to the possibleMoves array.
        if (piece.isRook() && !this.board.rookAndKingMoves[piece.id]) {
            // Get the base row for the color: W = 7; B = 0
            var baseRow = (piece.isWhite()) ? 7 : 0;
            var origKingId = piece.color + 'K' + baseRow + '4';
            // If the king has not moved yet, and the rook is moving on the base row from either squares 7 - 5 or 0 - 3, this is a possible castle move
            if (!this.board.rookAndKingMoves[origKingId] && fromRow == baseRow && toRow == baseRow) {
                var castleNotation;
                if (fromCol === 7 && toCol === 5) {
                    castleNotation = 'O-O';
                } else if (fromCol === 0 && toCol === 3) {
                    castleNotation = 'O-O-O';
                }
                if (castleNotation) {
                    possibleMoves.push(castleNotation);
                }
            }
        }

        // Move the piece to the new location on the board
        this.movePiece(pieceId, toRow, toCol);

        this.hideLegalMoves();

        // Render the confirm dialog
        this.eventHandler.trigger(this.eventHandler.messageNames.RENDER_CONFIRM_MOVE_DIALOG, possibleMoves);

    },

    /**
    * Called when a player has confirmed their move via the confirm dialog.
    * Updates the game state, then updates the board view.
    */
    _updateGameWithLatestMove: function (notation) {

        // Update the game state and legal moves
        this.board.updateGameState(notation);
        this.board.findAllLegalMoves();

        // Put the board into view-only mode, and set canMove to false.
        // It's no longer their turn, so they shouldn't be able to move.
        this.viewMode = true;
        chessAttrs.gameState.canMove = false;

        // Update the board view
        this.updateBoard();

    },

    _saveMove: function (notation) {
        this.eventHandler.trigger(this.eventHandler.messageNames.SAVE_MOVE, notation);
    }

});
