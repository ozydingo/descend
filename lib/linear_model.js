linearModel = function(coefs) {
	var coefs;
	var numFeatures;

	function initialize() {
		coefs = vectorize(coefs);
		validateCoefs();
		numFeatures = coefs.size()[0];
	}

	function predict(X) {
		X = vectorize(X);
		validateData(X);
		X = appendOnes(X);
		return vectorize(math.multiply(X, coefs)).transpose()._data[0];
	}

	function vectorize(data) {
		if (typeof(data) == "number") {
			return math.matrix([[data]]);
		} else if (Array.isArray(data) || data.size().length == 1) {
			return math.matrix([data]).transpose();
		} else {
			return data;
		}
	}

	function appendOnes(X) {
		return math.concat(math.ones(X.size()[0], 1), X, 1);
	}

	function validateCoefs() {
		if (coefs.size()[1] != 1) { throw "Ceofs must be n x 1 vector" };
		return true;
	}

	function validateData(X) {
		if (X.size()[1] != numFeatures - 1) { throw "Expected " + numFeatures + " columns in input data, got " + X.size()[1] + "."};
		return true;
	}

	initialize();

	return {
		predict: predict
	}
}