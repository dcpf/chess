/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

var OptionsMenuView = Backbone.View.extend({

    el: '#optionsMenuContainer',

    initialize: function () {

        this.userPrefs = this.options.userPrefs;

        var duration = 200;
        var self = this;

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

    },

    _getShowLegalMovesDisplayValue: function () {
        return this.userPrefs.isShowLegalMovesEnabled() ? 'On' : 'Off';
    }

});
