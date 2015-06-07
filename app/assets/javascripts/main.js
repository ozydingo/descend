//TODO: get rid of globals?
var xyData, llmseFit, xPowers = [0,1];
var thePlot, descent, huds;

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
	plotCost();
}

// run n iterations given current data
function descend(n) {
	data = xyHelper.trainingData(xyData);
	descent.step(data.features, data.outcomes, n);
	plotIt();
	plotCost();
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

function plotCost() {
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

	var container = $("#costPlot0")

	// specify options
	var options = {
		xLabel: "x[0]",
		yLabel: "x[1]",
		xStep: 0.5,
		yStep: 0.5,
		xStep: 0.5,
		width: container.width(),
		height: container.height(),
		style: 'surface',
		showPerspective: true,
		showGrid: true,
		showShadow: false,
		keepAspectRatio: true,
		verticalRatio: 0.5
	};

	// Instantiate our graph object.
	huds = new vis.Graph3d(container[0], data, options);
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

	$("#theGraph").bind("plotclick", function(event, pos, item){
		xyData.push([pos.x, pos.y]);
		updateData();
	});

} );
