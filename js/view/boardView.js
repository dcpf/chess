/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.BoardView = Backbone.View.extend({

    el: '#chessBoardContainer',

    initialize: function () {
        this.board = chess.board;
        // set mode to view for 'view-only' rendering
        // this.mode = 'view';
    },

    _buildPieceImageElem: function (piece) {
        var legalMoves = this.board.legalMovesMap[piece.id];
        var draggable = (this.mode !== 'view' && legalMoves && legalMoves.length > 0) ? true : false;
        var imgTag = '<img id="' + piece.id + '" src="images/' + piece.qualifiedName + '.gif" draggable="' + draggable + '"';
        if (draggable) {
            imgTag += ' ondragstart="chess.boardView.drag(event)" ondragend="chess.boardView.dragEnd(this)" onmouseover="chess.boardView.showLegalMoves(event)" onmouseout="chess.boardView.hideLegalMoves()"';
        }
        imgTag += '/>';
        return imgTag;
    },

    /*
    * Called from the UI when a piece is dragged
    */
    drag: function (e) {
        e.target.style.opacity = '.5';
        e.dataTransfer.setData("chessPiece", e.target.id);
    },

    // On drag-end, set the opacity of the object back to 1
    dragEnd: function (obj) {
        var pieceId = obj.id;
        this.$('#' + pieceId).css('opacity', '1');
    },

    /*
    * Called from the UI when a piece is dropped
    */
    allowDrop: function (e) {
        var pieceId = e.dataTransfer.getData("chessPiece");
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
            var pieceId = e.dataTransfer.getData("chessPiece");
            var toRow = e.target.id.substr(2, 1);
            var toCol = e.target.id.substr(3, 1);
            chess.controller.doMove(pieceId, toRow, toCol, true);
        }
    },

    /*
    * Called from the UI when a piece is hovered over
    */
    showLegalMoves: function (e) {
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
    */
    _generateBoard: function () {
    
        var gameBoard = '<table id="chessBoard" border="1"><tr><td>&nbsp;</td>';
    
        // Draw the top row of column letters
        for (var i in this.board.letters) {
            gameBoard += '<td>' + this.board.letters[i] + '</td>';
        }
    
        gameBoard += '<td>&nbsp;</td></tr>';
    
        var bgcolor = (this.board.currentPlayer === 'W') ? 'fff' : 'ccc';
        for (var row in this.board.boardArray) {
            bgcolor = (bgcolor === 'ccc') ? 'fff' : 'ccc';
            gameBoard += '<tr><td>' + this.board.rowNums[row] + '</td>';
            var cols = this.board.boardArray[row];
            for (var col in cols) {
                bgcolor = (bgcolor === 'ccc') ? 'fff' : 'ccc';
                gameBoard += '<td id="sq' + row + col + '" bgcolor="#' + bgcolor + '"';
                if (this.mode !== 'view') {
                    gameBoard += ' ondrop="chess.boardView.drop(event)" ondragover="chess.boardView.allowDrop(event)"';
                }
                gameBoard += '></td>';
            }
            gameBoard += '<td>' + this.board.rowNums[row] + '</td></tr>';
        }
    
        gameBoard += '<tr><td>&nbsp;</td>';
    
        // Draw the bottom row of column letters
        for (var i in this.board.letters) {
            gameBoard += '<td>' + this.board.letters[i] + '</td>';
        }
    
        gameBoard += '<td>&nbsp;</td></tr></table>'
    
        return gameBoard;

    },

    /*
    * Draw the board
    */
    render: function () {
        var gameBoard = this._generateBoard();
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
    }

});
