/* Interface to the main graph
 * This graph contains the clickable canvas, data points,
 * fit lines, and any HUDs
 */

dataGraph = function(container) {
	var xyData, llmseFit, xPowers = [1];
	var thePlot, descent, huds;
	var divs;
	var descent = gradientDescent(1);

	function getDiv(name) { return $("#" + name); }
	function getDescent() { return descent; }
	function getXYData() { return xyData; }
	function getLlmseFit() { return llmseFit; }

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
		huds = [];
		clearData();
	}

	function linkHUD(hud) {
		huds.push(hud);
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
			xaxis: {min: -1, max: 1},
			yaxis: {min: -1, max: 1}
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
				color: "red",
				label: "LMSE fit"
			});
		}

		// add descent fit line if it exists
		if (descent.getNumObservations() > 0) {
			var fitData = getFitPlotData(descent.getTheta());
			series.push({
				data: fitData,
				lines: {show: true},
				color: "orange",
				label: "model fit"
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

	initialize(container);
	return {
		linkHUD: linkHUD,
		getDescent: getDescent,
		getXYData: getXYData,
		getLlmseFit: getLlmseFit,
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


