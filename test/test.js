/***
 ** This contains the Suprizr API unit tests
 **/

var should = require("should"); 
var assert = require("assert");
var request = require("supertest");  
var mongoose = require("mongoose");
var suprizr = require("suprizr")(false, mongoose, {"test":true}); 

describe("Test",function(){
	it("should find the variable name in the user model", function(){
		assert.equal(suprizr.models.user.name,"Andrew");
	});
});