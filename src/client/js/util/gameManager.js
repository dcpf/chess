/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.GameManager = function (attrs) {

    var obj = {

        // passed-in attrs
        eventHandler: attrs.eventHandler,
        notationConverter: attrs.notationConverter,
        board: attrs.board,
        boardView: attrs.boardView,

        createGame: function (params) {
            var self = this;
            var deferred = $.post('/createGame', params);
            deferred.done(function(res) {
                self.startGame(res);
                self.eventHandler.trigger(self.eventHandler.messageNames.gameCreated);
            });
            deferred.fail(function(jqXHR) {
                self.eventHandler.trigger(self.eventHandler.messageNames.createGameError, jqXHR.responseText);
            });
        },

        enterGame: function (params) {
            var self = this;
            var deferred = $.post('/enterGame', params);
            deferred.done(function(res) {
                self.startGame(res);
            });
            deferred.fail(function(jqXHR) {
                self.eventHandler.trigger(self.eventHandler.messageNames.enterGameError, jqXHR.responseText);
            });
        },

        startGame: function (attrs) {

            var self = this;

            // if attrs were passed in, update chess.vars
            if (attrs) {
                // initialMoveHistory is a string, so we need to get it back into json format before assigning to chess.vars
                attrs.initialMoveHistory = JSON.parse(attrs.initialMoveHistory);
                chess.vars = attrs;
            }

            // kick things off
            self.board.findAllLegalMoves();
            // make sure viewMode is set accordingly based on canMove
            self.boardView.viewMode = !chess.vars.canMove;
            self.boardView.render(chess.vars.perspective);

            // If there is an existing move history, use it to get the game into the current state
            for (var i in chess.vars.initialMoveHistory) {
                var notation = chess.vars.initialMoveHistory[i];
                var moveArray = self.notationConverter.convertNotation(notation, i);
                for (var j in moveArray) {
                    var move = moveArray[j];
                    self.boardView.doMove(move.piece.id, move.toRow, move.toCol, false);
                    self.boardView.updateGameWithLatestMove(notation, move.piece.id, move.toRow, move.toCol);
                }
            }

            self.eventHandler.trigger(self.eventHandler.messageNames.gameEntered);

	   }

    };

    // mixin the backbone event module
    _.extend(obj, Backbone.Events);

    // set up the listeners
    obj.listenTo(obj.eventHandler, obj.eventHandler.messageNames.createGame, obj.createGame);
    obj.listenTo(obj.eventHandler, obj.eventHandler.messageNames.enterGame, obj.enterGame);

    return obj;

};
