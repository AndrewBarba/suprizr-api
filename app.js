/***
 ** This is the Suprizer backend API
 ** 2013 Suprizr Inc.
 **/

express = require("express");
cors = require("cors");

/**
 * Initialize Express
 */
app = express();
app.configure(function () {
	app.use(express.logger());
	app.use(express.compress()); // GZIP data
	app.use(express.methodOverride()); // allow PUT and DELETE
 	app.use(express.bodyParser()); // JSON post body
 	app.use(express.cookieParser()); // JSON cookies
 	app.use(express.query()); // Automatic query string parsing
 	app.use(cors()); // enable cross domain requests
 	app.use(function(req, res, next){ // add appropriate headers
 		res.header('Content-Type', 'application/json; charset=UTF-8');
 		res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
 		res.header('Pragma', 'no-cache');
 		next();
 	});
 	app.use(app.router);
});

/**
 * Initialize Mongoose and connect to MongoHQ
 */
mongoose = require("mongoose");
mongoose.connect(process.env.MONGOHQ_URL);

/**
 * Initializes the Suprizr API
 */
suprizr = require("suprizr");

/**
 * Start the server
 */
var port = process.env.PORT || 5000;
app.listen(port, function() {
 	console.log("Listening on " + port);
});