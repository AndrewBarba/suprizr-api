/***
 ** This contains the Suprizr API unit tests
 **/

trace = console.log;

var should = require("should"), 
    assert = require("assert"),
   request = require("supertest"),  
  mongoose = require("mongoose"),
   suprizr = require("../suprizr"),
       api = suprizr(); 

var MONGOHQ_URL = "mongodb://api:0fedf32b14@dharma.mongohq.com:10093/suprizr-dev";

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

describe("Authentication",function(){
	var email = "test@test.com"; var password = "123456789";
	var new_user = false;
	var new_auth = false;
	it("should register a new user", function(done){
		var data = {
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
		Auth.getUser(new_auth.auth_token, function(err, user){
			should.not.exist(err);
			should.exist(user);
			should.exist(user._id);
			user._id.length.should.equal(32);
			user.email.should.equal(new_user.email);
			done();
		});
	});
	it("should delete the user and the auth object", function(done){
		new_user.remove(function(err){
			should.not.exist(err);
			new_auth.remove(done);
		});
	})
});