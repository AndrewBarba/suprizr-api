
var BaseSchema = require("./base"),
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
    		Auth
    			.findOne({ "auth_token" : auth.auth_token })
    			.populate("user")
    			.exec(callback);
    	});
    });
};

AuthSchema.statics.changePassword = function(user, password, callback) {
    this.findOne({ "user" : user._id }, function(err, auth){
    	if (err || !auth) return callback(err);
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
		User.findOne({ "facebook_id" : fb.id }, function(err, user){
		    if (err || !user) return callback(err);
		    Auth.getAuth(user, callback);
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

AuthSchema.statics.getCurrentUser = function(req, callback, admin) {
	var token = (typeof req == "string") ? req : req.query.auth;
	if (token) {
		this
			.findOne({ "auth_token" : token, "valid" : true })
			.populate("user", "+admin")
			.exec(function(err, auth){
				if (err || !auth) return callback(err);
				if (admin) {
					if (auth.user.admin) {
						callback(null, auth.user);
					} else {
						callback();
					}
				} else {
					callback(null, auth.user);
				}
			});
	} else {
		callback();
	}
};

AuthSchema.statics.getStaffUser = function(req, callback) {
	this.getCurrentUser(req, callback, true);
};

var Auth = mongoose.model("Authentication", AuthSchema);
module.exports = Auth;