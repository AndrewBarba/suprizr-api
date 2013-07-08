/***
 ** This contains the Suprizr API unit tests
 **/

// Globals
SP_SETTINGS = require("../settings");
SP_ENV = "development";
trace = console.log;

var should = require("should"), 
    assert = require("assert"),
   request = require("supertest"),  
  mongoose = require("mongoose"),
   suprizr = require("../suprizr"),
       api = suprizr(); 

var MONGOHQ_URL = "mongodb://api:0fedf32b14@dharma.mongohq.com:10093/suprizr-dev";
var FB_AUTH = "CAAEDsytc4r8BAH7sVOuntIwPov2YsjuNedfOlpgfn1GHjjZAM8EGCYZAm8S151FU8OaDQAr9tcvOHbXSRPMS66dKZBcBECQ3OJL9eB9hkxiwee9ZCOAvZB9YtnDvDl6aPFZCZBw6rVofRH3Q9gZBCaZA93xbAxJi1GqoZD";
var SP_AUTH = "XXX";

var    User = api.model.User,
 Restaurant = api.model.Restaurant,
	   Auth = api.model.Auth;

describe("Connect to MongoHQ", function(){
	it("should connect to our Mongo database hosted on MongoHQ", function(done){
		mongoose.connect(MONGOHQ_URL, {}, function(err){
			should.not.exist(err);
			done();
		});
	}); 
});

describe("Clean Database", function(){
	it("should delete all test users", function(done){
		User.remove({"first_name" : "Test"}, function(err){
			should.not.exist(err);
			done();
		});
	});
	it("should delete all test restaurants", function(done){
		Restaurant.remove({"name" : /Test/}, function(err){
			should.not.exist(err);
			done();
		});
	});
});

describe("Authentication",function(){
	var email = "test+"+SP.s4()+"@test.com"; var password = "123456789";
	var new_user = false;
	var new_auth = false;

	it("should register a new user", function(done){
		var data = {
			"first_name" : "Test",
			"last_name" : "Test"+SP.s4(),
			"email" : email,
			"password" : password,
			"zipcode" : "07853",
			"lat": 1234.123,
			"lon": -1234.123
		};
		Auth.register(data, function(err, auth){
			should.not.exist(err);
			should.exist(auth);
			should.exist(auth.user);
			new_auth = auth;
			new_user = auth.user;
			done();
		});
	});
	it("should login an existing user", function(done){
		Auth.login(email, password, function(err, auth){
			should.not.exist(err);
			should.exist(auth);
			should.exist(auth.user);
			auth.user.email.should.equal(email);
			done();
		});
	});
	it("should get the current user via auth token", function(done){
		Auth.getCurrentUser(new_auth.auth_token, function(err, user){
			should.not.exist(err);
			should.exist(user);
			should.exist(user._id);
			user._id.length.should.equal(32);
			user.email.should.equal(new_user.email);
			done();
		});
	});
	it("should update the existing user", function(done){
		User.putData(new_user._id, {"first_name" : "Test"}, function(err, user){
			should.not.exist(err);
			should.exist(user);
			user.first_name.should.equal("Test");
			done();
		});
	});
	it("should change the users password", function(done){
		Auth.changePassword(new_user, "helloworld", password, function(err, auth){
			should.not.exist(err);
			should.exist(auth);
			auth.auth_token.should.not.equal(new_auth.auth_token);
			Auth.login(email, "helloworld", function(err, auth){
				should.not.exist(err);
				should.exist(auth);
				should.exist(auth.user);
				auth.user.email.should.equal(email);
				done();
			});
		});
	});
	it("should delete the user and the auth object", function(done){
		new_user.remove(function(err){
			should.not.exist(err);
			new_auth.remove(done);
		});
	})
});

describe("Facebook", function(){
	fb_user = false;
	it("should create a new user via facebook", function(done){
		Auth.login.facebook(FB_AUTH, function(err, auth){
			should.not.exist(err);
			should.exist(auth);
			should.exist(auth.user.facebook);
			auth.user.facebook.auth_token.should.equal(FB_AUTH);
			auth.user.first_name.should.equal("Test");
			auth.user.last_name.should.equal("Suprizr");
			fb_user = auth.user;
			done();
		});
	});
	it("should login an existing facebook user", function(done){
		Auth.login.facebook(FB_AUTH, function(err, auth){
			should.not.exist(err);
			should.exist(auth);
			should.exist(auth.user.facebook);
			auth.user.facebook.auth_token.should.equal(FB_AUTH);
			fb_user._id.should.equal(auth.user._id);
			auth.user.remove(function(err){
				should.not.exist(err);
				auth.remove(done);
			});
		});
	});
});

describe("Restaurant", function(){
	it("should create a restaurant", function(done){
		done();
	});
});














