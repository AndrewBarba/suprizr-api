
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
    if (!this.guid) {
        this.guid = SP.simpleGUID();
    }
    if (this.isModified()) {
        this.updated_at = Date.now();
    }
    next();
});

BaseSchema.statics.putData = function(id, data, callback, restricted_keys) {
    if (!restricted_keys) restricted_keys = [];
    restricted_keys.concat(BaseSchema.restricted_fields);
    data = SP.removeKeys(data, restricted_keys);
    this.findByIdAndUpdate(id, data, callback);
};

BaseSchema.methods.putData = function(data, callback, restricted_keys) {
    if (!restricted_keys) restricted_keys = [];
    restricted_keys.concat("_id","created_at","updated_at");
    SP.removeKeys(data, restricted_keys);
    SP.extend(this, data, true);
    this.save(callback);
};

BaseSchema.dataScheme = base_data;
BaseSchema.restricted_fields = Object.keys(base_data);
BaseSchema.set("autoIndex", !SP_PROD);
module.exports = BaseSchema;