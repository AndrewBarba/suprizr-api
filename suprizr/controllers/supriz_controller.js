
var User = require("../models/user"),
	Auth = require("../models/auth"),
   Order = require("../models/order"),
  Stripe = require("../modules/stripe"),
   Error = require("./error_controller");

function SuprizController() {

	this.suprizMe = function(req, res, next) {
		Auth.getCurrentUser(req, function(err, current){
			var stripe_token = req.body.stripe_token;

			if (current) {
				Stripe.putUser(current, stripe_token, function(err, user){
					if (err || !user) return Error.e400(res, err, "Failed to add stripe data to user");
					Order.supriz(user, req.body, function(err, order){
						if (err || !order) return Error.e400(res, err, "Failed to create order");
						return res.json(order);
					});
				});
			} else {
				Stripe.createUser(stripe_token, function(err, user, auth){
					if (err || !auth) return Error.e400(res, err, "Failed to create a user from stripe token");
					Order.supriz(user, req.body, function(err, order){
						if (err || !order) return Error.e400(res, err, "Failed to create order");
						order.auth = auth;
						res.json(auth);
					});
				});
			}
		});
	};
}

module.exports = function(app) {
	
	var controller = new SuprizController();

	app.post("/supriz", this.suprizMe); // creates a supriz meal order

	return controller;
}

/**

SAMPLE SUPRIZ POST BODY

{
    meals : [
        {
            health: 0.8,
            ingredients: {
                gluten_free: false,
                dairy_free: false,
                peanut_free: false,
                meat_free: false
            } 
        }
    ],
    delivery_adress : {
        formatted_address : "700 Columbus Ave",
        reference : "1234jl32ndlk2je3j2e9230djeiowd43de3",
        location : [ -123.3213, 1234.23232 ]
    },
    email : test@test.com,
    phone_number : 9085667524,
    stripe_token : andklw232klndwdew
}

**/