/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

'use strict';

var chess = chess || {};

chess.OptionsMenuView = Backbone.View.extend({

    el: '#optionsMenuContainer',

    initialize: function () {

        var duration = 200;
        var self = this;

		self.$('#optionsMenuIcon').click(function() {
            self.$('#showLegalMovesValue').text(self.getShowLegalMovesDisplayValue());
            self.$('#optionsMenu').toggle(duration);
        });

        self.$('#showLegalMovesOption').click(function(event) {
            event.preventDefault();
            // toggle showLegalMovesEnabled
            // TODO: set this as a user pref
            chess.vars.showLegalMovesEnabled = !chess.vars.showLegalMovesEnabled;
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
        return chess.vars.showLegalMovesEnabled ? 'On' : 'Off';
    }

});
