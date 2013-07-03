
var _static_controller = false;

function Controller(app) {
	this.app = app;
	this.user = require("./root")(app);
}

module.exports = _static_controller || function(app) {
	_static_controller = new Controller(app);
	return _static_controller;
}