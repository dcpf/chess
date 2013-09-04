/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

/*
* Child of chess.BoardView with the sole purpose of rendering the board in 'view only' mode in a dialog.
*/
chess.BoardSnapshotView = chess.BoardView.extend({

    el: '#chessBoardSnapshotDialog',

    initialize: function () {

        // set the passed-in options
        this.eventHandler = this.options.eventHandler;
        this.moveHistory = this.options.moveHistory;
        this.notationConverter = this.options.notationConverter;

        // set mode to view only
        this.mode = 'view';

        // set up the listeners
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.moveHistoryLinkClicked, this._render);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.replayGameLinkClicked, function(){this._render();this._autoMove(0);});

    },

    /*
    * Called from the dialog
    */
    closeDialog: function () {
        this.$('#chessBoardSnapshotContainer').html('');
        this.$('.modal-body .move').text('');
        this.$el.modal('hide');
    },

    /*
    * Draw the board
    */
    _render: function (index) {
        this.board = new chess.Board();
        var gameBoard = this._generateBoard();
        this.$('#chessBoardSnapshotContainer').html(gameBoard);
        this.updateBoard();
        this.$el.modal();
        var notation;
        if (index) {

            // go through each move notation and update the board
            for (var i = 0; i <= index; i++) {
                var moveHistoryObj = this.moveHistory.models[i];
                notation = moveHistoryObj.attributes.notation;
                var capturedPiece = moveHistoryObj.attributes.capturedPiece;
                if (capturedPiece) {
                    // blank out the location of the captured piece
                    // this.board.boardArray[capturedPiece.row][capturedPiece.column] = '';
                    this.$('#sq' + capturedPiece.row + capturedPiece.column).html('');
                }
                var moveArray = this.notationConverter.convertNotation(this.board, notation, i);
                for (var j in moveArray) {
                    var move = moveArray[j];
                    var piece = move.piece;
                    // this.board.boardArray[piece.row][piece.column] = ''; // Blank out the previous location
                    // this.board.boardArray[move.toRow][move.toCol] = piece.qualifiedName; // Populate the new location
                    // this.updateBoard();
                    var fromSquare = '#sq' + piece.row + piece.column;
                    var $img = this.$('#chessBoardSnapshotContainer ' + fromSquare).children('img');
                    this.$(fromSquare).html(''); // Blank out the previous location
                    this.$('#sq' + move.toRow + move.toCol).html($img); // Populate the new location
                }
            }

            // update the display with the final notation
            this._updateDisplayMove(index, notation);

        }
    },

    /*
    * Auto-moves the piece on the board for the move in the moveHistory collection specified by the passed-in index.
    * It gets the move notation from the moveHistory collection, computes the direction and distance to move, and 
    * calls movePiece() to actually move the piece.
    */
    _autoMove: function (index) {

        // get the move notation from the moveHistory collection, and convert it
        var moveHistoryObj = this.moveHistory.models[index];
        if (!moveHistoryObj) {
            // If we've reached the end of the move history, return.
            return;
        }
        var notation = moveHistoryObj.attributes.notation;
        var capturedPiece = moveHistoryObj.attributes.capturedPiece;
        var moveArray = this.notationConverter.convertNotation(this.board, notation, index);
 
        for (var i in moveArray) {

            var move = moveArray[i];
            var piece = move.piece;

            // get the piece and its orig offset
            var fromSquare = '#sq' + piece.row + piece.column;
            var $img = this.$('#chessBoardSnapshotContainer ' + fromSquare).children('img');
            var origOffset = $img.offset();

            // blank out the square where it lives
            this.$(fromSquare).html('');

            // Get a handle on the target square. If there is a piece there, get its offset. Else, put the piece we already have there, and get its new offset.
            var targetOffset;
            var toSquare = '#sq' + move.toRow + move.toCol;
            var $target = this.$('#chessBoardSnapshotContainer ' + toSquare);
            var $img2 = $target.children('img');
            if ($img2[0]) {
                targetOffset = $img2.offset();
            } else {
                $target.html($img);
                targetOffset = $img.offset();
                // blank out the target square
                $target.html('');
            }

            // attach the img to the body and set its offset to the original offset
            this.$('#chessBoardSnapshotContainer').append($img);
            $img.offset(origOffset);

            // Calculate which direction to go and how far
            var goUp = (origOffset.top > targetOffset.top);
            var goDown = (origOffset.top < targetOffset.top);
            var goLeft = (origOffset.left > targetOffset.left);
            var goRight = (origOffset.left < targetOffset.left);

            var moveUp = 0, moveDown = 0, moveLeft = 0, moveRight = 0;
            if (goUp && goRight) {
                var distanceUp = origOffset.top - targetOffset.top;
                var distanceRight = targetOffset.left - origOffset.left;
                if (distanceUp > distanceRight) {
                    moveUp = 1;
                    moveRight = 1/(distanceUp/distanceRight);
                } else if (distanceUp < distanceRight) {
                    moveUp = 1/(distanceRight/distanceUp);
                    moveRight = 1;
                } else {
                    moveUp = 1;
                    moveRight = 1;
                }
            } else if (goUp && goLeft) {
                var distanceUp = origOffset.top - targetOffset.top;
                var distanceLeft = origOffset.left - targetOffset.left;
                if (distanceUp > distanceLeft) {
                    moveUp = 1;
                    moveLeft = 1/(distanceUp/distanceLeft);
                } else if (distanceUp < distanceLeft) {
                    moveUp = 1/(distanceLeft/distanceUp);
                    moveLeft = 1;
                } else {
                    moveUp = 1;
                    moveLeft = 1;
                }
            } else if (goDown && goRight) {
                var distanceDown = targetOffset.top - origOffset.top;
                var distanceRight = targetOffset.left - origOffset.left;
                if (distanceDown > distanceRight) {
                    moveDown = 1;
                    moveRight = 1/(distanceDown/distanceRight);
                } else if (distanceDown < distanceRight) {
                    moveDown = 1/(distanceRight/distanceDown);
                    moveRight = 1;
                } else {
                    moveDown = 1;
                    moveRight = 1;
                }
            } else if (goDown && goLeft) {
                var distanceDown = targetOffset.top - origOffset.top;
                var distanceLeft = origOffset.left - targetOffset.left;
                if (distanceDown > distanceLeft) {
                    moveDown = 1;
                    moveLeft = 1/(distanceDown/distanceLeft);
                } else if (distanceDown < distanceLeft) {
                    moveDown = 1/(distanceLeft/distanceDown);
                    moveLeft = 1;
                } else {
                    moveDown = 1;
                    moveLeft = 1;
                }
            } else if (goUp) {
                moveUp = 1;
            } else if (goDown) {
                moveDown = 1;
            } else if (goRight) {
                moveRight = 1;
            } else if (goLeft) {
                moveLeft = 1;
            }

            // Update the display notation, and move the piece
            this._updateDisplayMove(index, notation);
            this._movePiece($img, $target, moveUp, moveRight, moveDown, moveLeft, targetOffset, index, capturedPiece);

        }
    },

    /*
    * Called repeatedly using setTimeout() to move a piece from one square to another.
    */
    _movePiece: function ($obj, $target, moveUp, moveRight, moveDown, moveLeft, targetOffset, index, capturedPiece) {
        var keepMoving = false;
        if (moveUp && $obj.offset().top > targetOffset.top) {
            $obj.offset({top: $obj.offset().top - moveUp});
            keepMoving = true;
        }
        if (moveRight && $obj.offset().left < targetOffset.left) {
            $obj.offset({left: $obj.offset().left + moveRight});
            keepMoving = true;
        }
        if (moveDown && $obj.offset().top < targetOffset.top) {
            $obj.offset({top: $obj.offset().top + moveDown});
            keepMoving = true;
        }
        if (moveLeft && $obj.offset().left > targetOffset.left) {
            $obj.offset({left: $obj.offset().left - moveLeft});
            keepMoving = true;
        }
        if (keepMoving) {
            // TODO: find a way to call movePiece() without having to specify the chessGame namespace. I.e., we should be able to do it using just 'this'.
            setTimeout(function(){chessGame.boardSnapshotView._movePiece($obj, $target, moveUp, moveRight, moveDown, moveLeft, targetOffset, index, capturedPiece)}, 5);
        } else {
            // We've reached the destination. Remove the captured piece (if any), reset the img positioning, put the piece on the square, and call autoMove() with the next index.
            if (capturedPiece) {
                this.$('#sq' + capturedPiece.row + capturedPiece.column).html('');
            }
            $obj.css('position', 'static');
            $obj.css('top', 'default');
            $obj.css('left', 'default');
            $target.html($obj);
            // Call autoMove() after a 1 second pause
            // TODO: find a way to call autoMove() without having to specify the chessGame namespace. I.e., we should be able to do it using just 'this'.
            setTimeout(function(){chessGame.boardSnapshotView._autoMove(++index)}, 1000);
        }
    },

    /*
    * Given an index from the moveHistory collection, figure out the move# to display in the UI. Then display the move# and the move notation.
    */
    _updateDisplayMove: function (index, notation) {
        var moveNum = parseInt(index) + 1;
        var dots = '... ';
        if (moveNum % 2 != 0) {
            moveNum++;
            dots = '. ';
        }
        moveNum = moveNum/2;
        this.$('.modal-body .move').text(moveNum + dots + notation);
    }

});
