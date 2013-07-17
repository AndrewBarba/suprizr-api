
var Restaurant = require("../models/restaurant"),
          Meal = require("../models/meal"),
	      Auth = require("../models/auth"),
	     Error = require("./error_controller");

function MealController() {

	this.createMeal = function(req, res, next) {
		Auth.getAdminUser(req, function(err, admin){
			if (err || !admin) return Error.e401(res, err);
			Meal.create(req.body, function(err, meal){
				if (err || !meal) return Error.e400(res, err);
				return res.json(meal);
			});
		});
	}

	this.editMeal = function(req, res, next) {
		Auth.getAdminUser(req, function(err, admin){
			if (err || !admin) return Error.e401(res, err);
			Meal.putData(req.params.id, req.body, function(err, meal){
				if (err || !meal) return Error.e400(res, err);
				return res.json(meal);
			});
		});
	}

	this.deleteMeal = function(req, res, next) {
		Auth.getAdminUser(req, function(err, admin){
			if (err || !admin) return Error.e401(res, err);
			Meal.delete(req.params.id, function(err, meal){
				if (err || !meal) return Error.e400(res, err);
				return res.json(meal);
			});
		});
	}

	this.getMealsForRestaurant = function(req, res, next) {
		var rest = req.query.restaurant;
		if (!rest) return Error.e400(res, null, "Must provide a restaurant");
		Auth.getCurrentUser(req, function(err, user){
			if (err || !user) return Error.e401(res, err);
			trace(rest);
			Meal.mealsForRestaurant(rest, function(err, docs){
				if (err || !docs) return Error.e404(res, err, "Could not find meals for restaurant with id "+rest);
				return res.json({
					"meals" : docs
				});
			});
		});
	}

	this.getMeal = function(req, res, next) {
		var id = req.params.id;
		if (!id) return Error.e400(res, null, "Must provide a meal id");
		Auth.getCurrentUser(req, function(err, user){
			if (err || !user) return Error.e401(res, err);
			Meal.findById(id, function(err, doc){
				if (err || !doc) return Error.e404(res, err, "Could not find meal with id "+id);
				return res.json(doc);
			});
		});
	};
}

module.exports = function(app) {
	
	var controller = new MealController();

	app.get("/meal", controller.getMealsForRestaurant);
	app.get("/meal/:id", controller.getMeal);
	app.put("/meal/:id", controller.editMeal);
	app.delete("/meal/:id", controller.deleteMeal);
	app.post("/meal", controller.createMeal);

	return controller;
}