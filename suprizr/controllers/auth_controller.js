
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
		var email = req.body.email;
		var password = req.body.password;
		Auth.login(email, password, function(err, auth){
			if (err || !auth) {
				res.send(401, { error: "Invalid user name or password" });
			} else {
				res.json(auth);
			}
		});
	}

	this.login.facebook = function(req, res, next) {
		var fb_auth = req.query.facebook_auth;
		Auth.login.facebook(fb_auth, function(err, auth){
			if (err || !auth) {
				res.send(401, { error: "Invalid facebook token" });
			} else {
				res.json(auth);
			}
		});
	}

	this.changePassword = function(req, res, next) {
		Auth.getCurrentUser(req, function(err, user){
			if (err || !user) {
				res.send(401, { error: "Invalid auth token" });
			} else {
				var password = req.body.password;
				var old_password = req.body.old_password;
				Auth.changePassword(user, password, old_password, function(err, auth){
					if (err || !auth) {
						res.send(400, { error: err });
					} else {
						res.json(auth);
					}
				});
			}
		})
	}
}

module.exports = function(app) {
	
	var controller = new AuthController();

	app.post("/auth/register", controller.register); // registers a new user
	app.post("/auth/login", controller.login); // logs in a user via email and password
	app.post("/auth/login/facebook", controller.login.facebook); // logs in a user via Facebook
	app.put("/auth/password", controller.changePassword); // changes a users password

	return controller;
}