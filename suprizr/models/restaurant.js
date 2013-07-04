var BaseSchema = require("./base"),
      mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        extend = require("mongoose-schema-extend");

var restaurant_fields = {
    name: String,
    location: [Number],
    address: String,
    description: String,
    radius: Number, // distance in Meters a restaurant delivers
};

var RestaurantSchema = BaseSchema.extend(restaurant_fields);

module.exports = mongoose.model("Restaurant", RestaurantSchema);