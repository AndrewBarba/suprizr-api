
var BaseSchema = require("../schemas/base"),
LocationSchema = require("../schemas/location"),
      mongoose = require("mongoose"),
        extend = require("mongoose-schema-extend"),
        bcrypt = require("bcrypt"),
        sphttp = require("../modules/sphttp"),
        SALT_WORK_FACTOR = process.env.SALT_WORK_FACTOR || 10;

var UserSchema = BaseSchema.extend({
    email: { type: String, index: { unique: true, sparse: true } },
    facebook: { 
        id: { type: String, index: { unique: true, sparse: true } },
        username: String,
        auth_token: { type: String, select: false }
    },
    twitter: { 
        id: { type: String, index: { unique: true, sparse: true } },
    },
    stripe: { 
        id: { type: String, index: { unique: true, sparse: true } }, // customer id
        active_card: {
            exp_month: Number,
            exp_year: Number,
            fingerprint: { type: String, index: true },
            last4: String,
            card_type: String
        }
    },
    locations: { type: [LocationSchema], default: [], select: false }, // array of past order locations
    first_name: String,
    last_name: String, 
    name: String,
    phone_number: String, // cell number
    gender: String,

    password: { type: String, required: true, select: false },
    restaurant: { type: String, ref: "Restaurant" },
    admin: { type: Boolean, default: false, select: false },
});

UserSchema.statics.create = function(data, callback) {
    if (!data["password"]) data["password"] = SP.simpleGUID();
    (new User(data)).save(callback);
}

/**
 * Filters a given dict for valid user data that can be PUT into a user object
 */
UserSchema.statics.validKeys = function() {
    return ["email", "name", "first_name", "last_name", "gender", "phone_number"];
}

/**
 * Right before saving the user encrypt their password
 */
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

/**
 * Validates a plain text password for this user
 */ 
UserSchema.methods.validatePassword = function(password, callback) {
    bcrypt.compare(password, this.password, callback);
};

/**
 * Adds a delivery address to the users list of past addresses
 */
UserSchema.methods.addAddress = function(address, callback) {
    var exists = false;
    SP.each(this.locations, function(i, loc){
        if (loc.location[0] == address.location[0] && loc.location[1] == address.location[1]) {
            exists = true;
        }
    });
    if (!exists) {
        this.locations.push(address);
        this.save(callback);
    } else {
        callback(null, user);
    }
};

/**
 * Connects an existing (this) user to Facebook
 */
UserSchema.methods.connectFacebook = function(fb_auth, callback) {
    var user = this;
    sphttp.fb("/me", fb_auth, function(err, fbdata){
        if (err || !fbdata) return callback(err);
        user.facebook = {
            "id" : fbdata.id,
            "username" : fbdata.username,
            "auth_token" : fb_auth
        };
        user.save(callback);
    });
};

var User = mongoose.model("User", UserSchema);
module.exports = User;