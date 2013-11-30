/*
* Construct the app URL based on a passed-in domain and port.
*/
exports.constructUrl = function (domain, port) {

	this.domain = domain;
	this.port = port;
	this.url = 'http://' + domain;
	if (port) {
		this.url += ':' + port;
	}
	
	return this;

};
