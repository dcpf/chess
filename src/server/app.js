'use strict';

var fs = require('fs');
var path = require('path');
// instantiate the logger to reset all console logging functions to use log4js
require('./logger');
var appUrl = require('./model/appUrl');

// before doing anything more, initialize the configuration
initConfig();

var express = require('express');
var routes = require('./routes');
var http = require('http');

var app = express();

// all environments
app.set('port', GLOBAL.APP_URL.port);
app.set('views', path.join(__dirname, 'view'));
app.engine('html', require('uinexpress').__express);
app.set('view engine', 'html');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.compress());
// ../../webapp is where grunt copies the static files to
app.use('/webapp', express.static(path.join(__dirname, '../../webapp'), { maxAge: 31536000000 }));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// routes

app.get('/', routes.index);
app.post('/createGame', routes.createGame);
app.post('/enterGame', routes.enterGame);
app.post('/saveMove', routes.saveMove);
app.post('/updateUserPrefs', routes.updateUserPrefs);
app.post('/logClientError', routes.logClientError);

http.createServer(app).listen(GLOBAL.APP_URL.port, GLOBAL.APP_URL.domain);

console.log('Express server listening on ' + GLOBAL.APP_URL.url);

// private functions

function initConfig () {

	// read the config file and make the config object globally available
	var configFile = process.argv[2] || path.join(__dirname, 'conf/config.json');
	var config = {};
	try {
		config = JSON.parse(fs.readFileSync(configFile, {encoding: 'utf8'}));
        console.log('Initialized config file: ' + configFile);
	} catch (err) {
		console.warn('No config file found at: ' + configFile + '. Starting with no configuration.');
	}
	GLOBAL.CONFIG = config;

	// get the ip and port from either the env vars or from the config file, and set the appUrl object
	var ip = process.env.IP || config.ip;
	var port = process.env.PORT || config.port;
	GLOBAL.APP_URL = appUrl.constructUrl(ip, port);
}
