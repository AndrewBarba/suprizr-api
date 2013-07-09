/***
 ** This contains the Suprizr API unit tests
 **/

// Globals
SP_SETTINGS = require("../settings");
SP_ENV = "development";
SP_PROD = SP_ENV == "production";
SP_UNIT_TEST = true; // set unit testing to true
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
       Meal = api.model.Meal,
      Order = api.model.Order,
	   Auth = api.model.Auth,
	 Stripe = api.module.Stripe,
	Request = api.module.Request;

function clean() {
	describe("Clean Database", function(){
		it("should delete all test auth records", function(done){
			Auth.remove({"unit_test" : true}, done);
		});
		it("should delete all test users", function(done){
			User.remove({"unit_test" : true}, done);
		});
		it("should delete all test restaurants", function(done){
			Restaurant.remove({"unit_test" : true}, done);
		});
		it("should delete all test meals", function(done){
			Meal.remove({"unit_test" : true}, done);
		});
		it("should delete all test orders", function(done){
			Order.remove({"unit_test" : true}, done);
		});
	});
}

describe("Connect to MongoHQ", function(){
	it("should connect to our Mongo database hosted on MongoHQ", function(done){
		mongoose.connect(MONGOHQ_URL, {}, done);
	}); 
});

clean();

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
			done();
		});
	});
});

describe("Restaurant", function(){
	var supreme = false;
	var boloco = false;
	var sushi = false;
	it("should create supreme pizza", function(done){
		var supreme_data = {
			"name" : "Test Supreme Pizza",
			"address" : {
				"formatted_address" : "177 Massachusetts Avenue, Boston, MA, United States",
				"reference" : "xxx",
				"location" : [42.345803, -71.087224]
			},
			"description" : "An awesome pizza place",
			"radius" : 2,
			"delivery_fee" : 5.00,
			"delivery_hours" : {
				"start" : 10,
				"end" : 24
			}
		};
		Restaurant.create(supreme_data, function(err, doc){
			should.not.exist(err);
			should.exist(doc);
			doc.name.should.equal("Test Supreme Pizza");
			doc.address.reference.should.equal("xxx");
			supreme = doc;
			done();
		});
	});
	it("should create boloco", function(done){
		var boloco_data = {
			"name" : "Test Boloco",
			"address" : {
				"formatted_address" : "177 Massachusetts Avenue, Boston, MA, United States",
				"reference" : "yyy",
				"location" : [42.345803, -71.087224]
			},
			"description" : "A burrito place",
			"radius" : 2,
			"delivery_fee" : 5.00,
			"delivery_hours" : {
				"start" : 10,
				"end" : 24
			}
		};
		Restaurant.create(boloco_data, function(err, doc){
			should.not.exist(err);
			should.exist(doc);
			doc.name.should.equal("Test Boloco");
			doc.address.reference.should.equal("yyy");
			boloco = doc;
			done();
		});
	});
	it("should create sushi", function(done){
		var sushi_data = {
			"name" : "Test Symphony Sushi",
			"address" : {
				"formatted_address" : "177 Massachusetts Avenue, Boston, MA, United States",
				"reference" : "zzz",
				"location" : [42.345803, -74.087224]
			},
			"description" : "A sushi place",
			"radius" : 2,
			"delivery_fee" : 5.00,
			"delivery_hours" : {
				"start" : 10,
				"end" : 24,
			}
		};
		Restaurant.create(sushi_data, function(err, doc){
			should.not.exist(err);
			should.exist(doc);
			doc.name.should.equal("Test Symphony Sushi");
			doc.address.reference.should.equal("zzz");
			sushi = doc;
			done();
		});
	});

	it("should find restaurants near a point", function(done){
		Restaurant.findNearBy([42.345803, -71.087224], function(err, docs, rids){
			should.not.exist(err);
			should.exist(docs);
			should.exist(rids);
			trace(rids);
			done();
		});
	})
});

describe("Stripe", function(){
	
	var user1 = false;
	var user2 = false;
	var token1 = false;
	var token_data = {
		"card" : {
			"number" : "4242424242424242",
			"exp_month" : "1",
			"exp_year" : "2015",
			"name" : "Test User"
		}
	};

	it("should create a token", function(done){
		Stripe.api.token.create(token_data, function(err, tok){
			should.not.exist(err);
			should.exist(tok);
			token = tok;
			done();
		});
	});

	it("should create a new user via stripe token", function(done){
		Stripe.createUser(token.id, function(err, user){
			should.not.exist(err);
			should.exist(user);
			user1 = user;
			done();
		});
	});

	it("should link to existing user since credit data is the same", function(done){
		Stripe.api.token.create(token_data, function(err, tok){
			Stripe.createUser(token.id, function(err, user){
				should.not.exist(err);
				should.exist(user);
				user._id.should.equal(user1._id);
				done();
			});
		});
	});

	it("should add stripe data to a user", function(done){
		User.create({first_name:"Test"}, function(err, user){
			should.not.exist(err);
			should.exist(user);
			Stripe.api.token.create(token_data, function(err, tok){
				Stripe.putUser(user, tok.id, function(err, user){
					should.not.exist(err);
					should.exist(user);
					user.stripe.active_card.last4.should.equal("4242");
					user2 = user;
					done();
				});
			});
		});
	});

	it("should charge an existing user", function(done){
		Stripe.chargeUser(user2, 20.00, function(err, charge){ // amount in dollars
			should.not.exist(err);
			should.exist(charge);
			charge.customer.should.equal(user2.stripe.id);
			charge.amount.should.equal(2000); // amount in cents
			done();
		});
	});
});























clean();
