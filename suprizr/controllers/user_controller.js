function UserController() {

	this.getStatus = function(req, res, next) {
		return {
			"status" : "OK"
		};
	};
}

module.exports = function(app) {
	
	var controller = new UserController();

	app.get('/', function(req, res, next) {
		// res.json();
	});

	return controller;
}