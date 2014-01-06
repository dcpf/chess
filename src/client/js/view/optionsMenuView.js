/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

'use strict';

var chess = chess || {};

chess.OptionsMenuView = Backbone.View.extend({

    el: '#optionsMenuContainer',

    initialize: function () {

        this.userPrefs = this.options.userPrefs;

        var duration = 200;
        var self = this;

		self.$('#optionsMenuIcon').click(function() {
            self.$('#showLegalMovesValue').text(self._getShowLegalMovesDisplayValue());
            self.$('#optionsMenu').toggle(duration);
        });

        self.$('#showLegalMovesOption').click(function(event) {
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
