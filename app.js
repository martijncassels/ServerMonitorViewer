
/**
 * Module dependencies
 */

var express 	      = require('express'),
		routes 		      = require('./routes'),
		//msgapi 		      = require('./routes/msgapi'),
		//proapi 		      = require('./routes/proapi'),
		//facapi          = require('./routes/facapi'),
		//adminapi        = require('./routes/adminapi'),
		//shopapi         = require('./routes/shopapi'),
		http 		        = require('http'),
		hash            = require('bcrypt-nodejs'),
		path 		        = require('path'),
		cookieParser    = require('cookie-parser'),
		bodyParser      = require('body-parser'),
		passport        = require('passport'),
		localStrategy   = require('passport-local' ).Strategy,
		mongoose        = require('mongoose'),
		compression     = require('compression'),
		UglifyJS        = require("uglify-js"),
		fs              = require('fs'),
		serveStatic     = require('serve-static'),
		prerender       = require('prerender-node'),
		pmx             = require('pmx'),
		probe           = pmx.probe(),
		methodOverride  = require('method-override');
const session       = require('express-session'),
		MongoStore      = require('connect-mongo')(session);

/**
 * Mongoose connection
 */
//mongoose.connect('mongodb://127.0.0.1/whatif:27017');
// if(process.env.mongostring){
// 	console.log(process.env.mongostring);
// 	mongoose.connect(process.env.mongostring, { useMongoClient : true });
// }
// else {
// 	var config = require('./config/config.js');
// 	mongoose.connect(config.mongostring, { useMongoClient : true });
// }

// PMX logging metrics for Keymetrics.io
pmx.init({
	http          : true, // HTTP routes logging (default: true)
	ignore_routes : [/socket\.io/, /notFound/], // Ignore http routes with this pattern (Default: [])
	errors        : true, // Exceptions loggin (default: true)
	custom_probes : true, // Auto expose JS Loop Latency and HTTP req/s as custom metrics
	network       : true, // Network monitoring at the application level
	ports         : true,  // Shows which ports your app is listening on (default: false)
	alert_enabled : true  // Enable alert sub field in custom metrics   (default: false)
});
var counter = probe.counter({
	name : 'Current req processed'
});

process.on('SIGINT', function() {
	mongoose.connection.close(function () {
		console.log('Mongoose default connection disconnected through app termination');
		process.exit(0);
	});
});

var Profile = require('./models/profiles');

var app = module.exports = express();

/**
* Session
*/
// configure express-session
// app.use(require('express-session')({
//     secret: 'keyboard cat',
//     resave: false,
//     saveUninitialized: false
// }));
// configure connect-mongo
var sess = {
		secret: 'vleesmes',
		resave: false,
		saveUninitialized: false,
		ttl: 24 * 60 * 60, // = 1 day
		store: new MongoStore({
			mongooseConnection: mongoose.connection,
			autoRemove: 'interval',
			autoRemoveInterval: 10 // In minutes. Default
		})
}

if (app.get('env') === 'production') {
	app.set('trust proxy', 1) // trust first proxy
	sess.cookie.secure = true // serve secure cookies
};
app.use(session(sess));

/**
* Configuration
*/
app.use(compression());
app.use(prerender).set('prerenderToken', 'BqPpr1l2l9hA7BZMZJGS');

app.use(passport.initialize());
app.use(passport.session());

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('counter', function (counter) {
	counter.inc();
});
app.use(express.logger('dev'));
//app.use(express.bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.methodOverride()); // old one,deprecated
app.use(methodOverride('X-HTTP-Method-Override'))
var oneWeek = 60 * 1000 * 60 * 24 * 7;
var oneDay = 60 * 1000 * 60 * 24;
// app.use(express.static(path.join(__dirname, 'public'), { maxAge: oneWeek }));
app.use(express.static(path.join(__dirname, 'public')));

