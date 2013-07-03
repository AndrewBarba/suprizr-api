
var User = require("../models/user");

function UserController() {

	this.getByID = function(req, res, next) {
		var id = req.param.id;
		User.findOne({ "_id" : id }, function(err, user){
			if (err || !user) {
				res.send(404, { error : "Could not find user with id "+id });
			} else {
				res.json(user);
			}
		});
	};
}

module.exports = function(app) {
	
	var controller = new UserController();

	app.get("/user/:id", controller.getByID);

	return controller;
}