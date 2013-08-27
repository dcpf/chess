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
        this.mode = 'view';
        this.listenTo(chess.eventHandler, chess.eventHandler.messageNames.moveHistoryLinkClicked, this._render);
        this.listenTo(chess.eventHandler, chess.eventHandler.messageNames.replayGameLinkClicked, function(){this._render();this._autoMove(0);});
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
        var move;
        if (index) {

            // go through each move and update the board
            for (var i = 0; i <= index; i++) {
                move = chess.moveHistory.models[i].attributes.notation;
                var coords = this._convertNotationToCoords(move);
                var piece = this.board.boardArray[coords.fromRow][coords.fromCol];
                this.board.boardArray[coords.fromRow][coords.fromCol] = ''; // Blank out the previous location
                this.board.boardArray[coords.toRow][coords.toCol] = piece; // Populate the new location
                this.updateBoard();
            }

            // update the display move
            this._updateDisplayMove(index, move);

        }
    },

    _autoMove: function (index) {

        // get the move notation from the moveHistory collection, and convert it to coords
        var moveHistoryObj = chess.moveHistory.models[index];
        if (!moveHistoryObj) {
            // If we've reached the end of the move history, return.
            return;
        }
        var move = moveHistoryObj.attributes.notation;
        var capturedPiece = moveHistoryObj.attributes.capturedPiece;
        var coords = this._convertNotationToCoords(move);

        // get the piece and its orig offset
        var fromSquare = '#sq' + coords.fromRow + coords.fromCol;
        var $img = this.$('#chessBoardSnapshotContainer ' + fromSquare).children('img');
        var origOffset = $img.offset();

        // blank out the square where it lives
        this.$(fromSquare).html('');

        // Get a handle on the target square. If there is a piece there, get its offset. Else, put the piece we already have there, and get its new offset.
        var targetOffset;
        var toSquare = '#sq' + coords.toRow + coords.toCol;
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

        // Update the display move and move the piece
        this._updateDisplayMove(index, move);
        this._movePiece($img, $target, moveUp, moveRight, moveDown, moveLeft, targetOffset, index, capturedPiece)
    },

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
            setTimeout(function(){chess.boardSnapshotView._movePiece($obj, $target, moveUp, moveRight, moveDown, moveLeft, targetOffset, index, capturedPiece)}, 5);
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
            setTimeout(function(){chess.boardSnapshotView._autoMove(++index)}, 1000);
        }
    },

    /*
    * Converts the move notation string to coords
    */
    _convertNotationToCoords: function (move) {

        var fromCol = move.substr(1, 1);
        var fromRow = move.substr(2, 1);
        var toCol = move.substr(4, 1);
        var toRow = move.substr(5, 1);
        for (var i in this.board.letters) {
            var letter = this.board.letters[i];
            if (letter == fromCol) {
                fromCol = i;
                break;
            }
        }
        for (var i in this.board.letters) {
            var letter = this.board.letters[i];
            if (letter == toCol) {
                toCol = i;
                break;
            }
        }
        for (var i in this.board.rowNums) {
            var rowNum = this.board.rowNums[i];
            if (rowNum == fromRow) {
                fromRow = i;
                break;
            }
        }
        for (var i in this.board.rowNums) {
            var rowNum = this.board.rowNums[i];
            if (rowNum == toRow) {
                toRow = i;
                break;
            }
        }
        var coords = {fromRow: fromRow, fromCol: fromCol, toRow: toRow, toCol: toCol};
        return coords;

    },

    /*
    * Given an index from the moveHistory collection, figure out the move# to display in the UI. Then display the move# and the move notation.
    */
    _updateDisplayMove: function (index, move) {
        var moveNum = parseInt(index) + 1;
        var dots = '... ';
        if (moveNum % 2 != 0) {
            moveNum++;
            dots = '. ';
        }
        moveNum = moveNum/2;
        this.$('.modal-body .move').text(moveNum + dots + move);
    }

});

chess.boardSnapshotView = new chess.BoardSnapshotView();
