
function Model() {
	this.User = require("./user");
	this.Auth = require("./auth");
}

module.exports = new Model();

/** MODEL TEMPLATE

var BaseSchema = require("./base"),
      mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        extend = require("mongoose-schema-extend");

var {TEMPLATE}Schema = BaseSchema.extend({
    email: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true }
});

{TEMPLATE}Schema.pre("save", function(next) {
    var self = this;

    // only hash the password if it has been modified (or is new)
    if (!self.isModified("password")) return next();

});

{TEMPLATE}Schema.methods.instanceMethod = function() {
    // do something
};

{TEMPLATE}Schema.statics.staticMethod = function() {
	// do something
};

module.exports = mongoose.model("{TEMPLATE}", {TEMPLATE}Schema);

**/