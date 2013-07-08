
var mongoose = require("mongoose");

var data = {
	"formatted_address" : String,
	"reference" : String, // Google reference to lookup more info
	"location" : { type: [Number], index: { "loc" : "2d" } }
};

var LocationSchema = new mongoose.Schema(data);
LocationSchema.dataScheme = data; 
module.exports = LocationSchema;