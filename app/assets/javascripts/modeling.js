modeling = function() {

	// take matrix features, outcome, produce matrix of linear model parameter estimates
	function llmse(features, outcome) {
		if (features.size()[0] == 0 || features.size()[1] == 0) return math.matrix().resize([features.size()[1], 0])
		if (features.size()[0] != outcome.size()[0]) throw "training data size mismatch";

		s = math.multiply(features.transpose(), features);
		if (math.det(s) < 1e-10) return math.multiply(math.ones(features.size()[1], 1), NaN)
		si = math.inv(s);
		r = math.multiply(si, features.transpose());
		p = math.multiply(r, outcome);

		return p;
	}

	// create new instance of descend model
	function descent() {
		var coefs, alpha = 0.05;

		function step(features, outcome, n) {
			var newCoefs;
			if (n === undefined) n=1;
			if (coefs === undefined) coefs = math.zeros(features.size()[1],1);
			if (features.size()[0] == 0) return coefs;

			newCoefs = coefs.clone()
			for (ii=0; ii<n; ii++) {
				var e = math.subtract(math.multiply(features, coefs), outcome);
				var m = features.size()[1];
				var d = math.multiply(1/m, math.multiply(features.transpose(), e));
				newCoefs = math.subtract(coefs, math.multiply(alpha, d))
				coefs = newCoefs.clone()
			};
			return coefs;
		}

		function init() {
			coefs = undefined;
		}

		function getCoefs() {return coefs}

		return {
			init: init,
			step: step,
			getCoefs: getCoefs
		}
	};

	function computeCost(features, outcome, coefs) {
		var predictions = math.multiply(features, coefs);
		err = math.subtract(outcome, predictions)
		return math.mean(math.dotPow(err,2))
	}

	return {
		llmse: llmse,
		descent: descent,
		computeCost: computeCost
	}
}();