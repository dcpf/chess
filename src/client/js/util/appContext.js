/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.AppContext = function () {

    /**
    * Instantiates the basic objects needed for the game
    */
    this.initializeBasicObjects = function () {
        this.eventHandler = new chess.EventHandler();
        this.notationConverter = new chess.NotationConverter();
        this.genericDialogView = new chess.GenericDialogView({
            eventHandler: this.eventHandler
        });
        this.board = new chess.Board({
            eventHandler: this.eventHandler
        });
        this.gameManager = new chess.GameManager({
            eventHandler: this.eventHandler,
            notationConverter: this.notationConverter,
            board: this.board
        });
    };

    /**
    * Instantiates all of the objects and their dependencies needed for the chess game
    */
    this.initializeGame = function (canMove) {
        
        this.capturedPieces = new chess.CapturedPieces();
        this.moveHistory = new chess.MoveHistory();
        this.boardView = new chess.BoardView({
            mode: (canMove) ? '' : 'view', 
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

        // update the gameManager with the boardView object
        this.gameManager.boardView = this.boardView;

        
    };

    return this;

};
