/***
 ** This is the Suprizer backend API
 ** 2013 Suprizr Inc.
 **/

// fetch settings
settings = require("./settings");

// custom logging function
trace = function(a, force) {
	var env = process.env.ENV;
	if (env != "production" || force) {
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
 	app.use(function(req, res, next){ // add appropriate headers
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
 * Setup Stripe
 */
var stripe_key = settings.stripe[process.env.ENV];
if (!stripe_key || !stripe_key.length) stripe_key = settings.stripe.development;
var stripe = require("stripe")(stripe_key);

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
