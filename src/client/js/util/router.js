var Router = Backbone.Router.extend({
    
    initialize: function (attrs) {
        this.gameManager = attrs.gameManager;
    },

    routes: {
        "play/:gameID": "play",
        // everything else renders the enter screen
        "*path": "enterScreen"
    },

    //
    // route methods
    //
    
    enterScreen: function () {
        var gameID = this._getGameIdFromURL();
        if (gameID) {
            this.gameManager.enterGame(gameID);
        } else {
            this.gameManager.renderEnterScreen();
        }
    },
    
    play: function (gameID) {
        this.gameManager.enterGame(gameID);
    },
    
    //
    // Convenience/utility functions
    //
    
    navigateToPlay: function (gameID) {
        this.navigate('/play/' + gameID);
    },
    
    //
    // private functions
    //
    
    /**
    * This supports passing the gameID as a URL param as in: ?gameID=531d080566b22a611f1-82197
    * This is deprecated and has been replaced by /play/531d080566b22a611f1-82197, but we need
    * to continue to support it for backwards compatability.
    */
    _getGameIdFromURL: function () {
        var gameID;
        var queryString = window.location.search;
        if (queryString) {
            queryString = queryString.replace(/^\?/, '');
            var pairs = queryString.split('&');
            if (pairs) {
                for (var i = 0; i < pairs.length; i++) {
                    var pair = pairs[i].split('=');
                    var key = pair[0];
                    if (key === 'gameID') {
                        gameID = pair[1];
                        break;
                    }
                }
            }
        }
        return gameID;
    }

});
