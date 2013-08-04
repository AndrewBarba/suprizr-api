
var Auth = require("../models/auth"),
   Error = require("./error_controller");

function AuthController() {

	this.register = function(req, res, next) {
		Auth.register(req.body, function(err, auth){
			if (err || !auth) {
				return Error.e400(res, err, "Could not register user");
			} else {
				return res.json(auth);
			}
		});
	};

	this.login = function(req, res, next) {
		var email = req.body.email;
		var password = req.body.password;
		Auth.login(email, password, function(err, auth){
			if (err || !auth) {
				return Error.e401(res, err, "Invalid user name or password");
			} else {
				return res.json(auth);
			}
		});
	}

	this.login.facebook = function(req, res, next) {
		var fb_auth = req.body.facebook_auth_token;
		if (!fb_auth) return Error.e400(res, err, "Missing facebook auth token");
		
		Auth.getCurrentUser(req, function(err, user){
			if (user) { // connect an existing user to facebook
				user.connectFacebook(fb_auth, function(err, user){
					if (err || !user) {
						return Error.e401(res, err, "Invalid facebook token");
					} else {
						return res.json(user);
					}
				});
			} else { // login / register a user via facebook
				Auth.login.facebook(fb_auth, function(err, auth){
					if (err || !auth) {
						return Error.e401(res, err, "Invalid facebook token");
					} else {
						return res.json(auth);
					}
				});
			}
		});
	}

	this.changePassword = function(req, res, next) {
		Auth.getCurrentUser(req, function(err, user){
			if (err || !user) {
				return Error.e401(res, err, "Invalid auth token");
			} else {
				var password = req.body.password;
				var old_password = req.body.old_password;
				Auth.changePassword(user, password, old_password, function(err, auth){
					if (err || !auth) {
						return Error.e400(res, err);
					} else {
						return res.json(auth);
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
	app.post("/auth/facebook", controller.login.facebook); // logs in / registers / connects a user via Facebook
	app.put("/auth/password", controller.changePassword); // changes a users password

	return controller;
}