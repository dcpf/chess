/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

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

    /*
    * Called whenever a move is added to the moveHistory collection
    */
    _updateMoveHistory: function () {

        // first, see how many moves are in the history
        var numMoves = this.moveHistory.models.length;

        // if two or more moves, show the auto-replay link
        if (numMoves > 1) {
            this.$('#replayGameLink').css('visibility', 'visible');
        }

        // get the latest move from the history, and update the table
        var index = numMoves - 1;
        var notation = this.moveHistory.models[index].attributes.notation;
        var cell = '<td class="moveHistoryLink ' + index + '">' + notation + '</td>';
        if (index === 0 || index % 2 === 0) {
            // white's move
            var count = (parseInt(index, 10) + 2)/2;
            var html = '<tr><td style="text-align: right">' + count + '</td>' + cell + '</tr>';
            this.$('#moveHistoryTable tr:last').after(html);
            this.$('#moveHistoryTable th:eq(1)').removeClass('currentPlayer');
            this.$('#moveHistoryTable th:eq(2)').addClass('currentPlayer');
        } else {
            // black's move
            this.$('#moveHistoryTable td:last').after(cell);
            this.$('#moveHistoryTable th:eq(1)').addClass('currentPlayer');
            this.$('#moveHistoryTable th:eq(2)').removeClass('currentPlayer');
        }

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
        this.eventHandler.trigger(this.eventHandler.messageNames.MOVE_HISTORY_LINK_CLICKED, index);
        return false;
    },

    _handleReplayGameLinkClick: function () {
        this.eventHandler.trigger(this.eventHandler.messageNames.REPLAY_GAME_LINK_CLICKED);
        return false;
    }

});
