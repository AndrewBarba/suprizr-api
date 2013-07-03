
function User(mongoose) {
	this.name = "Andrew";
}

module.exports = function(mongoose) {
	return new User(mongoose);
}