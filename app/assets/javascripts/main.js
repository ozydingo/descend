//TODO: get rid of globals?
var xyData, xyFit, xPowers = [0,1];
var thePlot, descent;

function toggleDescent() {
	var descent = $("#btn_descend").attr("value");
	if (descent === "off") {
		descent = setInterval(descend, 20);
		$("#btn_descend").text("Stop");
	} else {
		clearInterval(descent);
		descent = "off";
		$("#btn_descend").text("Descend");
	}
	$("#btn_descend").attr("value", descent);
}

// generate callback for "the data has changed"
function updateData() {
	xyData = pruneData(xyData);
	xyFit = computeFit(xyData);
	plotIt();
}

function descend(n) {
	data = modeling.xy.trainingData(xyData);
	descent.step(data.features, data.outcomes, n);
	plotIt();
}

function clearData() {
	xyData = [];
	updateData();
}

// general function to plot data and any fit lines
function plotIt() {
	// define first plot data: the data points themselves
	var series = [{
		data: xyData,
		points: {show: true},
		color: "blue"
	}];

	// plot options
	var options = {
		grid: {clickable: true},
		xaxis: {min: 0, max: 1},
		yaxis: {min: 0, max: 1}
	};

	// add fit line if specified
	if (xyFit) {
		var fitData = getFitPlotData(xyFit);
		series.push({
			data: fitData,
			lines: {show: true},
			color: "red"
		});
	}

	// add descent fit line if specified
	if (dFit = descent.getCoefs()) {
		var fitData = getFitPlotData(dFit);
		series.push({
			data: fitData,
			lines: {show: true},
			color: "orange"
		});
	}

	thePlot = $.plot("#theGraph", series, options);
	return thePlot;
}

// limit to manN data points
function pruneData(xyData) {
	while (xyData.length > Number($("#var_maxN").val())) {xyData.shift()};
	return xyData
}

// return x,y data for llmse fit
function getFitPlotData(coefs) {
	if (!coefs || coefs.size()[1]==0) return []
	var xMin = thePlot.getAxes().xaxis.min;
	var xMax = thePlot.getAxes().xaxis.max;
	var xStep = (xMax - xMin) / 50;
	var xVals = math.range(xMin, xMax + xStep, xStep)._data;
	var yVals = modeling.xy.predict(coefs, xVals, xPowers);
	var fitData = modeling.xy.zipXY(xVals, yVals)
	return fitData;
}

// compute fit coeffs for llmse given data
function computeFit(xyData) {
	var data = modeling.xy.trainingData(xyData)
	var coefs = modeling.llmse(data.features, data.outcomes);
	return coefs;    
}

$(document).ready( function() {
	$("#btn_clear").click(clearData);
	$("#btn_descend").click(toggleDescent);
	$("#var_maxN").change(updateData);

	descent = modeling.descent();
	clearData();
	thePlot = plotIt();

	$("#theGraph").bind("plotclick", function(event, pos, item){
		xyData.push([pos.x, pos.y]);
		updateData();
	});

} );
