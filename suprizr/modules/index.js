
function Module() {
	this.Stripe = require("./stripe");
	this.Request = require("./sphttp");
}

module.exports = new Module();