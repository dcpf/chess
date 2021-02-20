/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

const EnterGameView = View.extend({

    initialize: function () {

        this.parent = this.options.parent;
        this.eventHandler = this.options.eventHandler;
        this.config = this.options.config;

        // set up the listeners
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.GAME_ENTERED, this.hide);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.CREATE_GAME_ERROR, this._createGameError);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.ENTER_GAME_ERROR, this._enterGameError);
        
        const data = {
            siteKey: this.config.getCaptchaPublicKey()
        };
        this.initTemplate('enterGame', data);

        const self = this;

        // initalize the captcha
        if (this.config.isCaptchaEnabled()) {
            const elem = document.createElement("script");
            elem.src = "https://www.google.com/recaptcha/api.js";
            document.body.appendChild(elem);
        }

        // assign click handlers to the radio buttons and forgotGameId link
        this.$('#newGameRadio').click(function() {
          self._enableNewGameForm();
        });
        this.$('#existingGameRadio').click(function() {
          self._enableEnterGameForm();
        });
        this.$('#forgotGameIdLink').click(function() {
            self.eventHandler.trigger(self.eventHandler.messageNames.FORGOT_GAME_ID_LINK_CLICKED);
            return false;
        });

        // assign the click handler to the submit button
        this.$('#enterGameSubmitButton').click(function() {
            const action = self.$("input[type='radio'][name='newOrExisting']:checked").val();
            if (action === 'N') {
                // new
                const params = {};
                params.player1Email = self.$('#player1Email').val().trim();
                params.player2Email = self.$('#player2Email').val().trim();
                if (window.grecaptcha) {
                    params.captchaResponse = grecaptcha.getResponse();
                }
                self.eventHandler.trigger(self.eventHandler.messageNames.CREATE_GAME, params);
            } else if (action === 'E') {
                // existing
                const gameID = self.$('#gameID').val().trim();
                self.eventHandler.trigger(self.eventHandler.messageNames.ENTER_GAME, gameID, true);
            }
        });

        // assign the reset button click handler
        this.$("button[type='reset']").click(function() {
          self.$('#player1Email').val("");
          self.$('#player2Email').val("");
          self.$('#gameID').val("");
        });
        
        // click submit when enter key is pressed
        this.$el.keypress(function(event) {
            if (event.keyCode === 13) {
                self.$('#enterGameSubmitButton').click();
            }
        });

    },

    hide: function () {
        this.parent.hide();
    },

    render: function (errorMsg) {

        this.parent.show();

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

    /**
    * Enables the "new game" form and disables the "enter game" form
    */
    _enableNewGameForm: function () {
        this.$('#existingGameForm').hide(200);
        this.$('#newGameForm').show(200);
        if (this.config.isCaptchaEnabled()) {
            this.$('#loadingCaptchaText').show();
            this.$('.g-recaptcha').show();
        } else {
            this.$('#loadingCaptchaText').hide();
            this.$('.g-recaptcha').hide();
        }
        this.$('#newGameForm #player1Email').focus();
    },

    /**
    * Enables the "enter game" form and disables the "new game" form
    */
    _enableEnterGameForm: function () {
        this.$('#newGameForm').hide(200);
        this.$('#existingGameForm').show(200);
        this.$('#existingGameForm #gameID').focus();
    },

    _createGameError: function (errMsg) {
        this.eventHandler.trigger(this.eventHandler.messageNames.ERROR, errMsg);
        if (window.grecaptcha) {
            grecaptcha.reset();
        }
    },

    _enterGameError: function (errMsg) {
        this.eventHandler.trigger(this.eventHandler.messageNames.ERROR, errMsg);
    }

});
