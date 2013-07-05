
var mongoose = require("mongoose");

var data = {
	"formatted_addres" : String,
	"google_id" : String,
	"location" : { type: [Number], index: { "loc" : "2d" } }
};

var LocationSchema = new mongoose.Schema(data);
LocationSchema.dataScheme = data; 
module.exports = LocationSchema;