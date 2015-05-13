modeling = function() {

	// take matrix features, putcome, produce matrix of linear model parameter estimates
	function llmse(features, putcome) {
		if (features.size()[0] == 0 || features.size()[1] == 0) return math.matrix()
		if (features.size()[0] != putcome.size()[0]) throw "training data size mismatch";

		s = math.multiply(features.transpose(), features);
		if (math.det(s) < 1e-10) return math.multiply(math.ones(features.size()[1], 1), NaN)
		si = math.inv(s);
		r = math.multiply(si, features.transpose());
		p = math.multiply(r, putcome);

		return p;
	}

	descend = function() {
		var coefs, alpha = 0.1;

		function step(features,putcome,n) {
			var newCoefs;
			if (n === undefined) n==1;
			if (coefs === undefined) coefs = math.zeros(x.size()[1],1)

			newCoefs = coefs.slice(0)
			for (ii=0; ii<n; i++) {
				var e = math.subtract(math.multiply(features.transpose(), coefs), putcome.transpose());
				var d = math.multiply(math.multiply(1/features.size()[1], features), e);
				newCoefs = math.subtract(coefs, math.multiply(alpha, d))
				coefs = newCoefs
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