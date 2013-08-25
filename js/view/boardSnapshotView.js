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
        this.listenTo(chess.eventHandler, chess.eventHandler.messageNames.moveHistoryLinkClicked, this.render);
    },

    /*
    * Draw the board
    */
    render: function (index) {
        this.board = new chess.Board();
        var gameBoard = this._generateBoard();
        this.$('#chessBoardSnapshotContainer').html(gameBoard);
        this.updateBoard();
        this.$el.modal();
        for (var i = 0; i <= index; i++) {
            var move = chess.moveHistory.models[i].attributes.notation;
            var coords = this._convertNotationToCoords(move);
            var piece = this.board.boardArray[coords.fromRow][coords.fromCol];
            this.board.boardArray[coords.fromRow][coords.fromCol] = ''; // Blank out the previous location
            this.board.boardArray[coords.toRow][coords.toCol] = piece; // Populate the new location
            this.updateBoard();
            
        }
    },

    /*
    * Called from the dialog
    */
    closeDialog: function () {
        this.$el.modal('hide');
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

    }

});

chess.boardSnapshotView = new chess.BoardSnapshotView();
