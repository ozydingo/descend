//TODO: get rid of globals?
var xyData, llmseFit, xPowers = [0,1];
var thePlot, descent;

function toggleDescent() {
	var descentEnabled = $("#btn_descend").attr("value");
	if (descentEnabled === "off") {
		descentEnabled = setInterval(descend, 20);
		$("#btn_descend").text("Stop");
	} else {
		clearInterval(descentEnabled);
		descentEnabled = "off";
		$("#btn_descend").text("Descend");
	}
	$("#btn_descend").attr("value", descentEnabled);
}

// generate callback for "the data has changed"
function updateData() {
	xyData = pruneData(xyData);
	llmseFit = xyHelper.llmse(xyData, xPowers);
	plotIt();
}

// run n iterations given current data
function descend(n) {
	data = xyHelper.trainingData(xyData);
	descent.step(data.features, data.outcomes, n);
	plotIt();
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
	if (!coefs || coefs.size()[1]==0) return [];
	var xMin = thePlot.getAxes().xaxis.min;
	var xMax = thePlot.getAxes().xaxis.max;
	return xyHelper.getFitLine(coefs, xPowers, xMin, xMax, 50)
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
