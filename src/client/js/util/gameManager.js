/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.GameManager = Backbone.Model.extend({

	initialize: function (attrs) {
		this.eventHandler = attrs.eventHandler;
        this.notationConverter = attrs.notationConverter;
        this.board = attrs.board;
    },

	createGame: function (params) {

		var self = this;

    	var deferred = $.post('/createGame', params);
    	deferred.done(function(res) {
            self.startGame(res);
            self.eventHandler.trigger(self.eventHandler.messageNames.gameCreated);
        });
        deferred.fail(function(jqXHR) {
            self.eventHandler.trigger(self.eventHandler.messageNames.error, jqXHR.responseText);
        });

        return deferred;

	},

	enterGame: function (params) {

		var self = this;

		var deferred = $.post('/enterGame', params);
    	deferred.done(function(res) {
            self.startGame(res);
        });
        deferred.fail(function(jqXHR) {
            self.eventHandler.trigger(self.eventHandler.messageNames.error, jqXHR.responseText);
        });

        return deferred;

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
    	chess.appContext.initializeGame(chess.vars.canMove);
    	self.board.findAllLegalMoves();
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

    	$('#whiteEmail').html(chess.vars.whiteEmail);
    	$('#blackEmail').html(chess.vars.blackEmail);

    	// Show the game
    	$('#playGameView').show();

	}

});
