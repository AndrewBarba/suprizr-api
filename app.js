/***
 ** This is the Suprizer backend API
 ** 2013 Suprizr Inc.
 **/

/**
 * Initialize Express
 */
var express = require("express");
var app = express();
app.configure(function () {
	app.use(express.logger());
	app.use(express.compress()); // GZIP data
	app.use(express.methodOverride()); // allow PUT and DELETE
 	app.use(express.bodyParser()); // JSON post body
 	app.use(express.cookieParser()); // JSON cookies
 	app.use(app.router);
});

/**
 * Initialize Mongoose and connect to MongoHQ
 */
var mongoose = require("mongoose");
mongoose.connect(process.env.MONGOHQ_URL);

/**
 * Initialize custom routing
 */
var suprizr = require("suprizr");

/**
 * Start the server
 */
var port = process.env.PORT || 5000;
app.listen(port, function() {
 	console.log("Listening on " + port);
});