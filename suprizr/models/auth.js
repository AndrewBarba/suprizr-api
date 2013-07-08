
var BaseSchema = require("../schemas/base"),
      mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        extend = require("mongoose-schema-extend"),
        sphttp = require("../modules/sphttp"),
          User = require("./user");

var AuthSchema = BaseSchema.extend({
    auth_token : { type: String, default: SP.guid, required: true, index: { unique: true } },
    user       : { type: String, ref: "User", required: true, index : true },
    valid      : { type: Boolean, default: true },
});

AuthSchema.statics.register = function(data, callback) {
    User.create(data, function(err, user){
    	if (err || !user) return callback(err);
    	var auth = new Auth({
    		"user" : user._id,
    	});
    	auth.save(function(err){
    		auth.populate({path:"user", select:"+password"}, callback);
    	});
    });
};

AuthSchema.statics.register.facebook = function(token, fbdata, callback) {
    fbdata.facebook = {
    	"id" : fbdata.id,
    	"username" : fbdata.username,
    	"auth_token" : token
    };
    fbdata.id = null;
    if (!fbdata.password) {
    	fbdata.password = SP.simpleGUID();
    }
    Auth.register(fbdata, callback);
};

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

AuthSchema.statics.login = function(email, password, callback) {
	User.login(email, password, function(err, user){
		if (err || !user) return callback(err);
		Auth.getAuth(user, callback);
	});
};

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
				auth.save(function(err){
					if (err) return callback(err);
					callback(null, auth);
				});
			} else {
				callback(null, auth);
			}
		});
};

AuthSchema.statics.getCurrentUser = function(req, callback, populate) {
	// return callback(null, {});
	var token = (typeof req == "string") ? req : req.query.auth;
	if (token) {
		this
			.findOne({ "auth_token" : token, "valid" : true })
			.populate("user", populate)
			.exec(function(err, auth){
				if (err || !auth) return callback(err);
				callback(null, auth.user);
			});
	} else {
		callback();
	}
};

AuthSchema.statics.getAdminUser = function(req, callback) {
	this.getCurrentUser(req, function(err, user){
		if (err || !user) return callback(err);
		if (user.admin) {
			callback(null, user);
		} else {
			callback();
		}
	}, "+admin");
};

var Auth = mongoose.model("Authentication", AuthSchema);
module.exports = Auth;