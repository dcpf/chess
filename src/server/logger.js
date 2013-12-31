'use strict';

var log4js = require('log4js');

log4js.configure('src/server/conf/log4js.json');
var logger = log4js.getLogger('server');

//
// Set console log functions to use log4js instead, so that all log msgs go to the log file instead of stdout.
//

console.log = function (msg) {
	logger.info(msg);
};

console.info = function (msg) {
	logger.info(msg);
};

console.error = function (msg) {
	logger.error(msg);
};

console.warn = function (msg) {
	logger.warn(msg);
};

console.trace = function (msg) {
	logger.trace(msg);
};
