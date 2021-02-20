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
require('./emailHandler');

// express and middleware
var express = require('express');
//var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var compression = require('compression');
var errorHandler = require('errorhandler');
var csrf = require('csurf');

// Timestamp of when the app was started. We use this for caching javascript and css files in the browser.
var runtimestamp = new Date().getTime();

// Create the express app and socket.io object
var app = express();
var server = require('http').Server(app);
require('./socket.io.js')(server);

// all environments
app.set('port', global.APP_URL.port);
app.set('views', path.join(__dirname, 'view'));
app.engine('html', require('uinexpress').__express);
app.set('view engine', 'html');

// Must be before express.static!!!
app.use(compression());

// /webapp is where grunt copies the static files to
app.use('/webapp', express.static('webapp', { maxAge: 31536000000 }));

//app.use(morgan());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
// cookieParser should be before session
app.use(cookieParser());
app.use(session({resave: true, saveUninitialized: true, secret: 'jellyJam'}));

app.disable('x-powered-by');

// set up some things we need for the app
app.use((req, res, next) => {
    
    /*
    Create a responseProps object on the response object to hold app-specific response properties. Valid attrs are:
    - responseProps.promise - Promise returned by the router/controller
    - responseProps.obj - JSON object to be passed back to the client 
    - responseProps.error - Error to be passed to client the client 
    - responseProps.file - File to render
    */
    res.responseProps = {};
    
    // Get the passed in params (for either GET, POST or route params), and make them available via req.getParam() and req.getParams()
    var params = {};
    if (req.method === 'POST') {
        params = req.body;
    } else if (req.method === 'GET') {
        params = req.query;
    }
    req.getParam = (name) => {
        return params[name] || req.params[name];
    };
    req.getParams = () => {
        // add everything from req.params to params
        for (var name in req.params) {
            if (!params[name]) {
                params[name] = req.params[name];
            }
        }
        return params;
    };
    
    next();
    
});

// log all requests
app.use((req, res, next) => {
    var start = new Date();
    console.log(`${req.method} ${req.url}; IP: ${req.connection.remoteAddress}; User-agent: ${req.headers['user-agent']}`);
    res.on('finish', () => {
        var duration = new Date() - start;
        console.log(`${req.method} ${req.url}; IP: ${req.connection.remoteAddress}; Execution time: ${duration} ms`);
    });
    next();
});

//
// Routes
//

// game end-points
var routes = require('./routes');
app.get('/', routes.index);
app.get('/play/*', routes.index);
app.post('/findGamesByEmail', routes.findGamesByEmail);
app.post('/createGame', routes.createGame);
app.post('/enterGame', routes.enterGame);
app.post('/saveMove', routes.saveMove);
app.post('/updateUserPrefs', routes.updateUserPrefs);
app.post('/feedback', routes.sendFeedback);
app.post('/logClientError', routes.logClientError);

// Send the response
app.use(sendResponse);

server.listen(global.APP_URL.port, () => {
    console.log(`Express server listening on ${global.APP_URL.url}`);
});

// private functions

function initConfig () {

	// Read the config file and make the config object globally available
	var configFile = cmndr.configFile || path.join(__dirname, 'conf/config.json');
	var config = {};
	try {
		config = JSON.parse(fs.readFileSync(configFile, {encoding: 'utf8'}));
        console.log(`Initialized config file: ${configFile}`);
	} catch (err) {
		console.warn(`No config file found at: ${configFile}. Starting with no configuration.`);
	}
	global.CONFIG = config;

    // Set the global appUrl object using the host name and port from either the passed-in args or the env vars.
    var hostName = cmndr.hostName || process.env.DOMAIN;
    var port = cmndr.port || process.env.PORT;
    global.APP_URL = appUrl.constructUrl(hostName, port, cmndr.usePortInLinks);

}

/**
After handling the route, send the response. Based on what's in res.responseProps, we will do one of the following:
- responseProps.promise: Handle the promise
- responseProps.file: Render an HTML file
- other: Send responseProps.obj to the client
*/
function sendResponse (req, res) {
    
    var responseProps = res.responseProps;
    
    if (responseProps.promise) {
        responseProps.promise.then((obj) => {
            res.send(obj);
        }).catch((err) => {
            console.error(err.toString());
            res.status(500).send(err.message);
        });
    } else if (responseProps.file) {
        var obj = responseProps.obj || {};
        // add the runtimestamp for versioning css and javascript
        obj.runtimestamp = runtimestamp;
        // set layout to false
        obj.layout = false;
        // set no-cache headers
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        // add the CSRF token if it exists
        if (req.csrfToken) {
            obj.csrfToken = req.csrfToken();
        }
        // render
        res.render(responseProps.file, obj);
    } else {
        responseProps.obj = responseProps.obj || {};
        res.send(responseProps.obj);
    }
    
}
