var BaseSchema = require("../schemas/base"),
LocationSchema = require("../schemas/location"),
      mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        Stripe = require("../modules/stripe"),
          Meal = require("../models/meal"),
    Restaurant = require("../models/restaurant"),
        extend = require("mongoose-schema-extend");

var status_enum = [ "open", "delayed", "ordered", "delivered", "canceled", "refunded" ];

var OrderSchema = BaseSchema.extend({
    meals: [{ type: String, ref: "Meal" }],
    user: { type: String, ref: "User" },
    order_status: { type: String, enum: status_enum, default: "open" },
    order_details: {
        description: String,
        expected_delivery: Number // number of minutes until order will be delivered
    },
    delivery_address: LocationSchema.dataScheme,
    feedback: String,
    rating: Number,
    email: String,
    phone_number: String,
    stripe_charge_id: String,
});

OrderSchema.statics.supriz = function(user, data, callback) {

    var order_data = {
        "user" : user._id,
        "email" : data.email,
        "phone_number" : data.phone_number,
        "delivery_address" : data.delivery_address,
    };

    user.addAddress(data.delivery_address);

    Restaurant.supriz(data.delivery_address.location, function(err, docs, rids){
        if (err) return callback(err);
        Meal.supriz(rids, data.meals[0], function(err, meals){
            if (err || !meals) return callback(err);
            var meal = SP.randomElement(meals);
            order_data["meals"] = [ meal._id ];
            var order = new Order(order_data);
            order.save(function(err, doc){
                order.populate("meals", function(err, doc){
                    callback(null, doc);
                });
            });
        });
    });
}

OrderSchema.statics.completeOrder = function(id, description, delivery_time, callback) {
    this
        .findOne({"_id":id})
        .populate("user meals")
        .exec(function(err, order){
            if (err || !order) return callback(err);
            var amount = order.meals.length * 20;
            Stripe.chargeUser(order.user, amount, function(err, charge){
                if (err || !charge) return callback(err);
                order.order_status = "ordered";
                order.stripe_charge_id = charge.id;
                order.order_details = {
                    "description" : description,
                    "expected_delivery" : delivery_time
                };

                SP.each(order.meals, function(){
                    this.num_orders++;
                    this.save();
                });

                order.save(callback);
            });
        });
}

OrderSchema.statics.cancelOrder = function(id, callback) {
    this
        .findOne({"_id":id})
        .populate("user meals")
        .exec(function(err, order){
            if (err || !order) return callback(err);
            if (order.stripe_charge_id) {
                Stripe.refundCharge(order.stripe_charge_id, function(err, charge){
                    if (err || !charge) return callback(err);
                    order.order_status = "refunded";
                    order.save(callback);
                });
            } else {
                order.order_status = "canceled";
                order.save(callback);
            }
        });
}

var Order = mongoose.model("Order", OrderSchema);
module.exports = Order;

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












