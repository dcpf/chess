/*
* Copyright (c) 2000 - 2014 dpf, dpf@theworld.com
*/

/*
Model is in the format:
{
    "recaptcha": {
        "enabled": true,
        "publicKey": "MyPublicKey"
    },
    "appUrl": "http://my.domain.com:8080"
}
*/
const Config = Backbone.Model.extend({
    
    isCaptchaEnabled: function () {
        return this.get('recaptcha').enabled;
    },
    
	getCaptchaPublicKey: function () {
		return this.get('recaptcha').publicKey;
    },

    getAppUrl: function () {
        return this.get('appUrl');
    }

});
