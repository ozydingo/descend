function costscape3d(div, parent) {
	var viewCenter = [0, 0];
	var xTent = [[-1.5, 1.5], [-1.5, 1.5]];
	var xLim = [[-1.5, 1.5], [-1.5, 1.5]]
	var zLim = [0, 2];
	var div
	var costGraph;
	var cameraPosition = {horizontal: -2.7, vertical: 0.5, distance: 2.2};

	var alpha = 0.05;

	function update() {
		var data = xyHelper.trainingData(parent.getXYData());
		var ref = parent.getDescent().getTheta();
		if (data.features.size()[0] == 0) { return; }
		if (ref == null) { ref = math.matrix([[0],[0]]); }

		var plotIndices = [0,1];
		var support = plotIndices.map(function(ii) {
			var target = ref.toArray()[ii];
			var current = viewCenter[ii];
			viewCenter[ii] = alpha * target + (1-alpha) * current;
			xLim[ii][0] = math.round(viewCenter[ii] + xTent[ii][0], 3);
			xLim[ii][1] = math.round(viewCenter[ii] + xTent[ii][1], 3);
			return math.range(xLim[ii][0], xLim[ii][1], 0.1).toArray()
		});
		var costMatrix = computeCostMatrix(data.features, data.outcomes, support)
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
			width: div.width() + "px",
			height: div.height() + "px",
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
			costGraph = new vis.Graph3d(div[0], costManifold, options);
			costGraph.on('cameraPositionChange', onCameraPositionChange);
		} else {
			costGraph.setOptions(options);
			costGraph.setData(costManifold);
		}

		return costGraph;
	}

	// input matrix features, outcomes, nx1 matrix coefs
	function computeCost(features, outcomes, coefs) {
		if (features.size()[0]==0) return;
		costs = parent.getDescent().costFunction(math.matrix(coefs.transpose()), features, outcomes); 
		return costs[0];
	}

	// input matrix features, outcomes, Array of Arrays of coef values
	// coefArrays[ii] is array of ii'th coefficient values
	function computeCostMatrix(features, outcomes, coefArrays) {
		var size = coefArrays.map(function(x){return x.length});
		var ndim = size.length;
		var costMatrix = math.zeros.apply(this, size);
		var features = math.concat(math.ones(features.size()[0], 1), features, 1);
		// array of indices into coefArrays
		var ii = math.zeros(ndim).toArray();
		// current index to increment
		while (ii) {
			var coefs = math.matrix(ii.map(function(i,j){ return coefArrays[j][i]; })).transpose();
			var index = math.index.apply(this,ii);
			var cost = computeCost(features, outcomes, coefs);
			costMatrix.subset(index, cost);
			ii = modIncrementArrayIndex(ii,size);
		}
		return costMatrix
	}

	// modularly increment an index with carryover.
	// return undefined if we're done.
	function modIncrementArrayIndex(ii, size) {
		var kk = 0;
		while (kk<ii.length) {
			if (++ii[kk] >= size[kk]) {
				ii[kk++] = 0;
			} else {
				break;
			}
		}
		if (kk<ii.length) return ii
	}

	function onCameraPositionChange(event) {
		cameraPosition = {
			horizontal: event.horizontal,
			vertical: event.vertical,
			distance: event.distance
		}
	}

	function getCostGraph() { return costGraph; }

	return {
		getCostGraph: getCostGraph,
		update: update
	}
};
