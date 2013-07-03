
var _static_model = false;

function Model(mongoose) {
	this.mongoose = mongoose;
	
	// Required models
	this.user = require("./user")(mongoose);
}

module.exports = _static_model || function(mongoose) {
	_static_model = new Model(mongoose);
	return _static_model;
}