function costLog(div, parent) {
	var div, parent;
	var costLog;
	var optimalLog = [];
	var floor = 0;
	var iteration = 0;

	function update() {
		if (parent.getDescent().getIteration() <= iteration) { return; }
		var data = xyHelper.trainingData(parent.getXYData());
		var features = math.concat(math.ones(data.features.size()[0], 1), data.features, 1);
		var optimalCost = parent.getDescent().costFunction(parent.getLlmseFit(), features, data.outcomes);
		var optCost = optimalCost[0] > 1e-20 ? math.log10(optimalCost[0]) : null;

		if (data.length > 0) { floor = math.min(floor, data[data.length][1]); }
		if (optCost) { floor = math.min(floor, optCost); }

		optimalLog.push([optimalLog.length, optCost]);

		getCostLog();

		var series = [
			{
				data: costLog,
				points: {show: true, radius: 1},
				lines: {show: true},
				color: "orange",
				label: "log<sub>10</sub> model cost"
			},
			{
				data: optimalLog,
				lines: {show: true},
				color: "red",
				label: "log<sub>10</sub> best cost"
			},

		];

		var options = {
			grid: {clickable: true},
			xaxis: {min: 0, max: getXMax()},
			yaxis: {min: floor - 1, max: 0},
			legend: {position: "ne"}
		};

		return $.plot(div, series, options);
	}

	function getCostLog() {
		var yy = parent.getDescent().getCostLog().map(function(x) {
			return math.log10(x);
		});
		costLog = yy.map(function(y, ii) {
			return [ii, y];
		});
		return costLog;
	}

	function getXMax() {
		return parent.getDescent().getIteration();
	}

	return {
		update: update
	}
}