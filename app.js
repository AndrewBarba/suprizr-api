/***
 ** This is the Suprizer backend API
 ** 2013 Suprizr Inc.
 **/

// Globals (Note: copy these to unit tests test.js)
SP_SETTINGS = require("./settings");
SP_ENV = process.env.NODE_ENV;
SP_PROD = SP_ENV == "production";

// custom logging function
trace = function(a, force) {
	if (SP_ENV != "production" || force) {
		return console.log(a);
	}
	return false;
}

/**
 * Initialize server
 */
var express = require("express"),
       cors = require("cors"),
   mongoose = require("mongoose");
        app = express();

// Setup server middleware
app.configure(function () {
	app.use(express.logger());
	app.use(express.compress()); // GZIP data
	app.use(express.methodOverride()); // allow PUT and DELETE
 	app.use(express.bodyParser()); // JSON post body
 	app.use(express.cookieParser()); // JSON cookies
 	app.use(express.query()); // Automatic query string parsing
 	app.use(cors()); // enable cross domain requests
 	app.use(express.static("public", {maxAge: 60*60*24*365*1000}));
 	app.use(function(req, res, next){ // add appropriate headers
 		trace(req.url);
 		res.header("Content-Type", "application/json; charset=UTF-8");
 		res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
 		res.header("Pragma", "no-cache");
 		next();
 	});
 	app.use(app.router);
});

/**
 * Initialize Mongoose and connect to MongoHQ
 */
var options = {
	server: {
		socketOptions : { keepAlive : 1 } // keep the connection open even if inactive
	},
};
mongoose.connect(process.env.MONGOHQ_URL, options, function(err){
	if (!err) {
		trace("Connected to MongoHQ");
	} else {
		throw "Failed to conntent to MongoHQ!";
	}
});

/**
 * Initializes the Suprizr API
 */
var suprizr = require("./suprizr"),
        api = suprizr(app);

/**
 * Start the server
 */
var port = process.env.PORT || 5000;
app.listen(port, function() {
 	trace("Listening on port " + port);
});
