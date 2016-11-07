function costLog(div, parent) {
	var div, parent;
	var data;

	function update() {
		getData();

		var series = [{
			data: data,
			points: {show: true, radius: 1},
			lines: {show: true},
			color: "blue",
			label: "log<sub>10</sub> cost"
		}];

		var options = {
			grid: {clickable: true},
			xaxis: {min: 0, max: getXMax()},
			yaxis: {min: -10, max: 0}
		};

		return $.plot(div, series, options);
	}

	function getData() {
		var yy = parent.getDescent().getCostLog().map(function(x) {
			return math.log(x);
		});
		data = yy.map(function(y, ii) {
			return [ii, y];
		});
		return data;
	}

	function getXMax() {
		return parent.getDescent().getIteration();
	}

	return {
		update: update
	}
}