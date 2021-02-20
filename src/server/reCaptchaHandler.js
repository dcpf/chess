'use strict';

var request = require('request');

exports.validateCaptcha = (ip, captchaResponse) => {

    if (!global.CONFIG.recaptcha.enabled) {
        return Promise.resolve();
    }
    
	if (!captchaResponse.trim()) {
		return Promise.reject(new Error('Captcha is required'));
	}
    
    var promise = new Promise((resolve, reject) => {
        request(
            {
                method: 'post',
                url: global.CONFIG.recaptcha.verifyUrl,
                form: {
                    secret: global.CONFIG.recaptcha.privateKey,
                    remoteip: ip,
                    response: captchaResponse
                }
            },
            function (err, res, body) {
                if (err) {
                    reject(err);
                } else {
                    let responseObj = JSON.parse(body);
                    if (responseObj.success) {
                        console.log('captcha validation passed');
                        resolve();
                    } else {
                        console.log(`captcha validation error: ${responseObj['error-codes']}`);
                        reject(new Error('Incorrect captcha. Please try again.'));
                    }
                }
            }
        );
    });
    
    return promise;

};
