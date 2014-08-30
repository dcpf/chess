/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

/*
* View controller for rendering the feedback dialog
*/
var FeedbackDialogView = Backbone.View.extend({

    el: '#feedbackDialog',

    initialize: function () {

        var self = this;
        this.eventHandler = this.options.eventHandler;
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.FEEDBACK_LINK_CLICKED, this._renderDialog);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.FEEDBACK_SUCCESS, this._renderSuccess);

        self.$('#feedbackSubmitButton').click(function() {
          var feedback = self.$("#feedbackText").val();
          var email = self.$("#feedbackEmail").val();
          self.eventHandler.trigger(self.eventHandler.messageNames.FEEDBACK_SUBMIT, feedback, email);
        });

    },

    _renderDialog: function () {
        var feedbackTextField = this.$('#feedbackText'),
          feedbackEmailField = this.$('#feedbackEmail');
        this.$el.modal();
        feedbackTextField.val('');
        this.$('#feedbackSuccess').hide();
        this.$('#feedbackForm').show();
        if (!feedbackEmailField.val()) {
          feedbackEmailField.val(chessAttrs.user ? chessAttrs.user.email : '');
        }
        feedbackTextField.focus();
    },

    _renderSuccess: function (res) {
        this.$('#feedbackForm').hide();
        this.$('#feedbackSuccess').show();
    }

});
