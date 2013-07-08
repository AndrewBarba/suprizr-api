var BaseSchema = require("../schemas/base"),
      mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        Stripe = require("../modules/stripe"),
        extend = require("mongoose-schema-extend");

var status_enum = [ "open", "ordered", "delivered" ];

var OrderSchema = BaseSchema.extend({
    meals: [{ type: String, ref: "Meal" }],
    user: { type: String, ref: "User" },
    order_status: { type: String, enum: status_enum, default: "open" },
    order_details: {
        description: String,
        expected_delivery: Number // number of minutes until order will be delivered
    },
    feedback: String,
    rating: Number,
    stripe_charge_id: String,
});

OrderSchema.statics.create = function(data, callback) {
    var doc = new Order();
    doc.putData(data, callback);
}

OrderSchema.statics.chargeOrder = function(id, description, delivery_time, callback) {
    this
        .findOne({"_id":id})
        .populate("user")
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
                order.save(function(err){
                    callback(err, order);
                });
            });
        });
}

var Order = mongoose.model("Order", OrderSchema);
module.exports = Order;