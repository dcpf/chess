/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

/*
Model is in the format:
{
    "gameID": "53d8433807d785e9f2e0e062-43514",
    "initialMoveHistory": [],
    "perspective": "B",
    "canMove": true,
    "whiteEmail": "dpf@theworld.com",
    "blackEmail": "david.piersol.freedman@gmail.com",
    "error": ""
}
*/
var GameState = Backbone.Model.extend({
    
    getGameID: function () {
        return this.get('gameID');
    },
    
	getMoveHistory: function () {
		return this.get('initialMoveHistory');
    },
    
    getPerspective: function () {
        return this.get('perspective');
    },
    
    canMove: function () {
        return this.get('canMove');
    },
    
    getWhiteEmail: function () {
        return this.get('whiteEmail');
    },
    
    getBlackEmail: function () {
        return this.get('blackEmail');
    },
    
    getError: function () {
        return this.get('error');
    },
    
    setCanMove: function (bool) {
        this.set('canMove', bool);
    }
    

});