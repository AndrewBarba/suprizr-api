
function RootController() {
	
	this.getRoot = function(req, res, next) {
		return {
			"name" : "Suprizr API",
			"description" : "A node.js REST API for Suprizr clients",
			"version" : "0.0.1",
			"time" : (new Date()).getTime() / 1000,
			"server" : "node.js",
			"database" : "MongoDB",
			"frameworks" : [ "express", "mongoose", "mocha" ]
		};
	};

	this.getStatus = function(req, res, next) {
		return {
			"status" : "OK"
		};
	};
}

module.exports = function(app) {
	
	var root = new RootController();

	app.get('/', function(req, res, next) {
		res.json(root.getRoot(req, res, next));
	});
	app.get('/status', function(req, res, next) {
		res.json(root.getStatus(req, res, next));
	});

	return root;
}