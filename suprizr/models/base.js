
var mongoose = require("mongoose");

var BaseSchema = new mongoose.Schema({
    guid: { type: String, required: true, index: { unique: true } },
    updated_at: { type: Number, required: true, index: { unique: true } },
    created_at: { type: Number, required: true, index: { unique: true } },
});

BaseSchema.pre("save", function(next) {
    if (!this.guid) {
        this.guid = SP.simpleGUID();
    }
    var now = (new Date()).getTime() / 1000;
    if (!this.created_at) {
        this.created_at = now;
    }
    this.updated_at = now;
    next();
});

BaseSchema.methods.putData = function(data, callback) {
    callback();
};

BaseSchema.statics.guid = function() {

};

module.exports = BaseSchema;