
var BaseSchema = require("../schemas/base"),
LocationSchema = require("../schemas/location");
      mongoose = require("mongoose"),
        extend = require("mongoose-schema-extend");
        bcrypt = require("bcrypt"),
        sphttp = require("../modules/sphttp"),
        SALT_WORK_FACTOR = process.env.SALT_WORK_FACTOR || 10;

var user_fields = {
    email: { type: String, required: true, index: { unique: true } },
    facebook: { 
        id: { type: String, index: { unique: true } },
        username: String,
        auth_token: String
    },
    twitter: { 
        id: { type: String, index: { unique: true } },
    },
    stripe_id: { type: String, index: { unique: true } },
    locations: [LocationSchema], // array of past order locations
    first_name: String,
    last_name: String, 
    name: String,
    phone_number: String, // cell number
    gender: String
};

var additional_fields = {
    password: { type: String, required: true, select: false },
    restaurant: { type: String, ref: "Restaurant" },
    admin: { type: Boolean, default: false, select: false },
};

var fields = SP.extend(additional_fields, user_fields);
var UserSchema = BaseSchema.extend(fields);

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

UserSchema.methods.putData = function(data, callback) {
    var user = this;
    SP.each(user_fields, function(key){
        var val = data[key];
        if (val) {
            user[key] = val;
        }
    });
    var pass = data["password"];
    if (pass) user.password = pass;
    var locs = data["locations"];
    if (locs && locs.length) {
        user.locations = user.locations.concat(locs);
    }
    var fb_auth = data["facebook_auth"];
    if (fb_auth) {
        user.connect.facebook(fb_auth, function(err, user){
            if (err || !user) return callback(err);
            callback(null, user); // facebook connect method will save
        });
    } else {
        user.save(function(err){
            callback(err, user);
        });
    }
};

UserSchema.methods.connect = function(){};

UserSchema.methods.connect.facebook = function(fb_auth, callback) {
    sphttp.fb("/me", fb_auth, function(err, fb){
        if (err || !fb) return callback(err);
        this.facebook_id = fb.id;
        this.facebook_auth = fb_auth;
        this.save(function(err){
            if (err) return callback(err);
            callback(null, this);
        });
    });
};

UserSchema.statics.login = function(email, password, callback) {
	this
        .findOne({ "email" : email })
        .select("+password")
        .exec(function(err, user){
    		if (err || !user) return callback(err);
            user.validatePassword(password, function(err, success){
                if (err || !success) return callback(err);
    			return callback(null, user);
    		});
        });
};

UserSchema.statics.create = function(data, callback) {
    var user = new User({});
    user.putData(data, callback);
};

var User = mongoose.model("User", UserSchema);
User.allowed_keys = Object.keys(user_fields);
module.exports = User;