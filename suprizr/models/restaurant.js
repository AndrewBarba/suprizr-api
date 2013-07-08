var BaseSchema = require("../schemas/base"),
LocationSchema = require("../schemas/location");
      mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        extend = require("mongoose-schema-extend");

var restaurant_fields = {
    name: String,
    location: LocationSchema.dataScheme,
    description: String,
    radius: Number, // distance in MILES a restaurant delivers. NOTE: query radius is x/69 since there are 69 degrees in a mile
    delivery_fee: Number,
    delivery_hours: {
        start: Number, // hours between 0 - 24. 5:45pm = 13.75
        end: Number // this is the latest time a customer can place an order
    }
};

var RestaurantSchema = BaseSchema.extend(restaurant_fields);

RestaurantSchema.statics.create = function(data, callback) {
	var restaurant = new Restaurant({});
	restaurant.putData(data, callback, Restaurant.allowed_keys);
}

var Restaurant = mongoose.model("Restaurant", RestaurantSchema);
Restaurant.allowed_keys = Object.keys(restaurant_fields);
module.exports = Restaurant;