/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.EnterGameView = Backbone.View.extend({

    el: '#enterGameView',

    initialize: function () {

    	var self = this;

    	// assign focus handlers to the text input fields
    	self.$('#player1Email').focus(function() {
    		self.selectRadioButton(0);
    	});
    	self.$('#player2Email').focus(function() {
    		self.selectRadioButton(0);
    	});
    	self.$('#gameID').focus(function() {
    		self.selectRadioButton(1);
    	});
    	self.$('#key').focus(function() {
    		self.selectRadioButton(1);
    	});

    	// assign the click handler to the submit button
    	self.$('#enterGameSubmitButton').click(function() {
    		var action = self.$("input[type='radio'][name='newOrExisting']:checked").val();
    		var params = {action: action};
    		if (action === 'N') {
        		// new
        		params.player1Email = self.$('#player1Email').val().trim();
        		params.player2Email = self.$('#player2Email').val().trim();
    		} else if (action === 'E') {
        		// existing
        		params.gameID = self.$('#gameID').val().trim();
        		params.key = self.$('#key').val().trim();
    		}
    		var deferred = $.post('/enterGame', params);
    		deferred.done(function(res) {
				self.hide();
                // TODO, this should be handled by publishing an event
                startGame(res);
            });
		});

    },

    hide: function () {
        this.$el.hide();
    },

    selectRadioButton: function (num) {
    	if ((num == 0 && !this.$('#gameID').val().trim() && !this.$('#key').val().trim()) ||
        	(num == 1 && !this.$('#player1Email').val().trim() && !this.$('#player2Email').val().trim())) {
        	this.$('input[name="newOrExisting"]')[num].click();
    	}
    }

});
