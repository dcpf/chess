/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var chess = chess || {};

chess.MoveHistoryView = Backbone.View.extend({

    el: '#moveHistoryContainer',

    events: {
        'click .moveHistoryLink': '_handleMoveHistoryLinkClick',
        'click #replayGameLink': '_handleReplayGameLinkClick'
    },

    initialize: function () {
        this.listenTo(chess.moveHistory, 'add', this._updateMoveHistory);
    },

    _updateMoveHistory: function () {
    	var html = '';
    	var count = 1;
        if (chess.moveHistory.models.length > 1) {
            this.$('#replayGameLink').css('visibility', 'visible');
        }
    	for (var i in chess.moveHistory.models) {
    		var notation = chess.moveHistory.models[i].attributes.notation;
            var cell = '<td class="moveHistoryLink ' + i + '">' + notation + '</td>';
    		if (i == 0 || i % 2 == 0) {
    			html += '<tr><td style="text-align: right">' + count + '</td>' + cell;
    			count++;
    		} else {
    			html += cell + '</tr>';
    		}
    	}
    	this.$('#moveHistoryTable tr:first').siblings().remove();
    	this.$('#moveHistoryTable tr:first').after(html);
    },

    /*
    * Publish a message when a moveHistory link is clicked
    */
    _handleMoveHistoryLinkClick: function (event) {
        var $obj = $(event.target);
        var cssClass = $obj.attr('class');
        // The css class should be in the form 'moveHistoryLink #', where # is the move number.
        // We'll grab that, and pass it as an arg with the message.
        var index = cssClass.split(' ')[1];
        chess.eventHandler.trigger(chess.eventHandler.messageNames.moveHistoryLinkClicked, index);
    },

    _handleReplayGameLinkClick: function () {
        chess.eventHandler.trigger(chess.eventHandler.messageNames.replayGameLinkClicked);
    }

});

// This is just a listener, so no need to assign to a variable
new chess.MoveHistoryView();
