
var BaseSchema = require("./base"),
      mongoose = require("mongoose"),
        extend = require("mongoose-schema-extend");
        bcrypt = require("bcrypt"),
        SALT_WORK_FACTOR = process.env.SALT_WORK_FACTOR || 10;

var UserSchema = BaseSchema.extend({
    email: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true }
});

UserSchema.pre("save", function(next) {
    var self = this;

    // only hash the password if it has been modified (or is new)
    if (!self.isModified("password")) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(self.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            self.password = hash;
            next();
        });
    });
});

UserSchema.methods.validatePassword = function(password, callback) {
    bcrypt.compare(password, this.password, callback);
};

UserSchema.statics.login = function(email, password, callback) {
	this.findOne({ "email" : email }, function(err, user){
		if (err || !user) return callback(err, false);
		user.validatePassword(password, function(err, success){
			if (err || !success) return callback(err, false);
			return callback(false, user);
		});
	});
};

UserSchema.statics.testing = function() {
	return "Hello World";
};

module.exports = mongoose.model("User", UserSchema);