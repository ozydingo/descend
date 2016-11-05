var mainGraph;

$(document).ready( function() {
	mainGraph = dataGraph("main");
	mainGraph.linkHUD(costscape3d($("#costscape"), mainGraph))
	mainGraph.linkHUD(costLog($("#costLog"), mainGraph))
} );
