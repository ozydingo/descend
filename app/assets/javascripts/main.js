//TODO: get rid of globals?
var mainGraph;

$(document).ready( function() {
	mainGraph = dataGraph();
	$("#btn_clear").click(mainGraph.clearData);
	$("#btn_descend").click(mainGraph.toggleDescent);
	$("#var_maxN").change(mainGraph.updateData);
	$("#theGraph").bind("plotclick", function(event, pos, item){
		mainGraph.pushData(pos.x, pos.y);
	});

} );
