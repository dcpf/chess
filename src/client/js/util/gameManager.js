/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

chess.GameManager = function (attrs) {

    var obj = {

        // passed-in attrs
        eventHandler: attrs.eventHandler,
        board: attrs.board,
        boardView: attrs.boardView,

        createGame: function (params) {
            var self = this;
            $("#progressDialog").modal();
            var deferred = $.post('/createGame', params);
            deferred.done(function(res) {
                self.startGame(res);
                self.eventHandler.trigger(self.eventHandler.messageNames.GAME_CREATED);
            });
            deferred.fail(function(jqXHR) {
                self.eventHandler.trigger(self.eventHandler.messageNames.CREATE_GAME_ERROR, jqXHR.responseText);
            });
            deferred.always(function() {
                $("#progressDialog").modal('hide');
            });
        },

        enterGame: function (params) {
            var self = this;
            $("#progressDialog").modal();
            var deferred = $.post('/enterGame', params);
            deferred.done(function(res) {
                self.startGame(res);
            });
            deferred.fail(function(jqXHR) {
                self.eventHandler.trigger(self.eventHandler.messageNames.ENTER_GAME_ERROR, jqXHR.responseText);
            });
            deferred.always(function() {
                $("#progressDialog").modal('hide');
            });
        },

        startGame: function (attrs) {

            var self = this;

            // If attrs were passed in, update chess.vars and chess.user
            if (attrs) {
                // These are strings, so we need to convert them back into objects before assigning
                chess.vars = JSON.parse(attrs.chessVars);
                chess.user = JSON.parse(attrs.user);
            }

            // If there is an existing move history, use it to get the game into the current state
            for (var i in chess.vars.initialMoveHistory) {
                var notation = chess.vars.initialMoveHistory[i];
                self.board.updateGameState(notation);
            }

            // Update the legal moves
            this.board.findAllLegalMoves();

            // make sure viewMode is set accordingly based on canMove
            self.boardView.viewMode = !chess.vars.canMove;

            // render the board
            self.boardView.render(chess.vars.perspective);

            self.eventHandler.trigger(self.eventHandler.messageNames.GAME_ENTERED);

        },

        /**
        * Save the move to the server
        */
        saveMove: function (notation) {
            var self = this;
            $("#progressDialog").modal();
            var deferred = $.post('/saveMove', {
                gameID: chess.vars.gameID,
                key: chess.vars.key,
                move: notation
            });
            deferred.done(function(res) {
                self.eventHandler.trigger(self.eventHandler.messageNames.MOVE_SAVED, res);
            });
            deferred.always(function() {
                $("#progressDialog").modal('hide');
            });
        }

    };

    // mixin the backbone event module
    _.extend(obj, Backbone.Events);

    // set up the listeners
    obj.listenTo(obj.eventHandler, obj.eventHandler.messageNames.CREATE_GAME, obj.createGame);
    obj.listenTo(obj.eventHandler, obj.eventHandler.messageNames.ENTER_GAME, obj.enterGame);
    obj.listenTo(obj.eventHandler, obj.eventHandler.messageNames.SAVE_MOVE, obj.saveMove);

    return obj;

};
