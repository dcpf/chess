/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

const OptionsMenuView = View.extend({

    initialize: function () {

        this.parent = this.options.parent;
        this.eventHandler = this.options.eventHandler;
        this.user = this.options.user;
        
        this.initTemplate('optionsMenu');

        const duration = 200;
        const self = this;

        self.$('#optionsMenuIcon').click(function() {
            if (self.user.getEmail()) {
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
            self.user.toggleShowLegalMovesEnabled();
            const showLegalMovesValueElement = self.$('#showLegalMovesValue');
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
        return this.user.isShowLegalMovesEnabled() ? 'On' : 'Off';
    }

});
