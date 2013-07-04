
var mongoose = require("mongoose");

var BaseSchema = new mongoose.Schema({
    _id: { type: String, default: SP.simpleGUID, index: { unique: true } },
    updated_at: { type: Date, default: Date.now },
    created_at: { type: Date, default: Date.now },
});

BaseSchema.pre("save", function(next) {
    if (!this.guid) {
        this.guid = SP.simpleGUID();
    }
    if (this.isModified()) {
        this.updated_at = Date.now();
    }
    next();
});

BaseSchema.statics.putData = function(id, data, callback, valid_keys) {
    var valid_data = {};
    if (valid_keys) {
        SP.each(valid_keys, function(i,key){
            var val = data[key];
            if (val) {
                valid_data[key] = val;
            }
        });
    } else {
        valid_data = data;
    }
    this.findByIdAndUpdate(id, valid_data, callback);
};

module.exports = BaseSchema;