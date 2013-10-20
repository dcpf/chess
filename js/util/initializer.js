/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.initializer = {

    // Instantiates all of the objects and their dependencies needed for the chess game
    initialize: function (obj, canMove) {
        obj.notationConverter = new chess.NotationConverter();
        obj.capturedPieces = new chess.CapturedPieces();
        obj.moveHistory = new chess.MoveHistory();
        obj.board = new chess.Board({
            eventHandler: obj.eventHandler
        });
        obj.boardView = new chess.BoardView({
            mode: (canMove) ? '' : 'view', 
            board: obj.board,
            eventHandler: obj.eventHandler,
            capturedPieces: obj.capturedPieces,
            moveHistory: obj.moveHistory
        });
        obj.boardSnapshotView = new chess.BoardSnapshotView({
            eventHandler: obj.eventHandler,
            moveHistory: obj.moveHistory,
            notationConverter: obj.notationConverter
        });
        obj.genericDialogView = new chess.GenericDialogView({
            eventHandler: obj.eventHandler
        });
        obj.confirmMoveDialogView = new chess.ConfirmMoveDialogView({
            eventHandler: obj.eventHandler
        });

        // These views just need to be instantiated - no need to assign to a variable
        new chess.CapturedPiecesView({
            capturedPieces: obj.capturedPieces
        });
        new chess.MoveHistoryView({
            moveHistory: obj.moveHistory,
            eventHandler: obj.eventHandler
        });
        new chess.MessagesView({
            eventHandler: obj.eventHandler,
            board: obj.board
        });
        
    }

};
