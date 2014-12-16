/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var GameManager = function (attrs) {

    var obj = {

        // passed-in attrs
        eventHandler: attrs.eventHandler,
        appContext: attrs.appContext,
        
        renderEnterScreen: function (errorMsg) {
            var enterScreenContext = this.appContext.getEnterScreenContext();
            enterScreenContext.render(errorMsg);
            // Hide the game if it's already been rendered. Should we do this via an event?
            var gameContext = this.appContext.getGameContext();
            if (gameContext) {
                gameContext.hide();
            }
        },

        createGame: function (params) {
            var self = this;
            $("#progressDialog").modal();
            $.post('/createGame', params)
              .done(function(res) {
                var gameContext = self.appContext.getGameContext(res.user, res.gameState);
                gameContext.render(true);
                self.eventHandler.trigger(self.eventHandler.messageNames.GAME_CREATED);
              })
              .fail(function(jqXHR) {
                self.eventHandler.trigger(self.eventHandler.messageNames.CREATE_GAME_ERROR, jqXHR.responseText);
              })
              .always(function() {
                $("#progressDialog").modal('hide');
              });
        },
        
        /**
        * @param gameID
        * @param doNavigate - pass in true to tell the router to update the URL
        */
        enterGame: function (gameID, doNavigate) {
            var self = this;
            $("#progressDialog").modal();
            $.post('/enterGame', {
                gameID: gameID
            })
            .done(function(res) {
                var gameContext = self.appContext.getGameContext(res.user, res.gameState);
                gameContext.render(doNavigate);
            })
            .fail(function(jqXHR) {
                self.eventHandler.trigger(self.eventHandler.messageNames.ENTER_GAME_ERROR, jqXHR.responseText);
                self.renderEnterScreen(jqXHR.responseText);
            })
            .always(function() {
                $("#progressDialog").modal('hide');
            });
        },

        /**
        * Save the move to the server
        */
        saveMove: function (notation) {
            var self = this;
            $("#progressDialog").modal();
            var gameContext = self.appContext.getGameContext();
            var gameID = gameContext.getGameID();
            $.post('/saveMove', {
                gameID: gameID,
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
            var gameContext = self.appContext.getGameContext();
            var gameID = gameContext ? gameContext.getGameID() : '';
            $.post('/feedback', {
                feedback: feedback,
                email: email,
                gameID: gameID
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
