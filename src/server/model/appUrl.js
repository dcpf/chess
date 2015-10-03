/*
* Construct the app URL based on a passed-in domain and port.
*/

'use strict';

exports.constructUrl = function (domain, port, usePortInLinks) {

	this.domain = domain;
	this.port = port;
	this.url = 'http://' + domain;
	if (usePortInLinks && port) {
		this.url += ':' + port;
	}

	return this;

};
