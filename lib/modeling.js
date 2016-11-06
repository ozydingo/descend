modeling = function() {

	// take matrix features, outcome, produce matrix of linear model parameter estimates
	function llmse(features, outcome) {
		if (features.size()[0] == 0 || features.size()[1] == 0) return math.matrix().resize([features.size()[1], 0])
		if (features.size()[0] != outcome.size()[0]) throw "training data size mismatch";

		features = math.concat(math.ones(features.size()[0], 1), features, 1);
		s = math.multiply(features.transpose(), features);
		if (math.det(s) < 1e-10) return math.multiply(math.ones(features.size()[1], 1), NaN)
		si = math.inv(s);
		r = math.multiply(si, features.transpose());
		p = math.multiply(r, outcome);

		return p;
	}

	return {
		llmse: llmse,
	}
}();