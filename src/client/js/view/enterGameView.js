/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.EnterGameView = Backbone.View.extend({

    el: '#enterGameView',

    initialize: function () {

        this.eventHandler = this.options.eventHandler;
        this.gameManager = this.options.gameManager;
        var self = this;

        // initalize the captcha
        if (chess.config.recaptcha.enabled) {
            document.write('<script src="http://www.google.com/recaptcha/api/js/recaptcha_ajax.js"><\/script>');
            self._createCaptcha(self);
        }

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
    		if (action === 'N') {
                // new
                params.player1Email = self.$('#player1Email').val().trim();
                params.player2Email = self.$('#player2Email').val().trim();
                if (window.Recaptcha) {
                    params.captchaResponse = Recaptcha.get_response();
                    params.captchaChallenge = Recaptcha.get_challenge();
                }
                var deferred = self.gameManager.createGame(params);
                deferred.done(function() {
                    self.hide();
                });
                deferred.fail(function() {
                    if (window.Recaptcha) {
                        Recaptcha.reload();
                    }
                });
    		} else if (action === 'E') {
        		// existing
        		params.gameID = self.$('#gameID').val().trim();
        		params.key = self.$('#key').val().trim();
                var deferred = self.gameManager.enterGame(params);
                deferred.done(function() {
                    self.hide();
                });
    		}

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

    /*
    * Create the captcha UI. Must wait until Google's recaptcha_ajax.js has loaded before the Recaptcha
    * object is available, so we use setTimeout() within the method, until the object is available.
    */
    _createCaptcha: function (self) {
        if (!window.Recaptcha) {
            // If the Recaptcha object is not yet available, try again.
            setTimeout(function(){self._createCaptcha(self)}, 100);
        } else {
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
