
function Controller(app) {
	this.root = require("./root_controller")(app);
	this.root = require("./user_controller")(app);
	this.root = require("./auth_controller")(app);
}

var _controller = false;
module.exports = _controller || function(app) {
	_controller = new Controller(app);
	return _controller;
}

/** CONTROLLER TEMPLATE

function {TEMPLATE}Controller() {

	this.getStatus = function(req, res, next) {
		return {
			"status" : "OK"
		};
	};
}

module.exports = function(app) {
	
	var controller = new {TEMPLATE}Controller();

	app.get('/', function(req, res, next) {
		// res.json();
	});

	return controller;
}

**/