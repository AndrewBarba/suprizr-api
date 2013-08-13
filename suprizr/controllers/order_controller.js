var User = require("../models/user"),
	Auth = require("../models/auth"),
   Order = require("../models/order"),
   Restaurant = require("../models/restaurant"),
  Stripe = require("../modules/stripe"),
   Error = require("./error_controller");

function OrderController() {

	this.getOpenOrders = function(req, res, next) {
		Auth.getAdminUser(req, function(err, admin){
			if (err || !admin) return Error.e401(res, err);
			
			var query = {
				"order_status" : "open"
			};
			Order
				.find(query)
				.populate("user")
				.exec(function(err, orders){
					if (err || !orders) return Error.e400(res, err, "Could not find any open orders");
					res.json({
						"orders" : orders
					});
				});
		});
	}

	this.getOrder = function(req, res, next) {
		Auth.getCurrentUser(req, function(err, user){
			if (err || !user) return Error.e401(res, err);
			
			var id = req.params.id;
			Order
				.findOne({"_id":id})
				.populate("user meals restaurant")
				.exec(function(err, doc){
					if (err || !doc) {
						return Error.e404(res, err, "Could not find order with id "+id);
					} else {
						Restaurant.populate(doc, {"path":"meals.restaurant"}, function(err, doc){
							return res.json(doc);
						});
					}
				});
		});
	}

	this.completeOrder = function(req, res, next){
		Auth.getAdminUser(req, function(err, admin){
			if (err || !admin) return Error.e401(res, err);
			
			var order = req.params.id;
			var description = req.body.description;
			var time = req.body.delivery_time;
			Order.completeOrder(order, description, time, function(err, order){
				if (err || !order) return Error.e400(res, err, "Failed to charge order");
				return res.json(order);
			});
		});
	}

	this.cancelOrder = function(req, res, next){
		Auth.getAdminUser(req, function(err, admin){
			if (err || !admin) return Error.e401(res, err);
			
			var order = req.params.id;
			Order.cancelOrder(id, function(err, order){
				if (err || !order) return Error.e400(res, err, "Failed to cancel/refund order");
				return res.json(order);
			});
		});
	}

	this.updateOrder = function(req, res, next) {
		Auth.getAdminUser(req, function(err, admin){
			if (err) return Error.e401(res, err);
			
			var order = req.params.id;
			var description = req.body.description;
			var status = req.body.order_status;
			var data = {
				"order_status" : status,
				"order_details" : {
					"description" : description
				}
			}
			Order.putData(id, data, function(err, order){
				if (err || !order) return Error.e400(res, err, "Failed to update order");
				return res.json(order);
			});
		});
	};
}

module.exports = function(app) {
	
	var controller = new OrderController();

	app.get("/order", controller.getOpenOrders); // gets a list of all open orders
	app.get("/order/:id", controller.getOrder); // gets an order
	app.delete("/order/:id", controller.cancelOrder); // refunds/cancels an order or cancels it if the order has yet to be placed
	app.put("/order/:id/complete", controller.completeOrder);
	app.put("/order/:id", controller.updateOrder);

	return controller;
}