
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

module.exports = BaseSchema;