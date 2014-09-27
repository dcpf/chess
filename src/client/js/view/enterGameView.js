/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var EnterGameView = Backbone.View.extend({

    el: '#enterGameView',

    initialize: function () {

        this.eventHandler = this.options.eventHandler;

        // set up the listeners
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.GAME_ENTERED, this.hide);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.CREATE_GAME_ERROR, this._createGameError);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.ENTER_GAME_ERROR, this._enterGameError);

        var self = this;

        // initalize the captcha
        if (chessAttrs.config.recaptcha.enabled) {
            var elem = document.createElement("script");
            elem.src = "http://www.google.com/recaptcha/api/js/recaptcha_ajax.js";
            document.body.appendChild(elem);
            this._createCaptcha(self);
        }

        // assign click handlers to the radio buttons
        this.$('#newGameRadio').click(function() {
          self._enableNewGameForm();
        });
        this.$('#existingGameRadio').click(function() {
          self._enableEnterGameForm();
        });

        // assign the click handler to the submit button
        this.$('#enterGameSubmitButton').click(function() {
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

        // assign the reset button click handler
        this.$("button[type='reset']").click(function() {
          self.$('#player1Email').val("");
          self.$('#player2Email').val("");
          self.$('#recaptcha_response_field').val("");
          self.$('#gameID').val("");
        });

    },

    hide: function () {
        this.$el.hide();
    },

    show: function (errorMsg) {

        this.$el.show();

        // Enable the correct form based on the selected radio button
        if (this.$('#existingGameRadio').is(':checked')) {
          this._enableEnterGameForm();
        } else {
          this._enableNewGameForm();
        }

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
                chessAttrs.config.recaptcha.publicKey,
                "captcha",
                {
                    theme: "clean"
                }
            );
        }
    },

    /**
    * Enables the "new game" form and disables the "enter game" form
    */
    _enableNewGameForm: function () {
      this.$('#newGameForm fieldset').removeAttr('disabled');
      this.$('#existingGameForm fieldset').attr('disabled', 'disabled');
      this.$('#forgotGameIdLink').addClass('disabledLink');
      this.$('#forgotGameIdLink').off('click');
      this.$('#newGameForm #player1Email').focus();
    },

    /**
    * Enables the "enter game" form and disables the "new game" form
    */
    _enableEnterGameForm: function () {
      var self = this;
      this.$('#newGameForm fieldset').attr('disabled', 'disabled');
      this.$('#existingGameForm fieldset').removeAttr('disabled');
      this.$('#forgotGameIdLink').removeClass('disabledLink');
      this.$('#forgotGameIdLink').click(function() {
        self.eventHandler.trigger(self.eventHandler.messageNames.FORGOT_GAME_ID_LINK_CLICKED);
        return false;
      });
      this.$('#existingGameForm #gameID').focus();
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
