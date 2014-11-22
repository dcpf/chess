/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

/*
* View controller for rendering the feedback dialog
*/
var FeedbackDialogView = View.extend({

    initialize: function () {

        this.parent = this.options.parent;
        this.eventHandler = this.options.eventHandler;
        this.user = this.options.user;
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.FEEDBACK_LINK_CLICKED, this._renderDialog);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.FEEDBACK_SUCCESS, this._renderSuccess);

        var data = {email: this.user ? this.user.getEmail() : ''};
        this.initTemplate('feedbackDialog', data);

        var self = this;
        this.$('#feedbackSubmitButton').click(function() {
          var feedback = self.$("#feedbackText").val();
          var email = self.$("#feedbackEmail").val();
          self.eventHandler.trigger(self.eventHandler.messageNames.FEEDBACK_SUBMIT, feedback, email);
        });

    },

    _renderDialog: function () {
        this.$('#feedbackSuccess').hide();
        this.$('#feedbackForm').show();
        var $feedbackTextField = this.$('#feedbackText');
        $feedbackTextField.val('');
        $feedbackTextField.focus();
        this.parent.modal();
    },

    _renderSuccess: function (res) {
        this.$('#feedbackForm').hide();
        this.$('#feedbackSuccess').show();
    }

});
