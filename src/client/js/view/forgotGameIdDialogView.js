/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

/*
* View controller for rendering the 'forgot game ID' dialog
*/
chess.ForgotGameIdDialogView = Backbone.View.extend({

    el: '#forgotGameIdDialog',

    initialize: function () {

        this.eventHandler = this.options.eventHandler;
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.FORGOT_GAME_ID_LINK_CLICKED, this._renderDialog);

        var self = this;
        self.$('#forgotGameIdButton').click(function() {
          var email = self.$("#forgotGameIdEmail").val();
          self.eventHandler.trigger(self.eventHandler.messageNames.FIND_GAME_IDS_BY_EMAIL, email);
        });

    },

    _renderDialog: function () {
        this.$el.modal();
    }

});
