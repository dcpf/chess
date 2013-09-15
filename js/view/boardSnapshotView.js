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
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.replayGameLinkClicked, function(){this._render();this._autoMove(this, 0);});

        // set the click handler on the dialog's close icon
        var self = this;
        this.$('a.closeIcon').click(function(){
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
            log('stopping movePieceTimeoutId');
            clearTimeout(this.movePieceTimeoutId);
        }
        if (this.autoMoveTimeoutId) {
            log('stopping autoMoveTimeoutId');
            clearTimeout(this.autoMoveTimeoutId);
        }

        // clear the tempPiecePlaceHolder
        self.$('#tempPiecePlaceHolder').html('');

        // hide the dialog
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
    *
    * Because this function is called repeatedly via setTimeout, we need to pass in the 'self' object so it can have a reference to the boardSnapShotView object instance.
    *
    * @param self - the boardSnapShotView object instance
    * @param index - the index of the moveHistory collection from which to get the move
    */
    _autoMove: function (self, index) {

        // get the move notation from the moveHistory collection, and convert it
        var moveHistoryObj = self.moveHistory.models[index];
        if (!moveHistoryObj) {
            // If we've reached the end of the move history, return.
            return;
        }
        var notation = moveHistoryObj.attributes.notation;
        // update the display notation
        self._updateDisplayMove(index, notation);
        var capturedPiece = moveHistoryObj.attributes.capturedPiece;
        var moveArray = self.notationConverter.convertNotation(self.board, notation, index);
 
        for (var i in moveArray) {

            var move = moveArray[i];
            var piece = move.piece;

            // get the piece and its orig offset
            var fromSquare = '#sq' + piece.row + piece.column;
            var $img = self.$('#chessBoardSnapshotContainer ' + fromSquare).children('img');
            var origOffset = $img.offset();

            // blank out the square where it lives
            self.$(fromSquare).html('');

            // Get a handle on the target square. If there is a piece there, get its offset. Else, put the piece we already have there, and get its new offset.
            var targetOffset;
            var toSquare = '#sq' + move.toRow + move.toCol;
            var $target = self.$('#chessBoardSnapshotContainer ' + toSquare);
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
            self.$('#tempPiecePlaceHolder').append($img);
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

            // move the piece
            self._movePiece(self, $img, $target, moveUp, moveRight, moveDown, moveLeft, targetOffset, index, capturedPiece);

        }
    },

    /*
    * Called repeatedly using setTimeout() to move a piece from one square to another.
    * Because this function is called via setTimeout, we need to pass in the 'self' object so it can have a reference to the boardSnapShotView object instance.
    *
    * @param self - the boardSnapShotView object instance
    * @param $obj - the jQuery image object for the piece being moved
    * @param $target - the jQuery target object where the piece is being moved to
    * @param moveUp - number of pixels to move up on each iteration
    * @param moveRight - number of pixels to move right on each iteration
    * @param moveDown - number of pixels to move down on each iteration
    * @param moveLeft - number of pixels to move left on each iteration
    * @param targetOffset - the offest of the target square
    * @param index - the moveHistory index needed by autoMove()
    * @param capturedPiece - the captured piece (if any) for this move
    */
    _movePiece: function (self, $obj, $target, moveUp, moveRight, moveDown, moveLeft, targetOffset, index, capturedPiece) {
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
            this.movePieceTimeoutId = setTimeout(function(){self._movePiece(self, $obj, $target, moveUp, moveRight, moveDown, moveLeft, targetOffset, index, capturedPiece)}, 5);
        } else {
            // We've reached the destination. Remove the captured piece (if any), reset the img positioning, put the piece on the square, and call autoMove() with the next index.
            if (capturedPiece) {
                self.$('#sq' + capturedPiece.row + capturedPiece.column).html('');
            }
            $obj.css('position', 'static');
            $obj.css('top', 'default');
            $obj.css('left', 'default');
            $target.html($obj);
            // Call autoMove() after a 1 second pause
            this.autoMoveTimeoutId = setTimeout(function(){self._autoMove(self, ++index)}, 1000);
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
