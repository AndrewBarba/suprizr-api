
var mongoose = require("mongoose");

var base_data = {
    _id: { type: String, default: SP.simpleGUID, index: { unique: true } },
    updated_at: { type: Number, default: Date.now },
    created_at: { type: Number, default: Date.now },
};

if (SP_UNIT_TEST) {
    base_data["unit_test"] = { type: Boolean, default: true };
}

var BaseSchema = new mongoose.Schema(base_data, {strict: SP_PROD ? true : "throw" });

BaseSchema.pre("save", function(next) {
    if (this.isModified()) {
        this.updated_at = Date.now();
    }
    next();
});

BaseSchema.statics.putData = function(id, data, callback, allowed_keys) {
    var allowed_data = {};
    SP.each(allowed_keys, function(i,k){
        val = data[k];
        if (val != null) allowed_data[k] = val;
    });
    this.findByIdAndUpdate(id, data, callback);
};

BaseSchema.methods.putData = function(data, callback, allowed_keys) {
    var allowed_data = {};
    if (allowed_keys && allowed_keys.length) {
        SP.each(allowed_keys, function(i,k){
            val = data[k];
            if (val != null) allowed_data[k] = val;
        });
    } else {
        allowed_data = data;
    }
    SP.extend(this, allowed_data, true);
    this.save(callback);
};

BaseSchema.dataScheme = base_data;
BaseSchema.restricted_fields = Object.keys(base_data);
BaseSchema.set("autoIndex", !SP_PROD);
module.exports = BaseSchema;