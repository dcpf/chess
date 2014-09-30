/*
* Copyright (c) 2000 - 2013 dpf, dpf@theworld.com
*/

/*
Model is in the format:
{
    "email": "email@example.com",
    "prefs": {
        "showLegalMovesEnabled": true
    }
}
*/
var User = Backbone.Model.extend({
    
    getEmail: function () {
        return this.get('email');
    },
    
	/**
	* Returns true if showLegalMovesEnabled is either true or not set.
	* Returns false if showLegalMovesEnabled is set to false.
	*/
	isShowLegalMovesEnabled: function () {
		return this.get('prefs').showLegalMovesEnabled !== false;
    },

    /**
    * Toggle showLegalMovesEnabled from true to false or visa-versa
    */
    toggleShowLegalMovesEnabled: function () {
        var bool = !this.isShowLegalMovesEnabled();
		this.get('prefs').showLegalMovesEnabled = bool;
		this._updateUserPrefs('showLegalMovesEnabled', bool);
    },

    _updateUserPrefs: function (name, value) {
        $.post('/updateUserPrefs', {
            userEmail: this.get('email'),
            name: name,
            value: value
        });
    }

});
