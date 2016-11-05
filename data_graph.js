/* Interface to the main graph
 * This graph contains the clickable canvas, data points,
 * fit lines, and any HUDs
 */

dataGraph = function(container) {
	var xyData, llmseFit, xPowers = [1];
	var thePlot, descent, huds;
	var divs;
	var descent = gradientDescent(1);

	function getDiv(name) {
		return $("#" + name)
	}

	function getDescent() {
		return descent;
	}

	function getXYData() {
		return xyData;
	}

	function initialize(container) {
		divs = {
			main: getDiv("mainGraph"),
			aux: getDiv("auxGraphs"),
			clear: getDiv("btn_clear"),
			descend: getDiv("btn_descend"),
			maxN: getDiv("text_maxN")
		}
		divs["main"].bind("plotclick", function(event, pos, item){
			pushData(pos.x, pos.y);
		});
		divs["clear"].click(clearData);
		divs["descend"].click(toggleDescent);
		divs["maxN"].change(updateData);
		huds = [costHUD("costPlot")];
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
		update();
	}

	// run n iterations given current data
	function descend(n) {
		data = xyHelper.trainingData(xyData, xPowers);
		descent.setData(data.features, data.outcomes);
		descent.step();
		update();
	}

	function clearData() {
		xyData = [];
		updateData();
	}

	// general function to plot data and any fit lines
	function update() {
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
		if (descent.getNumObservations() > 0) {
			var fitData = getFitPlotData(descent.getTheta());
			series.push({
				data: fitData,
				lines: {show: true},
				color: "orange"
			});
		}

		thePlot = plot(series, options);
		huds.forEach(function(hud){hud.update()});
		return thePlot;
	}

	function plot(series, options) {
		return $.plot(divs["main"], series, options);
	}

	// limit to manN data points
	function pruneData(xyData) {
		while (xyData.length > Number(divs["maxN"].val())) {xyData.shift()};
		return xyData
	}

	// return x,y data for llmse fit
	function getFitPlotData(coefs) {
		if (thePlot == undefined) { return []; }
		if (!coefs || coefs.size()[0]==0 || coefs.size()[1]==0) { return []; }
		var xMin = thePlot.getAxes().xaxis.min;
		var xMax = thePlot.getAxes().xaxis.max;
		return xyHelper.getFitLine(coefs, xPowers, xMin, xMax, 50)
	}

	function costHUD(costDiv) {
		var viewCenter = [0, 0];
		var xTent = [[-1.5, 1.5], [-1.5, 1.5]];
		var xLim = [[-1.5, 1.5], [-1.5, 1.5]]
		var zLim = [0, 2];
		var costDiv = getDiv(costDiv);
		var costGraph;
		var cameraPosition = {horizontal: -2.7, vertical: 0.5, distance: 2.2};

		var alpha = 0.05;

		function initialize() {

		}

		function update() {
			if (xyData.length==0) return;

			var d = xyHelper.trainingData(xyData);
			var dFit = descent.getTheta() || math.matrix([[0],[0]]);
			var plotIndices = [0,1];
			var support = plotIndices.map(function(ii) {
				var target = dFit.toArray()[ii];
				var current = viewCenter[ii];
				viewCenter[ii] = alpha * target + (1-alpha) * current;
				xLim[ii][0] = math.round(viewCenter[ii] + xTent[ii][0], 3);
				xLim[ii][1] = math.round(viewCenter[ii] + xTent[ii][1], 3);
				return math.range(xLim[ii][0], xLim[ii][1], 0.1).toArray()
			});
			var costMatrix = modeling.computeCostMatrix(d.features, d.outcomes, support)
			var costManifold = new vis.DataSet();
			var counter = 0;
			var zMin = math.Infinity, zMax = -math.Infinity;
			math.forEach(costMatrix, function(c,ii) {
				costManifold.add({
					id: counter++,
					x:support[0][ii[0]],
					y:support[1][ii[1]],
					z:c
				});
				if (c < zMin) zMin = c;
				if (c > zMax) zMax = c;
			});
			zLim[0] = alpha * zMin + (1-alpha) * zLim[0]
			zLim[1] = alpha * zMax + (1-alpha) * zLim[1]

			// specify options
			var options = {
				xLabel: "x0",
				yLabel: "x1",
				zLabel: "cost",
				xMin: xLim[0][0],
				xMax: xLim[0][1],
				yMin: xLim[1][0],
				yMax: xLim[1][1],
				zMin: zLim[0],
				zMax: zLim[1],
				xStep: 1,
				yStep: 1,
				zStep: math.round((zLim[1] - zLim[0])/3,1),
				yCenter: "35%",
				width: costDiv.width() + "px",
				height: costDiv.height() + "px",
				backgroundColor: "transparent",
				style: 'surface',
				showPerspective: true,
				showGrid: true,
				showShadow: false,
				keepAspectRatio: true,
				verticalRatio: 0.7,
				cameraPosition: cameraPosition
			};
			if (costGraph === undefined) {
				costGraph = new vis.Graph3d(costDiv[0], costManifold, options);
				costGraph.on('cameraPositionChange', onCameraPositionChange);
			} else {
				costGraph.setOptions(options);
				costGraph.setData(costManifold);
			}

			return costGraph;
		}

		function onCameraPositionChange(event) {
			cameraPosition = {
				horizontal: event.horizontal,
				vertical: event.vertical,
				distance: event.distance
			}
		}

		function getCostGraph() { return costGraph}

		return {
			getCostGraph: getCostGraph,
			update: update
		}
	};

	initialize(container);
	return {
		getDescent: getDescent,
		getXYData: getXYData,
		pushData: pushData,
		toggleDescent: toggleDescent,
		updateData: updateData,
		descend: descend,
		clearData: clearData,
		update: update,
		pruneData: pruneData,
		getFitPlotData: getFitPlotData,
		huds: huds,
	}
}


