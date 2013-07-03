/***
 ** This contains the Suprizr API unit tests
 **/

var should = require("should"), 
    assert = require("assert"),
   request = require("supertest"),  
  mongoose = require("mongoose"),
   suprizr = require("../suprizr"),
       api = suprizr(); 

var MONGOHQ_URL = "mongodb://api:0fedf32b14@dharma.mongohq.com:10093/suprizr-dev";

describe("Connect to MongoHQ", function(){
	it("should connect to our Mongo database hosted on MongoHQ", function(done){
		mongoose.connect(MONGOHQ_URL, {}, function(err){
			should.not.exist(err);
			done();
		});
	}); 
});

describe("Test",function(){
	it("should find the variable name in the user model", function(done){
		should.exist(true);
		done();
	});
});