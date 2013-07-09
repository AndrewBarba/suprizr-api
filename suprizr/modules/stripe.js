
var User = require("../models/user"),
    Auth = require("../models/auth");

function StripeModule() {

	var stripe_key = SP_SETTINGS.stripe[SP_ENV].secret;
	this.api = require("stripe")(stripe_key);

	/**
	 * Creates a new user from a stripe card token
	 * or returns an existing user based on card fingerprint
	 * Note: this should only be called if a user places an order without an auth_token (not an existing Suprizr user)
	 */
	this.createUser = function(token_id, callback) {
		// fetch the token
		this.api.token.retrieve(token_id, function(err, token){
			if (err || !token) return callback(err);
			// lookup a user by the card fingerprint
			User.findOne({ "stripe.active_card.fingerprint" : token.card.fingerprint }, function(err, user){
				if (user) {
					Auth.getAuth(user, function(err, auth){
						if (err || !auth) return callback(err);
						return callback(null, auth.user, auth);
					});
				} else {
					Stripe.api.customers.create({ "card" : token.id }, function(err, customer){
						if (err || !customer) return callback(err);
						var user_data = { 
							"stripe" : { 
								"id" : customer.id,
								"active_card" : {
									"exp_month": token.card.exp_month,
									"exp_year": token.card.exp_year,
									"fingerprint": token.card.fingerprint,
									"last4": token.card.last4,
									"card_type": token.card.type,
								}
							}, 
						};
						User.create(user_data, function(err, user){
							if (err || !user) return callback(err);
							Auth.create(user, function(err, auth){
								if (err || !auth) return callback(err);
								callback(null, auth.user, auth);
							});
						});
					});
				}
			});
		});
	}

	/**
	 * Creates a customer object from a given token
	 * and attaches to an existing Suprizr user
	 */
	this.putUser = function(user, token_id, callback) {
		this.api.token.retrieve(token_id, function(err, token){
			if (err || !token) return callback(err);
			var customer_data = {
				"card" : token.id,
				"email" : user.email,
			};
			Stripe.api.customers.create(customer_data, function(err, customer){
				if (err || !customer) return callback(err);
				user.stripe = {
					"id" : customer.id,
					"active_card" : {
						"exp_month": token.card.exp_month,
						"exp_year": token.card.exp_year,
						"fingerprint": token.card.fingerprint,
						"last4": token.card.last4,
						"card_type": token.card.type,
					}
				};
				user.save(function(err){
					callback(err, user);
				});
			});
		});
	}

	/**
	 * Charges a Suprizr user the given amount
	 */
	this.chargeUser = function(user, amount, callback) {
		var charge_data = {
			"amount" : amount * 100, // must be in cents
			"customer" : user.stripe.id,
			"currency" : "usd",
			"description" : user.email ? user.email : user._id,
		};
		this.api.charges.create(charge_data, function(err, charge){
			if (err || !charge) return callback(err);
			return callback(null, charge);
		});
	}

	/**
	 * Completely refunds a charge
	 */
	this.refundCharge = function(charge_id, callback){
		this.api.charges.refund(charge_id, callback);
	}
}

Stripe = new StripeModule();
module.exports = Stripe;