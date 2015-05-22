//TODO: get rid of globals
var thePlot, xyData = [], fitData = {}
var descent;

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
	fitData.llmse = computeFit(xyData);
	plotIt(xyData, fitData);
}

function descend(n) {
	data = matrixData(xyData);
	fitData.descent = descent.step(data.features, data.outcome, n);
	plotIt(xyData, fitData);
}

function clearData() {
	xyData = [];
	updateData();
}

// general function to plot data and any fit lines
function plotIt(xyData, fits) {
	var coefs, fitData
	if (fits === undefined) fits = {};

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
if (fits.llmse) {
	fitData = getFitPlotData(fits.llmse);
	series.push({
		data: fitData,
		lines: {show: true},
		color: "red"
	});
}

// add descent fit line if specified
if (fits.descent) {
	fitData = getFitPlotData(fits.descent);
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
	var xMin = thePlot.getAxes().xaxis.min;
	var xMax = thePlot.getAxes().xaxis.max;
	var xStep = (xMax - xMin) / 50;
	var xVals = math.range(xMin, xMax + xStep, xStep)._data;
	var fMatrix = modeling.nlFeatures(xVals);
	var pMatrix = math.multiply(fMatrix, coefs);
	var yVals = pMatrix.transpose()._data[0];
	var fitData = math.matrix([xVals, yVals]).transpose()._data;
	return fitData;
}

function matrixData(xyData) {
	var xPoints = xyData.map(function(xy){return xy[0]});
	var yPoints = xyData.map(function(xy){return xy[1]});
	var xData = modeling.nlFeatures(xPoints);
	var yData = yPoints.length == 0 ? math.matrix() : math.matrix([yPoints]).transpose();
	return {features: xData, outcome: yData}
}

// compute fit coeffs for llmse given data
function computeFit(xyData) {
	var data = matrixData(xyData);
	var coefs = modeling.llmse(data.features, data.outcome);
	return coefs;    
}

$(document).ready( function() {
	$("#btn_clear").click(clearData);
	$("#btn_descend").click(toggleDescent);
	$("#var_maxN").change(updateData);

	thePlot = plotIt([]);
	descent = modeling.descend();


	$("#theGraph").bind("plotclick", function(event, pos, item){
		xyData.push([pos.x, pos.y]);
		updateData();
	});

} );
