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

        // set the passed-in options
        this.moveHistory = this.options.moveHistory;
        this.eventHandler = this.options.eventHandler;

        // set up the listener
        this.listenTo(this.moveHistory, 'add', this._updateMoveHistory);

    },

    _updateMoveHistory: function () {
    	var html = '';
    	var count = 1;
        if (this.moveHistory.models.length > 1) {
            this.$('#replayGameLink').css('visibility', 'visible');
        }
    	for (var i in this.moveHistory.models) {
    		var notation = this.moveHistory.models[i].attributes.notation;
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
    _handleMoveHistoryLinkClick: function (e) {
        var $obj = $(e.target);
        var cssClass = $obj.attr('class');
        // The css class should be in the form 'moveHistoryLink #', where # is the move number.
        // We'll grab that, and pass it as an arg with the message.
        var index = cssClass.split(' ')[1];
        this.eventHandler.trigger(this.eventHandler.messageNames.moveHistoryLinkClicked, index);
        return false;
    },

    _handleReplayGameLinkClick: function () {
        this.eventHandler.trigger(this.eventHandler.messageNames.replayGameLinkClicked);
        return false;
    }

});
