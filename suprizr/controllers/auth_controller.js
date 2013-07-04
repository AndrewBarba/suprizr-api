
var Auth = require("../models/auth");

function AuthController() {

	this.register = function(req, res, next) {
		Auth.register(req.body, function(err, auth){
			if (err ||!user) {
				res.send(400, { error: "Could not register user" });
			} else {
				res.json(auth);
			}
		});
	};

	this.login = function(req, res, next) {
		var email = req.query.email;
		var password = req.query.password;
		Auth.login(email, password, function(err, auth){
			if (err || !auth) {
				res.send(401, { error: "Invalid user name or password" });
			} else {
				res.json(auth);
			}
		});
	}
}

module.exports = function(app) {
	
	var controller = new AuthController();

	app.post("/auth/register", controller.register);
	app.get("/auth/login", controller.login);

	return controller;
}