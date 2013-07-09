var User = require("../models/user"),
	Auth = require("../models/auth"),
   Order = require("../models/order"),
  Stripe = require("../modules/stripe"),
   Error = require("./error_controller");

function OrderController() {

	this.chargeOrder = function(req, res, next) {
		Auth.getAdminUser(req, function(err, admin){
			if (err) return Error.e401(err, res);
			var order = req.query.id;
			var description = req.body.description;
			var time = req.body.delivery_time;
			Order.chargeOrder(order, description, time, function(err, order){
				if (err || !order) return Error.e400(res, err, "Failed to charge order");
				return res.json(order);
			});
		});
	};
}

module.exports = function(app) {
	
	var controller = new OrderController();

	app.put("/order/:id", this.chargeOrder);

	return controller;
}