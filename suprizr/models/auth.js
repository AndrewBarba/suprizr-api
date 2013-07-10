
var BaseSchema = require("../schemas/base"),
      mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        extend = require("mongoose-schema-extend"),
        sphttp = require("../modules/sphttp"),
          User = require("./user");

var AuthSchema = BaseSchema.extend({
    auth_token : { type: String, default: SP.simpleGUID, required: true, index: { unique: true } },
    user       : { type: String, ref: "User", required: true, index : true },
    valid      : { type: Boolean, default: true },
});

/**
 * Creates Auth for an existing user
 */
AuthSchema.statics.create = function(user, callback) {
	if (!user) return callback();
	var auth = new Auth({
		"user" : user._id,
		"auth_token" : SP.simpleGUID(2),
	});
	auth.save(function(err){
		auth.populate({path:"user", select:"+password"}, callback);
	});
}

/**
 * Registers a user via email and password
 * Additional fields are below
 */
AuthSchema.statics.register = function(data, callback) {
    if (!data.email) {
        return callback("Missing email field");
    }
    var user_data = {
        "email" : data.email,
        "name" : data.name,
        "first_name" : data.first_name,
        "last_name" : data.last_name,
        "password" : data.password ? data.password : SP.simpleGUID(),
        "gender" : data.gender,
        "phone_number" : data.phone_number,
    };
    User.create(user_data, function(err, user){
    	if (err || !user) return callback(err);
    	Auth.create(user, callback);
    });
};

/**
 * Registers a user via Facebook access_token
 */
AuthSchema.statics.register.facebook = function(token, fbdata, callback) {
    var data = {
    	"first_name" : fbdata.first_name,
    	"last_name" : fbdata.last_name,
    	"email" : fbdata.email,
    	"facebook" : {
    		"id" : fbdata.id,
    		"username" : fbdata.username,
    		"auth_token" : token
    	}
    }
    User.create(data, function(err, user){
    	if (err || !user) return callback(err);
    	Auth.create(user, callback);
    });
};

/**
 * Changes a users password. Invalidates old auth_token
 */
AuthSchema.statics.changePassword = function(user, password, old_password, callback) {
    this.findOne({ "user" : user._id }, function(err, auth){
    	if (err || !auth) return callback(err);
    	user.validatePassword(old_password, function(err, success){
    		if (err || !success) return callback(err);
    		user.password = password;
    		auth.auth_token = SP.guid();
    		auth.save(function(err){
    			if (err) return callback(err);
    			user.save(function(err){
    				if (err) return callback(err);
    				callback(null, auth);
    			});
    		});
    	});
    });
};

/**
 * Logs in a user via email and password
 */
AuthSchema.statics.login = function(email, password, callback) {
	User
        .findOne({ "email" : email })
        .select("+password")
        .exec(function(err, user){
    		if (err || !user) return callback(err);
            user.validatePassword(password, function(err, success){
                if (err || !success) return callback(err);
    			Auth.getAuth(user, callback);
    		});
        });
};

/**
 * Logs in a user via facebook access token
 */
AuthSchema.statics.login.facebook = function(token, callback) {
    sphttp.fb("/me", token, function(err, fb){
    	if (err || !fb) return callback(err);
		User.findOne({ "facebook.id" : fb.id }, function(err, user){
		    if (err || !user) {
		    	Auth.register.facebook(token, fb, callback);
		    } else {
		    	if (user.facebook.auth_token != token) {
		    		user.facebook.auth_token = token;
		    		user.save(function(err){
		    			Auth.getAuth(user, callback);
		    		});
		    	} else {
		    		Auth.getAuth(user, callback);
		    	}
		    }
		});
    });
};

/**
 * Looks up Auth for a user
 */
AuthSchema.statics.getAuth = function(user, callback) {
	this
		.findOne({ "user" : user._id })
		.populate("user")
		.exec(function(err, auth){
			if (err || !auth) return callback(err);
			// If they logged in and their auth wasn't valid, regenerate an auth_token
			if (!auth.valid) {
				auth.valid = true;
				auth.auth_token = SP.guid();
				auth.save(callback);
			} else {
				callback(null, auth);
			}
		});
};

/**
 * Gets the current user via a request object or supplied auth token
 */
AuthSchema.statics.getCurrentUser = function(reqOrToken, callback, populate) {
	// return callback(null, {});
	var token = (typeof reqOrToken == "string") ? reqOrToken : reqOrToken.query.auth;
	if (token) {
		Auth
			.findOne({ "auth_token" : token, "valid" : true })
            .select("locations")
			.populate("user", populate)
			.exec(function(err, auth){
				if (err || !auth) return callback(err);
				callback(null, auth.user);
			});
	} else {
		callback("Not authorized");
	}
};

/**
 * Gets the current user and checks if they are admin
 * If not, returns null
 */
AuthSchema.statics.getAdminUser = function(req, callback) {
	this.getCurrentUser(req, function(err, user){
		if (err || !user) return callback(err);
		if (user.admin) {
			callback(null, user);
		} else {
			callback("Not authorized");
		}
	}, "+admin");
};

var Auth = mongoose.model("Authentication", AuthSchema);
module.exports = Auth;