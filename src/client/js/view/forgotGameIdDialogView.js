/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

/*
* View controller for rendering the 'forgot game ID' dialog
*/
const ForgotGameIdDialogView = View.extend({

    initialize: function () {

        this.eventHandler = this.options.eventHandler;

        this.listenTo(this.eventHandler, this.eventHandler.messageNames.FORGOT_GAME_ID_LINK_CLICKED, this._renderDialog);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.FOUND_GAMES_BY_EMAIL, this._renderSuccess);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.FIND_GAMES_BY_EMAIL_ERROR, this._renderError);

        this.initDialog('forgotGameIdDialog');

        var self = this;
        self.$('#forgotGameIdSubmitButton').click(function() {
          var email = self.$("#forgotGameIdEmail").val();
          self.eventHandler.trigger(self.eventHandler.messageNames.FIND_GAMES_BY_EMAIL, email);
        });

    },

    _renderDialog: function () {
        this.$el.modal();
        this.$('#forgotGameIdForm').show();
        this.$('#forgotGameIdEmail').focus();
        this.$('#forgotGameIdSuccess').hide();
        this.$('#forgotGameIdError').hide();
    },

    _renderSuccess: function (res) {
        this.$('#forgotGameIdForm').hide();
        this.$('#forgotGameIdSuccess').show();
        this.$('.forgotGameIdEmail').text(res.email);
    },

    _renderError: function (errMsg) {
      this.$('#forgotGameIdForm').show();
      this.$('#forgotGameIdSuccess').hide();
      this.$('#forgotGameIdError').text(errMsg);
      this.$('#forgotGameIdError').show();
    }

});
