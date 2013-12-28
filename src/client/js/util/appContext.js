/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.AppContext = {

    initialized: false,

    /**
    * Instantiates all of the objects and their dependencies needed for the chess game
    */
    initializeGame: function () {

        // If already initialized, just return this object
        if (this.initialized) {
            return this;
        }

        this.eventHandler = new chess.EventHandler();
        this.notationConverter = new chess.NotationConverter();
        this.genericDialogView = new chess.GenericDialogView({
            eventHandler: this.eventHandler
        });
        this.board = new chess.Board({
            eventHandler: this.eventHandler
        });
        this.capturedPieces = new chess.CapturedPieces();
        this.moveHistory = new chess.MoveHistory();
        this.boardView = new chess.BoardView({
            board: this.board,
            eventHandler: this.eventHandler,
            capturedPieces: this.capturedPieces,
            moveHistory: this.moveHistory,
            notationConverter: this.notationConverter
        });
        this.boardSnapshotView = new chess.BoardSnapshotView({
            eventHandler: this.eventHandler,
            moveHistory: this.moveHistory,
            notationConverter: this.notationConverter
        });
        this.confirmMoveDialogView = new chess.ConfirmMoveDialogView({
            eventHandler: this.eventHandler
        });
        this.gameManager = new chess.GameManager({
            eventHandler: this.eventHandler,
            notationConverter: this.notationConverter,
            board: this.board,
            boardView: this.boardView
        });
        this.enterGameView = new chess.EnterGameView({
            eventHandler: this.eventHandler,
            gameManager: this.gameManager
        });

        // These views just need to be instantiated - no need to assign to a variable
        new chess.CapturedPiecesView({
            capturedPieces: this.capturedPieces
        });
        new chess.MoveHistoryView({
            moveHistory: this.moveHistory,
            eventHandler: this.eventHandler
        });
        new chess.MessagesView({
            eventHandler: this.eventHandler,
            board: this.board
        });

        this.initialized = true;

        return this;
        
    }

};
