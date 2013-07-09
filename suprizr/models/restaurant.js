var BaseSchema = require("../schemas/base"),
LocationSchema = require("../schemas/location"),
      mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        extend = require("mongoose-schema-extend");

var RestaurantSchema = BaseSchema.extend({
    name: String,
    address: LocationSchema.dataScheme,
    description: String,
    radius: Number, // distance in MILES a restaurant delivers. NOTE: query radius is x/69 since there are 69 degrees in a mile
    delivery_zipcodes : [Number],
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

RestaurantSchema.statics.findNearBy = function(location, callback) {
    var restaurant_query = {
        "address.location" : {
            "$within" : { "$center" : [ location, (10/69) ] } // TODO: upgrade this to $geoWithin
        }
    };
    Restaurant.find(restaurant_query, function(err, docs){
        if (err || !docs || !docs.length) return callback(err);
        
        var ulat = location[0];
        var ulon = location[1]
        docs = SP.grep(docs, function(doc){
            var lat = doc.address.location[0];
            var lon = doc.address.location[1];
            var d = (doc.radius / 69);
            var inlat = (ulat > lat - d) && (ulat < lat + d);
            var inlon = (ulon > lon - d) && (ulon < lon + d);
            return inlat && inlon;
        });

        if (!docs.length) return callback({message:"No restaurants found"});

        var rids = [];
        SP.each(docs, function(i, doc){
            rids.push(doc._id);
        });

        return callback(null, docs, rids);
    });
}

var Restaurant = mongoose.model("Restaurant", RestaurantSchema);
module.exports = Restaurant;