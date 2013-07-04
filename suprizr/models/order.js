var BaseSchema = require("./base"),
      mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        extend = require("mongoose-schema-extend");

var status_enum = [
    "open",
    "ordered",
    "delivered"
];
var order_fields = {
    meal: { type: String, ref: "Meal", required: true },
    user: { type: String, ref: "User", required: true },
    order_status: { type: String, enum: status_enum, required: true },
    order_details: String,
    feedback: String,
    rating: Number,
};

var OrderSchema = BaseSchema.extend(order_fields);

module.exports = mongoose.model("Order", OrderSchema);