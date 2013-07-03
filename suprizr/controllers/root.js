
function RootController(app) {
	app.get('/', function(req, res, next) {
		res.json({
			"name" : "Suprizr Backend API",
			"version" : "0.0.1",
			"time" : (new Date()).getTime() / 1000,
			"server" : "node.js",
			"database" : "MongoDB",
			"frameworks" : [ "express", "mongoose", "mocha" ]
		});
	});	

	app.get('/status', function(req, res, next) {
		res.json({
			"status" : "OK"
		});
	});
}

module.exports = function(app) {
	return new RootController(app);
}