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
            $.post('/createGame', params)
              .done(function(res) {
                self.startGame(res);
                self.eventHandler.trigger(self.eventHandler.messageNames.GAME_CREATED);
              })
              .fail(function(jqXHR) {
                self.eventHandler.trigger(self.eventHandler.messageNames.CREATE_GAME_ERROR, jqXHR.responseText);
              })
              .always(function() {
                $("#progressDialog").modal('hide');
              });
        },

        enterGame: function (params) {
            var self = this;
            $("#progressDialog").modal();
            $.post('/enterGame', params)
              .done(function(res) {
                self.startGame(res);
              })
              .fail(function(jqXHR) {
                self.eventHandler.trigger(self.eventHandler.messageNames.ENTER_GAME_ERROR, jqXHR.responseText);
              })
              .always(function() {
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
            $.post('/saveMove', {
                gameID: chess.vars.gameID,
                move: notation
            })
              .done(function(res) {
                self.eventHandler.trigger(self.eventHandler.messageNames.MOVE_SAVED, res);
              })
              .always(function() {
                $("#progressDialog").modal('hide');
              });
        },

        /**
        * Find game IDs by the provided email address
        */
        findGameIdsByEmail: function (email) {
            var self = this;
            $("#progressDialog").modal();
            $.post('/findGameIdsByEmail', {
              email: email
            })
            .done(function(res) {
              if (res.status === 'no games found') {
                self.eventHandler.trigger(self.eventHandler.messageNames.FOUND_NO_GAME_IDS_BY_EMAIL, res);
              } else {
                // assume it was success
                self.eventHandler.trigger(self.eventHandler.messageNames.FOUND_GAME_IDS_BY_EMAIL, res);
              }
            })
            .always(function() {
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
    obj.listenTo(obj.eventHandler, obj.eventHandler.messageNames.FIND_GAME_IDS_BY_EMAIL, obj.findGameIdsByEmail);

    return obj;

};
