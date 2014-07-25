/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

var UserPrefs = Backbone.Model.extend({

	/**
	* Returns true if showLegalMovesEnabled is either true or not set.
	* Returns false if showLegalMovesEnabled is set to false.
	*/
	isShowLegalMovesEnabled: function () {
		return chessAttrs.user.prefs.showLegalMovesEnabled !== false;
    },

    /**
    * Toggle showLegalMovesEnabled from true to false or visa-versa
    */
    toggleShowLegalMovesEnabled: function () {
        var bool = !this.isShowLegalMovesEnabled();
		chessAttrs.user.prefs.showLegalMovesEnabled = bool;
		this._updateUserPrefs('showLegalMovesEnabled', bool);
    },

    _updateUserPrefs: function (name, value) {
        $.post('/updateUserPrefs', {
            userEmail: chessAttrs.user.email,
            name: name,
            value: value
        });
    }

});
