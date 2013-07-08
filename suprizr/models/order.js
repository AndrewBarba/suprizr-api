var BaseSchema = require("../schemas/base"),
      mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        extend = require("mongoose-schema-extend");

var status_enum = [ "open", "ordered", "delivered" ];

var OrderSchema = BaseSchema.extend({
    meals: [{ type: String, ref: "Meal" }],
    user: { type: String, ref: "User" },
    order_status: { type: String, enum: status_enum },
    order_details: String,
    feedback: String,
    rating: Number,
});

OrderSchema.statics.create = function(data, callback) {
    var doc = new Order();
    doc.putData(data, callback);
}

var Order = mongoose.model("Order", OrderSchema);
module.exports = Order;