
var mongoose = require("mongoose");

function RootController() {
	
	this.getRoot = function(req, res, next) {
		return res.json({
			"name" : "Suprizr API",
			"description" : "A node.js REST API for Suprizr clients",
			"version" : "0.0.1",
			"time" : Date.now(),
			"server" : "node.js",
			"database" : "MongoDB",
			"frameworks" : [ "express", "mongoose", "mocha" ]
		});
	};

	this.getStatus = function(req, res, next) {
		return res.json({
			"status" : mongoose.connection.readyState ? "OK" : false
		});
	};
}

module.exports = function(app) {
	
	var root = new RootController();

	app.get('/', root.getRoot);
	app.get('/status', root.getStatus);

	return root;
}