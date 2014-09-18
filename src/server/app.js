'use strict';

var cmndr = require('commander');

cmndr
  .option('-h, --hostName <hostName>', 'Specify the host name')
  .option('-p, --port <port>', 'Specify the port')
  .option('-u, --usePortInLinks', 'Include the port in the game URL in the emails')
  .option('-c, --configFile <configFile>', 'Specify a config file to use')
  .parse(process.argv);

var fs = require('fs');
var path = require('path');
// instantiate the logger to reset all console logging functions to use log4js
require('./logger');
var appUrl = require('./model/appUrl');

// before doing anything more, initialize the configuration
initConfig();

// express and middleware
var express = require('express');
//var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var compression = require('compression');
var errorHandler = require('errorhandler');

var routes = require('./routes');

var app = express();

// all environments
app.set('port', GLOBAL.APP_URL.port);
app.set('views', path.join(__dirname, 'view'));
app.engine('html', require('uinexpress').__express);
app.set('view engine', 'html');

// Must be before express.static!!!
app.use(compression());

// ../../webapp is where grunt copies the static files to
app.use('/webapp', express.static(path.join(__dirname, '../../webapp'), { maxAge: 31536000000 }));

//app.use(morgan());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
// cookieParser should be before session
app.use(cookieParser());
app.use(session({resave: true, saveUninitialized: true, secret: 'jellyJam'}));

app.disable('x-powered-by');

// log all requests
app.use(function (req, res, next) {
    console.log(req.method + ' ' + req.url + '; IP: ' + req.connection.remoteAddress + '; User-agent: ' + req.headers['user-agent']);
    next();
});

// routes
app.get('/', routes.index);
app.post('/findGamesByEmail', routes.findGamesByEmail);
app.post('/createGame', routes.createGame);
app.post('/enterGame', routes.enterGame);
app.post('/saveMove', routes.saveMove);
app.post('/updateUserPrefs', routes.updateUserPrefs);
app.post('/feedback', routes.sendFeedback);
app.post('/logClientError', routes.logClientError);

// basic auth to protect admin URLs defined below
app.use(function(req, res, next) {
    if (req.headers.authorization === 'Basic ZHBmOnJ1NWgyMWx6') {
        next();
    } else {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="chess_admin"');
        res.end('Unauthorized');
    }
});

// admin URLs
var adminRoutes = require('./admin/routes');
app.get('/admin', adminRoutes.index);
app.post('/admin/findGameById', adminRoutes.findGameById);
app.post('/admin/findGamesByEmail', adminRoutes.findGamesByEmail);
app.post('/admin/editGame', adminRoutes.editGame);

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

app.listen(GLOBAL.APP_URL.port);

console.log('Express server listening on ' + GLOBAL.APP_URL.url);

// private functions

function initConfig () {

	// Read the config file and make the config object globally available
	var configFile = cmndr.configFile || path.join(__dirname, 'conf/config.json');
	var config = {};
	try {
		config = JSON.parse(fs.readFileSync(configFile, {encoding: 'utf8'}));
    console.log('Initialized config file: ' + configFile);
	} catch (err) {
		console.warn('No config file found at: ' + configFile + '. Starting with no configuration.');
	}
	GLOBAL.CONFIG = config;

  // Set the global appUrl object using the host name and port from either the passed-in args or the env vars.
	var hostName = cmndr.hostName || process.env.DOMAIN;
	var port = cmndr.port || process.env.PORT;
  GLOBAL.APP_URL = appUrl.constructUrl(hostName, port, cmndr.usePortInLinks);

}
