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
var FB_AUTH = "CAAF4fmwfZBC0BAM6wFpn3ePka17NYwwtvxJlAg55ZCsEjQhiSxrWs5DDoXlvoF4MGxLgCXlTMH3rmJMSURmRsFCw4mJdJzscZBZCie6iMst2iehdWhMbdZBfSkyjsEmpOWCn4ylZAwsEhV4HzV3ziBCD7d9K4Cz9O9XkxIDDqetQZDZD";
var SP_AUTH = "XXX";

var User = api.model.User,
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
		User.remove({}, function(err){
			should.not.exist(err);
			done();
		});
	});
	it("should delete all test auths", function(done){
		Auth.remove({}, function(err){
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
			auth.user.first_name.should.equal("Andrew");
			auth.user.last_name.should.equal("Barba");
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
			fb_user.email.should.equal(auth.user.email);
			auth.user.remove(function(err){
				should.not.exist(err);
				auth.remove(done);
			});
		});
	});
});














