
var BaseSchema = require("./base"),
      mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        extend = require("mongoose-schema-extend"),
          User = require("./user");

var AuthSchema = new Schema({
    auth_token : { type: String, required: true, index: { unique: true } },
    user       : { type: String, ref: "User", required: true, index : true },
    valid      : Boolean,
    created_at : { type: Date, default: Date.now } 
});

AuthSchema.pre("save", function(next) {
    if (this.isModified() || !this.auth_token) {
    	trace("Creating GUID for AuthSchema");
    	this.auth_token = SP.guid();
    	this.valid = true;
    }
    next();
});

AuthSchema.statics.register = function(data, callback) {
    User.create(data, function(err, user){
    	if (err || !user) return callback(err);
    	var auth = new Auth({
    		"user" : user._id,
    	});
    	auth.save(function(err){
    		if (err) return callback(err);
    		auth.user = user;
    		callback(err, auth);
    	});
    });
};

AuthSchema.statics.login = function(email, password, callback) {
	User.login(email, password, function(err, user){
		if (err || !user) return callback(err);
		AuthSchema
			.findOne({ "user" : user._id })
			.populate("user")
			.exec(function(err, auth){
				if (err || !auth) return callback(err);
				// If they logged in and their auth wasn't valid, regenerate an auth_token
				if (!auth.valid) {
					auth.valid = true;
					auth.save(function(err){
						if (err) return callback(err);
						callback(false, this);
					});
				} else {
					callback(false, auth);
				}
			});
	});
};

AuthSchema.statics.getUser = function(token, callback) {
	if (token) {
		this
			.findOne({ "auth_token" : token, "valid" : true })
			.populate("user")
			.exec(function(err, auth){
				if (err || !user) return callback(err);
				callback(false, auth.user);
			});
	} else {
		callback();
	}
};

var Auth = mongoose.model("Authentication", AuthSchema);
module.exports = Auth;