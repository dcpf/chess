'use strict';

var path = require('path');
var log4js = require('log4js');

log4js.configure(path.join(__dirname, 'conf/log4js.json'));
var logger = log4js.getLogger('server');

//
// Set console log functions to use log4js instead, so that all log msgs go to the log file instead of stdout.
//

console.log = (msg) => {
	logger.info(msg);
};

console.info = (msg) => {
	logger.info(msg);
};

console.error = (msg) => {
	logger.error(msg);
};

console.warn = (msg) => {
	logger.warn(msg);
};

console.trace = (msg) => {
	logger.trace(msg);
};
