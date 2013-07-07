
function ErrorController() {

	this.e = function(code, res, err, text) {
		if (!text) text = "Something went wrong: ";
		return res.send(code, { error: text+err });
	}

	this.e400 = function(res, err, text) {
		if (!text) text = "Something went wrong: ";
		return this.e(400, res, err, text);
	}

	this.e401 = function(res, err, text) {
		if (!text) text = "You are not authorized to use this endpoint";
		return this.e(401, res, err, text);
	}

	this.e404 = function(res, err, text) {
		if (!text) text = "We could not find that object: ";
		return this.e(404, res, err, text);
	}

}

module.exports = new ErrorController();