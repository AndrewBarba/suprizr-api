
var mongoose = require("mongoose");

var data = {
	"formatted_address" : String,
	"reference" : String, // Google reference to lookup more info
	"zipcode" : String,
	"location" : { type: [Number], index: { "loc" : "2d" } } // [ latitude, longitude ]
};

var LocationSchema = new mongoose.Schema(data);
LocationSchema.dataScheme = data; 
module.exports = LocationSchema;