
var BaseSchema = require("../schemas/base"),
LocationSchema = require("../schemas/location");
      mongoose = require("mongoose"),
        extend = require("mongoose-schema-extend");
        bcrypt = require("bcrypt"),
        sphttp = require("../modules/sphttp"),
        SALT_WORK_FACTOR = process.env.SALT_WORK_FACTOR || 10;

var UserSchema = BaseSchema.extend({
    email: { type: String, index: { unique: true, sparse: true } },
    facebook: { 
        id: { type: String, index: { unique: true, sparse: true } },
        username: String,
        auth_token: String
    },
    twitter: { 
        id: { type: String, index: { unique: true, sparse: true } },
    },
    stripe_id: { type: String, index: { unique: true, sparse: true } },
    locations: [LocationSchema], // array of past order locations
    first_name: String,
    last_name: String, 
    name: String,
    phone_number: String, // cell number
    gender: String,

    password: { type: String, required: true, select: false },
    restaurant: { type: String, ref: "Restaurant" },
    admin: { type: Boolean, default: false, select: false },
});

UserSchema.pre("save", function(next) {
    var self = this;
    if (!self.isModified("password")) return next();
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);
        bcrypt.hash(self.password, salt, function(err, hash) {
            if (err) return next(err);
            self.password = hash;
            next();
        });
    });
});

UserSchema.statics.create = function(data, callback) {
    var doc = new User();
    doc.putData(data, callback);
}

UserSchema.methods.validatePassword = function(password, callback) {
    bcrypt.compare(password, this.password, callback);
};

UserSchema.methods.connect = function(){};

UserSchema.methods.connect.facebook = function(fb_auth, callback) {
    var user = this;
    sphttp.fb("/me", fb_auth, function(err, fbdata){
        if (err || !fb) return callback(err);
        user.facebook = {
            "id" : fbdata.id,
            "username" : fbdata.username,
            "auth_token" : token
        };
        user.save(function(err){
            if (err) return callback(err);
            return callback(null, user);
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

var User = mongoose.model("User", UserSchema);
module.exports = User;