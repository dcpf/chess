/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

const PlayerInfoView = View.extend({

    initialize: function () {
        
        // set the passed-in options
        this.parent = this.options.parent;
        this.eventHandler = this.options.eventHandler;
        this.gameState = this.options.gameState;

        const data = {
            whiteEmail: this.gameState.getWhiteEmail(),
            blackEmail: this.gameState.getBlackEmail()
        };
        this.initTemplate('playerInfo', data);

        // Register the event listeners
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.PLAYER_ONLINE, this._showOnline);
        this.listenTo(this.eventHandler, this.eventHandler.messageNames.PLAYER_OFFLINE, this._showOffline);

        // Init the tooltips
        this.$('[data-toggle="tooltip"]').tooltip({placement: 'right', trigger: 'manual hover'});

    },

    _showOnline: function (email) {
        this._updateOnlineStatus(email, 'online');
    },

    _showOffline: function (email) {
        this._updateOnlineStatus(email, 'offline');
    },

    /**
    * Update/render the online status indicator and show a tertiary tooltip.
    */
    _updateOnlineStatus: function (email, status) {
        const self = this,
            $elem = this.$('div:contains(' + email + ') > [class~="onlineStatus"]');
        $elem.removeClass('online offline');
        $elem.addClass(status);
        $elem.show(0, function(){
            clearTimeout(self._tooltipTimeout);
            $elem.attr('data-original-title', email + ' is ' + status);
            // If the initial status is offline, don't auto-render the tooltip.
            if (status === 'offline' && !self._tooltipTimeout) {
                return;
            }
            $elem.tooltip().on('shown.bs.tooltip', function () {
                self._tooltipTimeout = setTimeout(function(){$elem.tooltip('hide');}, 2000);
            });
            $elem.tooltip('show');
        });
    }

});
