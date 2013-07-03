
function Controller(app) {
	this.root = require("./root")(app);
}

var _controller = false;
module.exports = function(app) {
	if (!_controller && app) {
		_controller = new Controller(app);
	}
	return _controller;
}