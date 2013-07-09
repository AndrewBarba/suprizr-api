
var Restaurant = require("../models/restaurant"),
	      Auth = require("../models/auth"),
	     Error = require("./error_controller");

function RestaurantController() {

	this.getRestaurants = function(req, res, next) {
		Auth.getCurrentUser(req, function(err, user){
			if (err || !user) {
				return Error.e401(res, err);
			} else {
				Restaurant.find({}, function(err, docs){
					if (err || !restaurants) return Error.e400(res, err);
					return res.json({
						"restaurants" : docs
					});
				});
			}
		});
	}

	this.createRestaurant = function(req, res, next) {
		Auth.getAdminUser(req, function(err, user){
			if (err || !user) {
				return Error.e401(res, err);
			} else {
				Restaurant.create(req.body, function(err, doc){
					if (err || !doc) {
						return Error.e400(res, err);
					} else {
						return res.json(doc);
					}
				});
			}
		});
	};

	this.getById = function(req, res, next) {
		Auth.getCurrentUser(req, function(){
			if (err || !user) {
				res.send(401, { error : "Access denied" });
			} else {
				var id = req.param.id;
				Restaurant.findById(id, function(err, doc){
					if (err || !doc) {
						return Error.e404(res, err, "Could not find restaurant with id "+id);
					} else {
						return res.json(doc);
					}
				});
			}
		});
	};

	this.putData = function(req, res, next) {
		var id = req.query.id;
		Auth.getCurrentUser(req, function(err, user){
			if (err || !user || (user.restaurant != id && !user.admin)) {
				return Error.e401(res, err);
			} else {
				Restaurant.putData(id, req.body, function(err, rest){
					if (err || !rest) {
						return Error.e400(res, err);
					} else {
						return res.json(rest);
					}
				}, Restaurant.allowed_keys);
			}
		}, "+restaurant");
	}
}

module.exports = function(app) {
	
	var controller = new RestaurantController();

	app.get("/restaurant", controller.getRestaurants);
	app.get("/restaurant/:id", controller.getRestaurants);
	app.post("/restaurant", controller.createRestaurant);
	app.put("/restaurant/:id", controller.putData);

	return controller;
}