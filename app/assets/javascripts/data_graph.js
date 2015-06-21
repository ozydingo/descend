/* Interface to the main graph
 * This graph contains the clickable canvas, data points,
 * fit lines, and any HUDs
 */

dataGraph = function(mainDiv, options) {
	var xyData, llmseFit, xPowers = [0,1];
	var thePlot, descent, huds;
	var divs;
	var descent = modeling.descent();

	function getDiv(name) {
		return $("#" + name)
	}

	function initialize(mainDiv, options) {
		divs = {
			main: getDiv(mainDiv),
			clear: getDiv(options["clear"]),
			descend: getDiv(options["descend"]),
			maxN: getDiv(options["maxN"])
		}
		divs["main"].bind("plotclick", function(event, pos, item){
			pushData(pos.x, pos.y);
		});
		divs["clear"].click(clearData);
		divs["descend"].click(toggleDescent);
		divs["maxN"].change(updateData);
		huds = [costHUD("costPlot0")];
		clearData();
	}

	function pushData(x,y) {
		xyData.push([x, y]);
		updateData();
	}

	function toggleDescent() {
		var descentEnabled = $("#btn_descend").attr("value");
		if (descentEnabled === "off") {
			descentEnabled = setInterval(descend, 20);
			divs["descend"].text("Stop");
		} else {
			clearInterval(descentEnabled);
			descentEnabled = "off";
			divs["descend"].text("Descend");
		}
		divs["descend"].attr("value", descentEnabled);
	}

	// generate callback for "the data has changed"
	function updateData() {
		xyData = pruneData(xyData);
		llmseFit = xyHelper.llmse(xyData, xPowers);
		plotIt();
		huds.forEach(function(hud){hud.update()});
	}

	// run n iterations given current data
	function descend(n) {
		data = xyHelper.trainingData(xyData);
		descent.step(data.features, data.outcomes, n);
		plotIt();
		huds.forEach(function(hud){hud.update()});
	}

	function clearData() {
		xyData = [];
		updateData();
	}

	// general function to plot data and any fit lines
	function plotIt() {
		// plot options
		var options = {
			grid: {clickable: true},
			xaxis: {min: 0, max: 1},
			yaxis: {min: 0, max: 1}
		};

		// Add data points to plot data
		var series = [{
			data: xyData,
			points: {show: true},
			color: "blue"
		}];

		// add llmse fit line if it exists
		if (llmseFit) {
			var fitData = getFitPlotData(llmseFit);
			series.push({
				data: fitData,
				lines: {show: true},
				color: "red"
			});
		}

		// add descent fit line if it exists
		var dFit;
		if (dFit = descent.getCoefs()) {
			var fitData = getFitPlotData(dFit);
			series.push({
				data: fitData,
				lines: {show: true},
				color: "orange"
			});
		}

		thePlot = $.plot(divs["main"], series, options);
		return thePlot;
	}

	// limit to manN data points
	function pruneData(xyData) {
		while (xyData.length > Number(divs["maxN"].val())) {xyData.shift()};
		return xyData
	}

	// return x,y data for llmse fit
	function getFitPlotData(coefs) {
		if (!coefs || coefs.size()[1]==0) return [];
		var xMin = thePlot.getAxes().xaxis.min;
		var xMax = thePlot.getAxes().xaxis.max;
		return xyHelper.getFitLine(coefs, xPowers, xMin, xMax, 50)
	}

	function costHUD(divname) {
		var xLim, yLim;
		var div = getDiv(divname);

		function update() {
			if (xyData.length==0) return;

			var d = xyHelper.trainingData(xyData);
			var dFit = descent.getCoefs() || math.matrix([[0],[0]]);
			var plotIndices = [0,1];
			var support = plotIndices.map(function(ii) {
				var val = dFit.subset(math.index(ii,0));
				return math.range(val - 1, val + 1, 0.1).toArray()
			});
			var costMatrix = modeling.computeCostMatrix(d.features, d.outcomes, support)
			var data = new vis.DataSet();
			var counter = 0;
			math.forEach(costMatrix, function(c,ii) {
				data.add({
					id: counter++,
					x:support[0][ii[0]],
					y:support[1][ii[1]],
					z:c,
					style:c
				});
			});

			// specify options
			var options = {
				xLabel: "x0",
				yLabel: "x1",
				zLabel: "cost",
				xStep: 0.5,
				yStep: 0.5,
				xStep: 0.5,
				yCenter: "35%",
				width: div.width() + "px",
				height: div.height() + "px",
				backgroundColor: "transparent",
				style: 'surface',
				showPerspective: true,
				showGrid: true,
				showShadow: false,
				keepAspectRatio: true,
				verticalRatio: 0.7,
				cameraPosition: {horizontal: -2.7, vertical: 0.5, distance: 2.2}
			};
			return new vis.Graph3d(div[0], data, options)			

		}
		return {
			update: update,
		}
	};

	initialize(mainDiv, options);
	return {
		pushData: pushData,
		toggleDescent: toggleDescent,
		updateData: updateData,
		descend: descend,
		clearData: clearData,
		plotIt: plotIt,
		pruneData: pruneData,
		getFitPlotData: getFitPlotData,
	}
}


