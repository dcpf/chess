var q = require('q');
var request = require('request');

exports.validateCaptcha = function (ip, captchaChallenge, captchaResponse) {

	var deferred = q.defer();

	request(
		{
			method: 'post',
			url: 'http://www.google.com/recaptcha/api/verify',
			form: {
				privatekey: '6LfqLOkSAAAAAB-KDievG22mgeA_kkNV8wF_pa1Z',
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

	return deferred;

};
