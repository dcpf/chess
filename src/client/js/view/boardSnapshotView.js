/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

/*
* Child of BoardView with the sole purpose of rendering the board in 'view only' mode in a dialog.
*/
var BoardSnapshotView = BoardView.extend({

    el: '#chessBoardSnapshotDialog',

    initialize: function () {

        // set the passed-in options
        this.eventHandler = this.options.eventHandler;
        this.moveHistory = this.options.moveHistory;
        this.notationConverter = this.options.notationConverter;

        // set mode to view-only
        this.viewMode = true;

        // set up the listeners
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.MOVE_HISTORY_LINK_CLICKED, this._render);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.REPLAY_GAME_LINK_CLICKED, function(){this._render();this._startAutoMove();});

        // set the click handler on the dialog's close icon
        var self = this;
        this.$('a.closeIcon').click(function() {
            self._closeDialog();
            return false;
        });

    },

    /*
    * Called from the dialog
    */
    _closeDialog: function () {

        // stop the timers
        if (this.movePieceTimeoutId) {
            clearTimeout(this.movePieceTimeoutId);
        }
        if (this.autoMoveTimeoutId) {
            clearTimeout(this.autoMoveTimeoutId);
        }

        // clear the tempPiecePlaceHolder
        this.$('#tempPiecePlaceHolder').html('');

        // hide the dialog
        this.$('#chessBoardSnapshotContainer').html('');
        this.$('.modal-body .move').text('');
        this.$el.modal('hide');

    },

    /*
    * Draw the board
    */
    _render: function (index) {

        this.board = new Board();
        this.board.notationConverter = this.notationConverter;
        var gameBoard = this._generateBoard();
        this.$('#chessBoardSnapshotContainer').html(gameBoard);
        this.$el.modal();
        var moveHistoryObj, notation;

        // If index was passed in, loop through the moves in the move history, updating the board array.
        if (index) {

            // loop through each move and update the board array
            for (var i = 0; i <= index; i++) {
                moveHistoryObj = this.moveHistory.models[i];
                notation = moveHistoryObj.attributes.notation;
                this.board.updateGameState(notation);
            }

            // update the display with the final notation
            this._updateDisplayMove(index, notation);

        }

        // Now that the board array has been updated, update the board view.
        this.updateBoard();

    },

    /**
    * Creates an array of moves for _autoMove() to work off of, then calls _autoMove().
    */
    _startAutoMove: function () {

        // build the array of moves
        this.moveObjArray = [];
        for (var i in this.moveHistory.models) {
            var moveHistoryObj = this.moveHistory.models[i];
            var notation = moveHistoryObj.attributes.notation;
            var moveArray = this.notationConverter.convertNotation(notation, this._getCurentPlayerByMoveIndex(i));
            // In the case of a castle move, notationConverter.convertNotation() will return an array of two moves: one for the rook,
            // and one for the king. We need to put both in the moveObjArray, so each piece can be auto-moved.
            for (var j in moveArray) {
                var moveObj = {
                    moveIndex: i,
                    notation: notation,
                    move: moveArray[j]
                };
                this.moveObjArray.push(moveObj);
            }
        }

        // now that we've built the array, call _autoMove()
        this._autoMove(0);

    },


    /*
    * Auto-moves the piece on the board for the move in the moveHistory collection specified by the passed-in index.
    * It gets the move notation from the moveHistory collection, computes the direction and distance to move, and
    * calls movePiece() to actually move the piece.
    *
    * @param index - the index of the moveHistory collection from which to get the move
    */
    _autoMove: function (index) {

        // Get the move object from the moveObjArray
        var moveObj = this.moveObjArray[index];

        // If we've reached the end of the array, return.
        if (!moveObj) {
            return;
        }

        var notation = moveObj.notation;
        var move = moveObj.move;
        var piece = move.piece;

        // Update the display notation *unless* this is a castle move and the piece being moved is a king.
        // In this case, the display notation was already updated when the rook was moved.
        if (!(notation.indexOf('O-O') === 0 && piece.isKing())) {
            this._updateDisplayMove(moveObj.moveIndex, notation);
        }

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

        // attach the img to the tempPiecePlaceHolder and set its offset to the original offset
        this.$('#tempPiecePlaceHolder').append($img);
        $img.offset(origOffset);

        // Calculate which direction to go and how far
        var goUp = (origOffset.top > targetOffset.top);
        var goDown = (origOffset.top < targetOffset.top);
        var goLeft = (origOffset.left > targetOffset.left);
        var goRight = (origOffset.left < targetOffset.left);

        var distanceUp, distanceDown, distanceRight, distanceLeft;
        var moveUp = 0, moveDown = 0, moveLeft = 0, moveRight = 0;

        if (goUp && goRight) {
            distanceUp = origOffset.top - targetOffset.top;
            distanceRight = targetOffset.left - origOffset.left;
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
            distanceUp = origOffset.top - targetOffset.top;
            distanceLeft = origOffset.left - targetOffset.left;
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
            distanceDown = targetOffset.top - origOffset.top;
            distanceRight = targetOffset.left - origOffset.left;
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
            distanceDown = targetOffset.top - origOffset.top;
            distanceLeft = origOffset.left - targetOffset.left;
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

        // move the piece
        this._movePiece($img, $target, piece, notation, move, moveUp, moveRight, moveDown, moveLeft, targetOffset, index);

    },

    /*
    * Called repeatedly using setTimeout() to move a piece from one square to another.
    *
    * @param $obj - the jQuery image object for the piece being moved
    * @param $target - the jQuery target object where the piece is being moved to
    * @param piece - the piece object being moved
    * @param notation - the string notation for this move
    * @param move - the move object from notationConverter.convertNotation()
    * @param moveUp - number of pixels to move up on each iteration
    * @param moveRight - number of pixels to move right on each iteration
    * @param moveDown - number of pixels to move down on each iteration
    * @param moveLeft - number of pixels to move left on each iteration
    * @param targetOffset - the offest of the target square
    * @param index - the moveHistory index needed by autoMove()
    */
    _movePiece: function ($obj, $target, piece, notation, move, moveUp, moveRight, moveDown, moveLeft, targetOffset, index) {
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

            this.movePieceTimeoutId = setTimeout(this._movePiece.bind(this, $obj, $target, piece, notation, move, moveUp, moveRight, moveDown, moveLeft, targetOffset, index), 5);

        } else {

            // We've reached the destination. Remove the captured piece (if any), reset the img positioning, put the piece on the square, and call autoMove() with the next index.
            if (move.captureCoords) {
                this.$('#sq' + move.captureCoords.row + move.captureCoords.col).html('');
            }
            $obj.css('position', 'static');
            $obj.css('top', 'default');
            $obj.css('left', 'default');
            $target.html($obj);

            // Call autoMove() after a slight pause
            var waitTime = (notation.indexOf('O-O') === 0 && piece.isRook()) ? 0 : 1000;
            this.autoMoveTimeoutId = setTimeout(this._autoMove.bind(this, ++index), waitTime);

        }
    },

    /*
    * Given an index from the moveHistory collection, figure out the move# to display in the UI. Then display the move# and the move notation.
    */
    _updateDisplayMove: function (index, notation) {
        var moveNum = parseInt(index, 10) + 1;
        var dots = '... ';
        if (moveNum % 2 !== 0) {
            moveNum++;
            dots = '. ';
        }
        moveNum = moveNum/2;
        this.$('.modal-body .move').text(moveNum + dots + notation);
    },

    /*
    * Gets the currentPlayer by move index. For example:
    * 0, 2, 4, 6 ... = W
    * 1, 3, 5, 7 ... = B
    */
    _getCurentPlayerByMoveIndex: function (index) {
        index = parseInt(index, 10);
        return (index === 0 || index % 2 === 0) ? 'W' : 'B';
    }

});