// app.use(serveStatic(__dirname + '/public/js/lib', {
//   maxAge: oneWeek,
//   setHeaders: setCustomCacheControl
// }))
// app.use(serveStatic(__dirname + '/public/js', {
//   maxAge: oneDay,
//   setHeaders: setCustomCacheControl
// }))
// app.use(serveStatic(__dirname + '/public/font-awesome-4.7.0', {
//   maxAge: oneWeek,
//   setHeaders: setCustomCacheControl
// }))
// app.use(serveStatic(__dirname + '/public/css', {
//   maxAge: oneWeek,
//   setHeaders: setCustomCacheControl
// }))
// app.use(serveStatic(__dirname + '/public/bootstrap', {
//   maxAge: oneWeek,
//   setHeaders: setCustomCacheControl
// }))
// app.use(serveStatic(__dirname + '/public', {
//   maxAge: oneDay,
//   setHeaders: setCustomCacheControl
// }))

app.use(app.router);

// configure passport
passport.use(new localStrategy(Profile.authenticate()));
passport.serializeUser(Profile.serializeUser());
passport.deserializeUser(Profile.deserializeUser());

// development only
if (app.get('env') === 'development') {
	 //app.use(express.errorHandler());
	 app.use(pmx.expressErrorHandler());
	 app.use(function(err, req, res, next) {
		 res.status(err.status || 500);
		 res.send('Something went wrong!\n'+err);
	 });
};

// production only
if (app.get('env') === 'production') {
	//
	app.use(pmx.expressErrorHandler());
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.send('Something went wrong!\n');
	});
};

/**
* Routes
*/
app.get('/', routes.index);
app.get('/partials/:sub/:name', routes.partial);

// JSON API
// app.get('/api/admin/msgstats', adminapi.msgstats);
// app.get('/api/admin/prostats', adminapi.prostats);

app.get('/getqueue', routes.getqueue);
app.get('/getmutations/:lastkey', routes.getmutations);
app.get('/getcustomermetrics/:server/:alias', routes.getcustomermetrics);
app.get('/getcustomermutations/:server/:lastkey', routes.getcustomermutations);
app.get('/gettop10errors/:alias/:db', routes.gettop10errors);
app.get('/getpccpcalcs/:alias/:db', routes.getpccpcalcs);
app.get('/getetradeservercounter/:alias/:db', routes.getetradeservercounter);
app.get('/getcustomerentitycounts/:alias/:db', routes.getcustomerentitycounts);
app.get('/getcustomerentitycountmutations/:alias/:db/:lastkey', routes.getcustomerentitycountmutations);
app.get('/getarchivecounters/:alias/:db', routes.getarchivecounters);
app.get('/getvirtualmarketplacemutations/:alias/:db', routes.getvirtualmarketplacemutations);
app.get('/getlicenses/:alias/:db', routes.getlicenses);
app.get('/listservers', routes.listservers);
app.get('/listserversv2', routes.listserversv2);
app.get('/getmodels', routes.getmodels);
app.get('/lastheartbeat/:server', routes.lastheartbeat);
app.get('/getblocking/:alias/:db', routes.getblocking);
app.get('/getthresholds/:alias/:db', routes.getthresholds);
app.put('/updatethreshold/:alias/:db/:key/:value', routes.updatethreshold);
app.get('/getcpu/:alias/:db/:lastkey', routes.getcpu);

app.post('/register', routes.register);
app.post('/login', routes.login);
app.get('/logout', routes.logout);
app.get('/status', routes.status);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Need to review this code, breaks angular and API
//
// app.get('/css/*',express.static('public',{maxAge:7*86400000}));
// app.get('/bootstrap/*',express.static('public',{maxAge:7*86400000}));
// app.get('/js/lib/*',express.static('public',{maxAge:7*86400000}));
// app.get('/js/*.js',express.static('public',{maxAge:1*86400000}));
// app.get('/font-awesome-4.7.0/*',express.static('public',{maxAge:30*86400000}));
// app.get('/favicon.ico',express.static('public',{maxAge:30*86400000}));

/**
* Start Server
*/

var server = http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
	counter.inc();
	//console.log(counter);
	app.on('end', function() {
		// Decrement the counter, counter will eq 0
		counter.dec();
	});
});

function setCustomCacheControl (res, path) {
	if (serveStatic.mime.lookup(path) === 'text/html') {
		// Custom Cache-Control for HTML files
		res.setHeader('Cache-Control', 'public, max-age=0')
	}
}
