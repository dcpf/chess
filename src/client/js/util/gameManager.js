/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var GameManager = function (attrs) {

    var obj = {

        // passed-in attrs
        eventHandler: attrs.eventHandler,
        gameState: attrs.gameState,
        user: attrs.user,
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

            // If attrs were passed in, update gameState and user
            if (attrs) {
                // These are strings, so we need to convert them back into objects before assigning
                self.gameState.set(JSON.parse(attrs.gameState));
                self.user.set(JSON.parse(attrs.user));
            }

            // If there is an existing move history, use it to get the game into the current state
            var moveHistory = self.gameState.getMoveHistory();
            for (var i in moveHistory) {
                var notation = moveHistory[i];
                self.board.updateGameState(notation);
            }

            // Update the legal moves
            this.board.findAllLegalMoves();

            // make sure viewMode is set accordingly based on canMove
            self.boardView.viewMode = !self.gameState.canMove();

            // render the board
            self.boardView.render(self.gameState.getPerspective());

            self.eventHandler.trigger(self.eventHandler.messageNames.GAME_ENTERED);

        },

        /**
        * Save the move to the server
        */
        saveMove: function (notation) {
            var self = this;
            $("#progressDialog").modal();
            $.post('/saveMove', {
                gameID: self.gameState.getGameID(),
                move: notation
            })
              .done(function(res) {
                self.eventHandler.trigger(self.eventHandler.messageNames.MOVE_SAVED, res);
              })
              .always(function() {
                $("#progressDialog").modal('hide');
              });
        },

        submitFeedback: function (feedback, email) {
          var self = this;
          $("#progressDialog").modal();
          $.post('/feedback', {
            feedback: feedback,
            email: email,
            gameID: self.gameState ? self.gameState.getGameID() : ''
          })
          .always(function() {
            $("#progressDialog").modal('hide');
            self.eventHandler.trigger(self.eventHandler.messageNames.FEEDBACK_SUCCESS);
          });
        },

        /**
        * Find game IDs by the provided email address
        */
        findGamesByEmail: function (email) {
            var self = this;
            $("#progressDialog").modal();
            $.post('/findGamesByEmail', {
              email: email
            })
            .done(function(res) {
              self.eventHandler.trigger(self.eventHandler.messageNames.FOUND_GAMES_BY_EMAIL, res);
            })
            .fail(function(jqXHR) {
              self.eventHandler.trigger(self.eventHandler.messageNames.FIND_GAMES_BY_EMAIL_ERROR, jqXHR.responseText);
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
    obj.listenTo(obj.eventHandler, obj.eventHandler.messageNames.FEEDBACK_SUBMIT, obj.submitFeedback);
    obj.listenTo(obj.eventHandler, obj.eventHandler.messageNames.FIND_GAMES_BY_EMAIL, obj.findGamesByEmail);

    return obj;

};
