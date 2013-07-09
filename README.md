Suprizr API
==========

This is the Suprizr backend API built with:
* node.js - a Javascript server
* express - a node routing framework
* mocha - a node testing framework

After cloning this repository please open a terminal and cd into the repo. Then run:
	
	make tests

This will run the unit tests for this project and ensure you are properly configured

Below is a list of endpoints and how to use them.

- - -

/status
----
Returns the status of the API servers. Should return:

	{
		"status" : "OK"
	}

If all servers are up and running and connected to MongoHQ

- - -

/auth
----
Auth endpoints return an auth object. The first thing you should do is store the auth_token in a safe place. This auth token will be appended to every request if available in the form of:

	https://api.suprizr.com/{foo}/{bar}?auth=MY_SPECIAL_AUTH_TOKEN

If an endpoint says '(auth)' that means an auth token MUST be included on the url to use the endpoint

#### POST /auth/register
Registers a new user via email and password

	sample_post_body = {
		"email" : "test@test.com",
		"name" : "Andrew Barba", // optional, useful for internationalization
		"first_name" : "Andrew", // optional
		"last_name" : "Barba", // optional
		"password" : "toughpassword", // this will be encrypted before saving
		"gender" : "male", // optional
		"phone_number" : "9085667524", // optional
	}

#### POST /auth/login
Logs in a user via email and password

	sample_post_body = {
		"email" : "test@test.com",
		"password" : "toughpassword",
	}

#### POST (auth-optional) /auth/facebook
Registers or logs in a user via facebook auth token. If Suprizr auth_token is included in url we connect facebook to the current Supriz user
	
	sample_post_body = {
		"facebook_auth_token" : "dneklwdnlewd90e7w90dwc09ew7c09s8c09er8w0c8dew0",
	}

#### PUT (auth) /auth/password
Changes the current users password
	
	sample_post_body = {
		"facebook_auth_token" : "dneklwdnlewd90e7w90dwc09ew7c09s8c09er8w0c8dew0",
	}

- - - 

/supriz
----
Orders a Supriz meal for the current user. The users credit card will not be charged until an admin completes an order. See /order for more details.

#### POST /supriz
Creates a new supriz meal. NOTE, there is current only support for 1 meal but I'm leaving the syntax as an array of meals for down the road.

	sample_post_body = {
		"meals" : [
		    {
		        "health": 0.8,
		        "ingredients": {
		            "gluten_free": false,
		            "dairy_free": false,
		            "peanut_free": true,
		            "meat_free": false
		        } 
		    }
		],
		"delivery_adress" : {
		    formatted_address : "700 Columbus Ave",
		    reference : "1234jl32ndlk2je3j2e9230djeiowd43de3",
		    location : [ -123.3213, 1234.23232 ] // latitude , longitude
		},
		"email" : "test@test.com",
		"phone_number" : "9085667524",
		"stripe_token" : "andklw232klndwdew"
	}
