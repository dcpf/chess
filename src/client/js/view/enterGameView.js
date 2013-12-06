/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.EnterGameView = Backbone.View.extend({

    el: '#enterGameView',

    initialize: function () {

        this.eventHandler = this.options.eventHandler;
        var self = this;

        // initalize the captcha
        self._createCaptcha();

    	// assign focus handlers to the text input fields
    	self.$('#player1Email').focus(function() {
            self._selectRadioButton(0);
    	});
    	self.$('#player2Email').focus(function() {
            self._selectRadioButton(0);
    	});
    	self.$('#gameID').focus(function() {
            self._selectRadioButton(1);
    	});
    	self.$('#key').focus(function() {
            self._selectRadioButton(1);
    	});

    	// assign the click handler to the submit button
    	self.$('#enterGameSubmitButton').click(function() {
    		var action = self.$("input[type='radio'][name='newOrExisting']:checked").val();
    		var params = {action: action};
            var endPoint = '';
            var reloadCaptcha = false;
    		if (action === 'N') {
                // new
                params.player1Email = self.$('#player1Email').val().trim();
                params.player2Email = self.$('#player2Email').val().trim();
                if (window.Recaptcha) {
                    params.captchaResponse = Recaptcha.get_response();
                    params.captchaChallenge = Recaptcha.get_challenge();
                }
                endPoint = '/createGame';
                reloadCaptcha = true;
    		} else if (action === 'E') {
        		// existing
        		params.gameID = self.$('#gameID').val().trim();
        		params.key = self.$('#key').val().trim();
                endPoint = '/enterGame';
    		}

            // Post the data
            // TODO, all of this should probably all be handled by publishing an event
    		var deferred = $.post(endPoint, params);
    		deferred.done(function(res) {
                self.hide();
                startGame(res);
                if (action === 'N') {
                    self.eventHandler.trigger(self.eventHandler.messageNames.gameCreated);
                }
            });
            deferred.fail(function(jqXHR) {
                self.eventHandler.trigger(self.eventHandler.messageNames.error, jqXHR.responseText);
                if (reloadCaptcha && window.Recaptcha) {
                    Recaptcha.reload();
                }
            });

		});

    },

    hide: function () {
        this.$el.hide();
    },

    show: function (errorMsg) {
        this.$el.show();
        if (errorMsg) {
            this.eventHandler.trigger(this.eventHandler.messageNames.error, errorMsg);
        }
    },

    _selectRadioButton: function (num) {
    	if ((num == 0 && !this.$('#gameID').val().trim() && !this.$('#key').val().trim()) ||
        	(num == 1 && !this.$('#player1Email').val().trim() && !this.$('#player2Email').val().trim())) {
        	this.$('input[name="newOrExisting"]')[num].click();
    	}
    },

    _createCaptcha: function() {
        if (window.Recaptcha) {
            Recaptcha.create(
                chess.config.recaptcha.publicKey,
                "captcha",
                {
                    theme: "clean"
                }
            );
        }
    }

});
