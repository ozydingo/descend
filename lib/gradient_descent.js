/*
  costFunction must be a function that takes a column vector of parameters (theta),
    matrix of features (X), and column vector of outcomes (y). It must generate a
    2-Array output, where the first element is the cost of the observations and the
    second element is a column vector of the cost gradient wrt each parameter (theta)
  You can specify "linear" or "logistic" to use standard cost functions.
*/

gradientDescent = function(numFeatures, costFunction) {
	var numFeatures, iteration;
	// function that takes (params, data, obs) and returns (cost, costGrad)
	var costFunction;
	// historical cost over iterations run since initialization
	var thetaLog, costLog;
	// modle params, training data, observations
	var theta, X, y;
	// learning rate
	var alpha = 0.1;

	function initialize() {
		if (typeof(numFeatures) != "number") { throw "Excepted number for numFeatures"; }
		costFunction = getCostFunction(costFunction);
		theta = math.zeros(numFeatures + 1, 1);
		iteration = 0;
		X = math.zeros(0,0);
		y = math.zeros(0);
		thetaLog = [theta];
		costLog = [];
	}

	function getCostFunction(costFunction) {
		if (costFunction == null || costFunction === "linear") {
			costFunction = linearCostFunction;
		} else if (costFunction === "logistic") {
			costFunction = logisticCostFunction;
		}
		return costFunction;
	}

	function linearCostFunction(theta, X, y) {
		var err = math.subtract(math.multiply(X, theta), y);
		var m = X.size()[0];
		var cost = math.multiply(1/(2*m), math.multiply(err.transpose(), err));
		var grad = math.multiply(1/m, math.multiply(X.transpose(), err));
		return [cost, grad];
	}

	function logisticCostFunction(theta, X, y) {
		//NIY
		return [];
	}

	function getData() {
		return {X: X, y: y};
	}

	function getTheta() {
		return theta;
	}

	function getNumObservations() {
		return X.size()[0];
	}

	function getIteration() {
		return iteration;
	}

	function observe(x0, y0) {
		if (getNumObservations() == 0) {
			setData([x0], [y0]);
		} else {
			x0 = appendBias(x0);
			validateObservation(x0, y0);
			X = math.concat(X, [x0], 0);
			y = math.concat(y, [y0], 0);
		}
		return getData();
	}

	function setData(_X, _y) {
		_X = math.matrix(_X);
		_y = math.matrix(_y);
		validateData(_X, _y);
		X = appendBias(_X);
		y = _y;
		return getData();
	}

	function getCost() {
		if (getNumObservations() == 0) { return null; }
		var costs = costFunction(theta, X, y);
		return costs[0];
	}

	function getCostLog() {
		return costLog;
	}

	function step() {
		iteration += 1;
		if (getNumObservations() == 0) { return theta; }
		var costs = costFunction(theta, X, y);
		costLog.push(costs[0]);
		thetaLog.push(theta);
		var grad = costs[1];
		theta = math.subtract(theta, math.multiply(alpha, grad));
		return theta;
	}

	function validateObservation(x0, y0) {
		if (!Array.isArray(x0)) { throw "New features must be a Javascript Array." };
		if (typeof(y0) != "number") { throw "Observation must be a number." };
		if (x0.length != numFeatures) { throw "Wrong feature size for observation: expected " + numFeatures + ", got " + x0.length + "."};
		return true;
	}

	function validateData(_X, _y) {
		if (_X.size()[1] != numFeatures) { throw "Wrong feature size for observation: expected " + numFeatures + ", got " + _X.size()[1] + "."};
		if (_X.size()[0] != _y.size()[0]) { throw "Number of feature samples (" + _X.size()[0] + ") must equal number of observations (" + _y.size()[0] + ")."}
		return true;
	}

	// Add the bias / ones feature to an observation
	function appendBias(xx) {
		if (Array.isArray(xx)) {
			return appendBiasToArray(xx);
		} else {
			return appendBiasToMatrix(xx);
		}
	}

	function appendBiasToArray(x0) {
		x0 = x0.slice(0);
		x0.unshift(1);
		return x0;
	}

	function appendBiasToMatrix(_X) {
		if (_X.size()[0] == 0) { return _X; }
		return math.concat(math.ones(_X.size()[0], 1), _X, 1);
	}

	initialize();

	return {
		getNumObservations: getNumObservations,
		getIteration: getIteration,
		getCost: getCost,
		getCostLog: getCostLog,
		observe: observe,
		step: step,
		costFunction: costFunction,
		getData: getData,
		setData: setData,
		getTheta: getTheta,
	}
}