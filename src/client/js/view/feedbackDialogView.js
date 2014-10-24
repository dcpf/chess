/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

/*
* View controller for rendering the feedback dialog
*/
var FeedbackDialogView = Backbone.View.extend({

    initialize: function () {

        var self = this;
        this.parent = this.options.parent;
        this.eventHandler = this.options.eventHandler;
        this.user = this.options.user;
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.FEEDBACK_LINK_CLICKED, this._renderDialog);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.FEEDBACK_SUCCESS, this._renderSuccess);
        
        // Create and attach the template
        var template = _.template($('#feedbackDialogTemplate').html());
        this.$el.html(template());
        this.parent.append(this.$el);

        this.$('#feedbackSubmitButton').click(function() {
          var feedback = self.$("#feedbackText").val();
          var email = self.$("#feedbackEmail").val();
          self.eventHandler.trigger(self.eventHandler.messageNames.FEEDBACK_SUBMIT, feedback, email);
        });

    },

    _renderDialog: function () {
        var feedbackTextField = this.$('#feedbackText'),
          feedbackEmailField = this.$('#feedbackEmail');
        this.parent.modal();
        feedbackTextField.val('');
        this.$('#feedbackSuccess').hide();
        this.$('#feedbackForm').show();
        if (!feedbackEmailField.val()) {
          feedbackEmailField.val(this.user ? this.user.getEmail() : '');
        }
        feedbackTextField.focus();
    },

    _renderSuccess: function (res) {
        this.$('#feedbackForm').hide();
        this.$('#feedbackSuccess').show();
    }

});
