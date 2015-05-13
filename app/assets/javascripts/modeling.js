modeling = function() {

	// take matrix features, outcome, produce matrix of linear model parameter estimates
	function llmse(features, outcome) {
		if (features.size()[0] == 0 || features.size()[1] == 0) return math.matrix()
		if (features.size()[0] != outcome.size()[0]) throw "training data size mismatch";

		s = math.multiply(features.transpose(), features);
		if (math.det(s) < 1e-10) return math.multiply(math.ones(features.size()[1], 1), NaN)
		si = math.inv(s);
		r = math.multiply(si, features.transpose());
		p = math.multiply(r, outcome);

		return p;
	}

	descend = function() {
		var coefs, alpha = 0.01;

		function step(features, outcome, n) {
			var newCoefs;
			if (n === undefined) n=1;
			if (coefs === undefined) coefs = math.zeros(features.size()[1],1);

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

		return {
			init: init,
			step: step,
			coefs: coefs
		}
	}();

	// take array xx and produce matrix with powers of x in cols
	function nlFeatures(xx, powers) {
		if (powers === undefined) powers = [0,1,2];
		if (xx.length == 0) return math.ones(0,powers.length)
		mm = xx.length;
		pp = powers.map(function(e) {
			return (e==0 ? math.ones(mm)._data : math.dotPow(xx,e))
		})
		return math.matrix(pp).transpose()
	}

	return {
		llmse: llmse,
		nlFeatures: nlFeatures,
		descend: descend
	}
}();