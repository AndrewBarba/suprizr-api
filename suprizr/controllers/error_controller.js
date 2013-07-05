
function ErrorController() {

	this.e = function(code, res, err, text) {
		if (!text) text = "Something went wrong: ";
		return res.send(code, { error: text+err });
	}

	this.e400 = function(res, err, text) {
		if (!text) text = "Something went wrong: ";
		return res.send(400, { error: text+err });
	}

	this.e401 = function(res, err, text) {
		if (!text) text = "You are not authorized to use this endpoint";
		return res.send(401, { error: text });
	}

	this.e404 = function(res, err, text) {
		if (!text) text = "We could not find that object: ";
		return res.send(404, { error: text+err });
	}

}

module.exports = new ErrorController();