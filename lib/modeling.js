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

	// input matrix features, outcomes, nx1 matrix coefs
	function computeCost(features, outcomes, coefs) {
		if (features.size()[0]==0) return;
		var predictions = math.multiply(features, coefs);
		err = math.subtract(outcomes, predictions);
		return math.mean(math.dotPow(err,2))
	}

	// input matrix features, outcomes, Array of Arrays of coef values
	// coefArrays[ii] is array of ii'th coefficient values
	function computeCostMatrix(features, outcomes, coefArrays) {
		var size = coefArrays.map(function(x){return x.length});
		var ndim = size.length;
		var costMatrix = math.zeros.apply(this, size);
		// array of indices into coefArrays
		var ii = math.zeros(ndim).toArray();
		// current index to increment
		while (ii) {
			var coefs = math.matrix(ii.map(function(i,j){return coefArrays[j][i]})).transpose();
			var index = math.index.apply(this,ii);
			var cost = modeling.computeCost(features, outcomes, coefs);
			costMatrix.subset(index, cost);
			ii = modIncrementArrayIndex(ii,size);
		}
		return costMatrix
	}

	// modularly increment an index with carryover.
	// return undefined if we're done.
	function modIncrementArrayIndex(ii, size) {
		var kk = 0;
		while (kk<ii.length) {
			if (++ii[kk] >= size[kk]) {
				ii[kk++] = 0;
			} else {
				break;
			}
		}
		if (kk<ii.length) return ii
	}

	return {
		llmse: llmse,
		descent: descent,
		computeCost: computeCost,
		computeCostMatrix: computeCostMatrix
	}
}();