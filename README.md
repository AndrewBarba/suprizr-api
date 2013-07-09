Suprizr API
==========

This is the Suprizr backend API built with:
* node.js - a Javascript server
* express - a node routing framework
* mocha - a node testing framework

After cloning this repository please open a terminal and cd into the repo. Then run
	make tests
This will run the unit tests for this project and ensure you are properly configured

Below is a list of endpoints and how to use them.

/auth
==========
Auth endpoints return an auth object. The first thing you should do is store the auth_token in a safe place. This auth token will be appended to every request if available in the form of:
	https://api.suprizr.com/{foo}/{bar}?auth=MY_SPECIAL_AUTH_TOKEN
If an enpoint says '(auth)' that means this auth token MUST be included on the url to use the endpoint

POST /auth/register - Registers a new user via email and password
	sample_post_body = {
		"email" : "test@test.com",
		"name" : "Andrew Barba", // optional, useful for internationalization
		"first_name" : "Andrew", // optional
		"last_name" : "Barba", // optional
		"password" : "toughpassword", // this will be encrypted before saving
		"gender" : "male", // optional
		"phone_number" : "9085667524", // optional
	}

POST /auth/login - Logs in a user via email and password
	sample_post_body = {
		"email" : "test@test.com",
		"password" : "toughpassword",
	}

POST (auth-optional) /auth/facebook - Registers or logs in a user via facebook auth token. If Suprizr auth token is included we connect facebook the current Supriz user
	sample_post_body = {
		"facebook_auth_token" : "dneklwdnlewd90e7w90dwc09ew7c09s8c09er8w0c8dew0",
	}

PUT (auth) /auth/password - Changes the current users password
	sample_post_body = {
		"facebook_auth_token" : "dneklwdnlewd90e7w90dwc09ew7c09s8c09er8w0c8dew0",
	}
