'use strict';

var q = require('q');
var request = require('request');

exports.validateCaptcha = function (ip, captchaChallenge, captchaResponse) {

	var deferred = q.defer();

	if (GLOBAL.CONFIG.recaptcha.enabled) {
		request(
			{
				method: 'post',
				url: GLOBAL.CONFIG.recaptcha.verifyUrl,
				form: {
					privatekey: GLOBAL.CONFIG.recaptcha.privateKey,
					remoteip: ip,
					challenge: captchaChallenge,
					response: captchaResponse
				}
			},
			function (err, res, body) {
                if (err) {
                    deferred.reject(err);
                } else {
                    var responseArray = body.split('\n');
                    var success = responseArray[0];
                    //var msg = responseArray[1];
                    if (success === 'true') {
                        deferred.resolve();
                    } else {
                        deferred.reject(new Error('Incorrect captcha. Please try again.'));
                    }
                }
			}
		);
	} else {
		deferred.resolve();
	}

	return deferred.promise;

};
