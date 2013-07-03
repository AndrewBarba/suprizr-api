
var _static_instance = false;

function Suprizr(app, mongoose, settings) {

	// Is this a unit test?
	var test = (settings && settings["test"]);
	
	// Load models if we have a mongoose instance
	if (mongoose) {
		var models = require("./models");
		this.models = models(mongoose);
	}

	// Load controllers if we're not testing
	if (!test && app) {
		var controllers = require("./controllers");
		this.controllers = controllers(app);
	}
}

module.exports = _static_instance || function(app, mongoose, settings) {
	_static_instance = new Suprizr(app, mongoose, settings);
	return _static_instance;
}