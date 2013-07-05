
var Restaurant = require("../models/restaurant"),
	      Auth = require("../models/auth");

function RestaurantController() {

	this.createRestaurant = function(req, res, next) {
		Auth.getAdminUser(req, function(err, user){
			if (err || !user) {
				res.send(401, "You are not authorized to use this endpoint");
			} else {
				Restaurant.create(req.body, function(err, rest){
					if (err || !rest) {
						res.send(400, "Something went wrong when creating the restaurant: "+err);
					} else {
						res.json(rest);
					}
				});
			}
		})
	};
}

module.exports = function(app) {
	
	var controller = new RestaurantController();

	app.post('/restaurant', controller.createRestaurant);

	return controller;
}