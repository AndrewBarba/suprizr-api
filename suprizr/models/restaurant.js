var BaseSchema = require("../schemas/base"),
LocationSchema = require("../schemas/location");
      mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        extend = require("mongoose-schema-extend");

var RestaurantSchema = BaseSchema.extend({
    name: String,
    location: LocationSchema.dataScheme,
    description: String,
    radius: Number, // distance in MILES a restaurant delivers. NOTE: query radius is x/69 since there are 69 degrees in a mile
    delivery_fee: Number,
    delivery_hours: {
        start: Number, // hours between 0 - 24. 5:45pm = 13.75
        end: Number // this is the latest time a customer can place an order
    }
});

RestaurantSchema.statics.create = function(data, callback) {
    var doc = new Restaurant();
    doc.putData(data, callback);
}

var Restaurant = mongoose.model("Restaurant", RestaurantSchema);
module.exports = Restaurant;