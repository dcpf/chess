/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var AppContext = {

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

        appContext.eventHandler = new EventHandler();
        appContext.notationConverter = new NotationConverter();
        appContext.genericDialogView = new GenericDialogView({
            eventHandler: appContext.eventHandler
        });
        appContext.userPrefs = new UserPrefs();
        appContext.capturedPieces = new CapturedPieces();
        appContext.moveHistory = new MoveHistory();
        appContext.board = new Board({
            eventHandler: appContext.eventHandler,
            notationConverter: appContext.notationConverter,
            capturedPieces: appContext.capturedPieces,
            moveHistory: appContext.moveHistory
        });
        appContext.feedbackDialogView = new FeedbackDialogView({
            eventHandler: appContext.eventHandler
        });
        appContext.enterGameView = new EnterGameView({
            eventHandler: appContext.eventHandler
        });
        appContext.forgotGameIdDialogView = new ForgotGameIdDialogView({
            eventHandler: appContext.eventHandler
        });
        appContext.boardView = new BoardView({
            board: appContext.board,
            eventHandler: appContext.eventHandler,
            notationConverter: appContext.notationConverter,
            userPrefs: appContext.userPrefs
        });
        appContext.boardSnapshotView = new BoardSnapshotView({
            eventHandler: appContext.eventHandler,
            notationConverter: appContext.notationConverter,
            moveHistory: appContext.moveHistory
        });
        appContext.confirmMoveDialogView = new ConfirmMoveDialogView({
            eventHandler: appContext.eventHandler
        });
        appContext.gameManager = new GameManager({
            eventHandler: appContext.eventHandler,
            board: appContext.board,
            boardView: appContext.boardView
        });

        // These views just need to be instantiated - no need to assign to a variable
        new OptionsMenuView({
          eventHandler: appContext.eventHandler,
          userPrefs: appContext.userPrefs
        });
        new PlayGameView({
            eventHandler: appContext.eventHandler
        });
        new CapturedPiecesView({
            capturedPieces: appContext.capturedPieces
        });
        new MoveHistoryView({
            moveHistory: appContext.moveHistory,
            eventHandler: appContext.eventHandler
        });
        new MessagesView({
            eventHandler: appContext.eventHandler,
            board: appContext.board
        });

        this._appContext = appContext;
        return this._appContext;

    }

};
