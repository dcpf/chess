/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

'use strict';

var chess = chess || {};

chess.OptionsMenuView = Backbone.View.extend({

    el: '#optionsMenuContainer',

    initialize: function () {

        this.eventHandler = this.options.eventHandler;

        var duration = 200;
        var self = this;

		self.$('#optionsMenuIcon').click(function() {
            self.$('#showLegalMovesValue').text(self.getShowLegalMovesDisplayValue());
            self.$('#optionsMenu').toggle(duration);
        });

        self.$('#showLegalMovesOption').click(function(event) {
            event.preventDefault();
            // toggle showLegalMovesEnabled
            chess.user.prefs.showLegalMovesEnabled = !chess.user.prefs.showLegalMovesEnabled;
            self.eventHandler.trigger(self.eventHandler.messageNames.UPDATE_USER_PREFS, 'showLegalMovesEnabled', chess.user.prefs.showLegalMovesEnabled);
            var showLegalMovesValueElement = self.$('#showLegalMovesValue');
            showLegalMovesValueElement.fadeOut(duration, function() {
                showLegalMovesValueElement.text(self.getShowLegalMovesDisplayValue());
                showLegalMovesValueElement.fadeIn(duration, function() {
                    self.$('#optionsMenu').delay(duration).toggle(duration);
                });
            });
        });

    },

    getShowLegalMovesDisplayValue: function () {
        return chess.user.prefs.showLegalMovesEnabled ? 'On' : 'Off';
    }

});
