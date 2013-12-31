'use strict';

var q = require('q');
var request = require('request');

exports.validateCaptcha = function (ip, captchaChallenge, captchaResponse) {

	var deferred = q.defer();

	if (CONFIG.recaptcha.enabled) {
		request(
			{
				method: 'post',
				url: CONFIG.recaptcha.verifyUrl,
				form: {
					privatekey: CONFIG.recaptcha.privateKey,
					remoteip: ip,
					challenge: captchaChallenge,
					response: captchaResponse
				}
			},
			function (err, res, body) {
				var responseArray = body.split('\n');
				var response = {success: responseArray[0], message: responseArray[1]};
				deferred.resolve(response);
			}
		);
	} else {
		var response = {success: 'true'};
		deferred.resolve(response);
	}

	return deferred;

};
