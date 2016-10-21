// helper for data tasks, e.g.
// transcforming x, y vectors into features / outcome matrices
// generating x or x&y support vectors
var xyHelper = function() {
	function appendOnes(X) {
		return math.concat(math.ones(X.size()[0], 1), X, 1);
	}

	// generate a column vector from an array
	function vectorize(array) {
		return array.length == 0 ? math.matrix() : math.matrix([array]).transpose();
	}

	// generate a matrix with columns equal to powers of the input array
	function computePowers(array, powers) {
		if (powers==undefined) powers = [1];
		if (array.length==0) return math.ones(0, powers.length);
		var pp = powers.map(function(ee) {
			if (ee==0) {
				return math.ones(array.length)
			} else if (ee==1) {
				return math.matrix(array)
			} else {
				return math.dotPow(array,ee)
			}
		})
		return math.matrix(pp).transpose()
	}

	// return features and outcomes from zipped xy Arrays
	function trainingData(zippedXY, powers) {
		var unzippedXY = unzipXY(zippedXY);
		var f = computePowers(unzippedXY.x, powers);
		var o = vectorize(unzippedXY.y);
		return {features: f, outcomes: o}
	}

	// compute linear fit to xyData including powers
	function llmse(xyData, powers) {
		var data = trainingData(xyData, powers);
		return modeling.llmse(data.features, data.outcomes);
	}

	// compute cost function for data and coefs
	function computeCost(xyData, powers, coefs) {
		var data = trainingData(xyData, powers);
		return modeling.computeCost(data.features, data.outcomes, coefs)
	}

	// generate matrix of support values for given dimensions
	function xSupport(min, max, num) {
		if (num===undefined) num=50;
		if (min >= max) throw "Cannot compute support vector for (" + min + ", " + max + ")";
		step = (max - min) / num;
		return math.range(min, max + step, step)._data;
	}

	function getFitLine(coefs, powers, min, max, num) {
		var model = linearModel(coefs);
		var xVals = xSupport(min, max, num);
		var features = computePowers(xVals, powers);
		var yVals = model.predict(xVals);
		return zipXY(xVals, yVals);
	}

	// predict y (Array) from x (Array) given coefs (Matrix) and powers (Array)
	function predict(coefs, features) {
		if (powers===undefined) powers=[1];
		if (powers.length != coefs.size()[0] - 1) throw "Size mismatch between powers and coefs";
		var fMatrix = features(xArray, powers);
		var pMatrix = math.multiply(fMatrix, coefs);
		return pMatrix.transpose()._data[0];
	}

	// zip arrays x and y into [x,y] paris
	function zipXY(xArray, yArray) {
		return xArray.map(function(_,ii) {
			return [xArray[ii], yArray[ii]];
		});
	}

	// unzip Array of [x,y] into xArray and yArray
	function unzipXY(xyArray) {
		var xArray = xyArray.map(function(xy){return xy[0]});
		var yArray = xyArray.map(function(xy){return xy[1]});
		return {x: xArray, y: yArray}
	}

	return {
		trainingData: trainingData,
		llmse: llmse,
		computeCost: computeCost,
		xSupport: xSupport,
		getFitLine: getFitLine,
		zipXY: zipXY,
		unzipXY: unzipXY
	}
}();