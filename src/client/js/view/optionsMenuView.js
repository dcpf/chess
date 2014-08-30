/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

var OptionsMenuView = Backbone.View.extend({

  el: '#optionsMenuContainer',

  initialize: function () {

    this.eventHandler = this.options.eventHandler;
    this.userPrefs = this.options.userPrefs;

    var duration = 200,
      self = this;

	  self.$('#optionsMenuIcon').click(function() {
      if (chessAttrs.user.email) {
        // Only show legalMovesDisplay option if there's a valid user
        self.$('#showLegalMovesValue').text(self._getShowLegalMovesDisplayValue());
        self.$('#showLegalMovesOption').show();
      } else {
        self.$('#showLegalMovesOption').hide();
      }
      self.$('#optionsMenu').toggle(duration);
    });

    self.$('#showLegalMovesOption a').click(function(event) {
      event.preventDefault();
      self.userPrefs.toggleShowLegalMovesEnabled();
      var showLegalMovesValueElement = self.$('#showLegalMovesValue');
      showLegalMovesValueElement.fadeOut(duration, function() {
        showLegalMovesValueElement.text(self._getShowLegalMovesDisplayValue());
        showLegalMovesValueElement.fadeIn(duration, function() {
          self.$('#optionsMenu').delay(duration).toggle(duration);
        });
      });
    });

    self.$('#feedbackOption a').click(function(event) {
      event.preventDefault();
      self.$('#optionsMenu').toggle(duration);
      self.eventHandler.trigger(self.eventHandler.messageNames.FEEDBACK_LINK_CLICKED);
    });

  },

  _getShowLegalMovesDisplayValue: function () {
    return this.userPrefs.isShowLegalMovesEnabled() ? 'On' : 'Off';
  }

});
