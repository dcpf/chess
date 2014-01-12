/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

chess.AppContext = {

    _appContext: null,

    /**
    * Instantiates all of the objects and their dependencies needed for the chess game
    */
    getAppContext: function () {

        // If already initialized, just return the object
        if (this._appContext !== null) {
            return this._appContext;
        }

        var appContext = {};

        appContext.eventHandler = new chess.EventHandler();
        appContext.notationConverter = new chess.NotationConverter();
        appContext.genericDialogView = new chess.GenericDialogView({
            eventHandler: appContext.eventHandler
        });
        appContext.userPrefs = new chess.UserPrefs();
        appContext.capturedPieces = new chess.CapturedPieces();
        appContext.moveHistory = new chess.MoveHistory();
        appContext.board = new chess.Board({
            eventHandler: appContext.eventHandler,
            notationConverter: appContext.notationConverter,
            capturedPieces: appContext.capturedPieces,
            moveHistory: appContext.moveHistory
        });
        appContext.enterGameView = new chess.EnterGameView({
            eventHandler: appContext.eventHandler
        });
        appContext.boardView = new chess.BoardView({
            board: appContext.board,
            eventHandler: appContext.eventHandler,
            notationConverter: appContext.notationConverter,
            userPrefs: appContext.userPrefs
        });
        appContext.boardSnapshotView = new chess.BoardSnapshotView({
            eventHandler: appContext.eventHandler,
            notationConverter: appContext.notationConverter,
            moveHistory: appContext.moveHistory
        });
        appContext.confirmMoveDialogView = new chess.ConfirmMoveDialogView({
            eventHandler: appContext.eventHandler
        });
        appContext.gameManager = new chess.GameManager({
            eventHandler: appContext.eventHandler,
            board: appContext.board,
            boardView: appContext.boardView
        });

        // These views just need to be instantiated - no need to assign to a variable
        new chess.OptionsMenuView({
            userPrefs: appContext.userPrefs
        });
        new chess.PlayGameView({
            eventHandler: appContext.eventHandler
        });
        new chess.CapturedPiecesView({
            capturedPieces: appContext.capturedPieces
        });
        new chess.MoveHistoryView({
            moveHistory: appContext.moveHistory,
            eventHandler: appContext.eventHandler
        });
        new chess.MessagesView({
            eventHandler: appContext.eventHandler,
            board: appContext.board
        });

        this._appContext = appContext;
        return this._appContext;
        
    }

};
