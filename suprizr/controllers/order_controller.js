var User = require("../models/user"),
	Auth = require("../models/auth"),
   Order = require("../models/order"),
  Stripe = require("../modules/stripe"),
   Error = require("./error_controller");

function OrderController() {

	this.getOrder = function(req, res, next) {
		Auth.getCurrentUser(req, function(){
			if (err || !user) {
				res.send(401, { error : "Access denied" });
			} else {
				var id = req.param.id;
				Order.findById(id, function(err, doc){
					if (err || !doc) {
						return Error.e404(res, err, "Could not find order with id "+id);
					} else {
						return res.json(doc);
					}
				});
			}
		});
	}

	this.completeOrder = function(req, res, next){
		Auth.getAdminUser(req, function(err, admin){
			if (err) return Error.e401(err, res);
			var order = req.query.id;
			var description = req.body.description;
			var time = req.body.delivery_time;
			Order.completeOrder(order, description, time, function(err, order){
				if (err || !order) return Error.e400(res, err, "Failed to charge order");
				return res.json(order);
			});
		});
	}

	this.cancelOrder = function(req, res, next){
		Auth.getAdminUser(req, function(){
			if (err || !user) {
				res.send(401, { error : "Access denied" });
			} else {
				var order = req.query.id;
				Order.cancelOrder(id, function(err, order){
					if (err || !order) return Error.e400(res, err, "Failed to cancel/refund order");
					return res.json(order);
				});
			}
		});
	}

	this.updateOrder = function(req, res, next) {
		Auth.getAdminUser(req, function(err, admin){
			if (err) return Error.e401(err, res);
			var order = req.query.id;
			var description = req.body.description;
			var status = req.body.status;
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

	app.get("/order/:id", this.getOrder); // gets an order
	app.delete("/order/:id", this.getOrder); // refunds/cancels an order or cancels it if the order has yet to be placed
	app.put("/order/:id/complete", this.completeOrder);
	app.put("/order/:id", this.updateOrder);

	return controller;
}