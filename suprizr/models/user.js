
var BaseSchema = require("./base"),
      mongoose = require("mongoose"),
        extend = require("mongoose-schema-extend");
        bcrypt = require("bcrypt"),
        SALT_WORK_FACTOR = process.env.SALT_WORK_FACTOR || 10;

var user_fields = {
    email: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true, select: false },
    facebook_id: { type: String, index: { unique: true } },
    twitter_id: { type: String, index: { unique: true } },
    phone_number: { type: String },
    zipcode: { type: String },
    location: [Number]
}

var UserSchema = BaseSchema.extend(user_fields);

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

UserSchema.statics.loginSocial = function(social_id, account, callback) {
    account += "_id";
    this.findOne({ account : social_id }, function(err, user){
        if (err || !user) return callback(err, false);
        user.validatePassword(password, function(err, success){
            if (err || !success) return callback(err, false);
            return callback(false, user);
        });
    });
};

UserSchema.statics.create = function(data, callback) {
    var user = new UserModel({});
    SP.each(user_fields, function(key){
        var val = data[key];
        if (val) {
            user[field] = val;
        }
    });
    user.location = [data["lat"], data["lon"]];
    user.save(function(err){
        callback(err, user);
    });
}

var UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;