/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

chess.EnterGameView = Backbone.View.extend({

    el: '#enterGameView',

    initialize: function () {

        this.eventHandler = this.options.eventHandler;

        // set up the listeners
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.GAME_ENTERED, this.hide);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.CREATE_GAME_ERROR, this._createGameError);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.ENTER_GAME_ERROR, this._enterGameError);

        var self = this;

        // initalize the captcha
        if (chess.config.recaptcha.enabled) {
            document.write('<script src="http://www.google.com/recaptcha/api/js/recaptcha_ajax.js"><\/script>');
            self._createCaptcha(self);
        }

        // assign click handlers to the radio buttons
        self.$('#newGameRadio').click(function() {
          self.$('#newGameForm fieldset').removeAttr('disabled');
          self.$('#captcha').css('opacity', '1');
          self.$('#existingGameForm fieldset').attr('disabled', 'disabled');
          self.$('#newGameForm #player1Email').focus();
        });
        self.$('#existingGameRadio').click(function() {
          self.$('#newGameForm fieldset').attr('disabled', 'disabled');
          self.$('#captcha').css('opacity', '.25');
          self.$('#existingGameForm fieldset').removeAttr('disabled');
          self.$('#existingGameForm #gameID').focus();
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
                self.eventHandler.trigger(self.eventHandler.messageNames.CREATE_GAME, params);
            } else if (action === 'E') {
                // existing
                params.gameID = self.$('#gameID').val().trim();
                self.eventHandler.trigger(self.eventHandler.messageNames.ENTER_GAME, params);
            }

		    });

    },

    hide: function () {
        this.$el.hide();
    },

    show: function (errorMsg) {
        this.$el.show();
        this.$('#newGameForm #player1Email').focus();
        if (errorMsg) {
            this.eventHandler.trigger(this.eventHandler.messageNames.ERROR, errorMsg);
        }
    },

    /*
    * Create the captcha UI. Must wait until Google's recaptcha_ajax.js has loaded before the Recaptcha
    * object is available, so we use setTimeout() within the method, until the object is available.
    */
    _createCaptcha: function (self) {
        if (!window.Recaptcha) {
            // If the Recaptcha object is not yet available, try again.
            setTimeout(function(){self._createCaptcha(self);}, 100);
        } else {
            Recaptcha.create(
                chess.config.recaptcha.publicKey,
                "captcha",
                {
                    theme: "clean"
                }
            );
        }
    },

    _createGameError: function (errMsg) {
        this.eventHandler.trigger(this.eventHandler.messageNames.ERROR, errMsg);
        if (window.Recaptcha) {
            Recaptcha.reload();
        }
    },

    _enterGameError: function (errMsg) {
        this.eventHandler.trigger(this.eventHandler.messageNames.ERROR, errMsg);
    }


});
