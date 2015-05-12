// take matrix data, truth, produce matrix of linear model parameter estimates
function llmse(data, truth) {
    if (data.size()[0] != truth.size()[0]){
    	throw "training data size mismatch";
    }
    s = math.inv(math.multiply(data.transpose(), data));
    r = math.multiply(s, data.transpose());
    p = math.multiply(r, truth);
    return p;
}

// take array xx and produce matrix with powers of x in cols
function nlFeatures(xx, powers) {
	if (typeof(powers) == 'undefined') powers = [0,1,2];
	mm = xx.length;
	pp = powers.map(function(e) {
		return (e==0 ? math.ones(mm)._data : math.dotPow(xx,e))
	})
	return math.matrix(pp).transpose()
}