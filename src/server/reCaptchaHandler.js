'use strict';

var q = require('q');
var request = require('request');

exports.validateCaptcha = function (ip, captchaResponse) {

	var deferred = q.defer();

	if (!captchaResponse.trim()) {
		deferred.reject(new Error('Captcha is required'));
		return deferred.promise;
	}

	if (GLOBAL.CONFIG.recaptcha.enabled) {
		request(
			{
				method: 'post',
				url: GLOBAL.CONFIG.recaptcha.verifyUrl,
				form: {
					secret: GLOBAL.CONFIG.recaptcha.privateKey,
					remoteip: ip,
					response: captchaResponse
				}
			},
			function (err, res, body) {
                if (err) {
                    deferred.reject(err);
                } else {
                    let responseObj = JSON.parse(body);
                    if (responseObj.success) {
                        console.log('captcha validation passed');
                        deferred.resolve();
                    } else {
                        console.log('captcha validation error: ' + responseObj['error-codes']);
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
