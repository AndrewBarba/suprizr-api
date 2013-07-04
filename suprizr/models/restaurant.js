var BaseSchema = require("./base"),
      mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        extend = require("mongoose-schema-extend");

var restaurant_fields = {
    name: String,
    location: { type: [Number], index: { "loc" : "2d" } },
    address: String,
    description: String,
    radius: Number, // distance in MILES a restaurant delivers. NOTE: query radius is x/69 since there are 69 degrees in a mile
    delivery_fee: Number,
};

var RestaurantSchema = BaseSchema.extend(restaurant_fields);

var Restaurant = mongoose.model("Restaurant", RestaurantSchema);
module.exports = Restaurant;