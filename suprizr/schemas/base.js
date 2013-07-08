
var mongoose = require("mongoose");

var data = {
    _id: { type: String, default: SP.simpleGUID, index: { unique: true } },
    updated_at: { type: Number, default: Date.now },
    created_at: { type: Number, default: Date.now },
};

if (SP_UNIT_TEST) {
    data["unit_test"] = { type: Boolean, default: true };
}

var BaseSchema = new mongoose.Schema(data);

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
    if (!valid_keys) valid_keys = this.allowed_keys;
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

BaseSchema.methods.putData = function(data, callback, valid_keys) {
    var self = this;
    if (valid_keys) {
        SP.each(valid_keys, function(i,key){
            var val = data[key];
            if (val) {
                self[key] = val;
            }
        });
        self.save(callback);
    } else {
        callback({"error":"need a set of valid keys"});
    }
};

BaseSchema.dataScheme = data;
BaseSchema.set("autoIndex", !SP_PROD);
module.exports = BaseSchema;