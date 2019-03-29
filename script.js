// Load data and convert string to numeric values
var data = d3.csv("/data/curry.csv").then(function(data) {
data.forEach(function(d) { d['NEW_Y'] = +d['NEW_Y'],
						   d['LOC_X'] = +d['LOC_X']; 

}); 
var i = 0
var plotData = []

// Variables
var body = d3.select('body')
var h = 500
var w = 470
var formatPercent = d3.format('.2%')

// Scales
var xScale = d3.scaleLinear()
	.domain([d3.min(data, function (d) {return d.NEW_Y;}),
			 d3.max(data, function (d) {return d.NEW_Y;})])
	.range([0, w]);

var yScale = d3.scaleLinear()
	.domain([d3.min(data, function (d) {return d.LOC_X - 20;}),
			 d3.max(data, function (d) {return d.LOC_X + 20;})])
	.range([h, 0]);

// SVG
var svgContainer = body.append('svg')
	.attr('height', h)
	.attr('width', w)
// test plot
var points = setInterval(
	function(){
		plotData.push(data[i]);
		i += 1;
		// Stop when all points are plotted
		if (i > data.length) {
			clearInterval(points);
		// Else add a point to the plot
		} else {
		svgContainer.selectAll('circle')
				.data(plotData)
				//.data(data)
				.enter()
				.append('circle')
				.attr('cx', function (d) {return (xScale(d.NEW_Y))})
				.attr('cy', function (d) {return (yScale(d.LOC_X))})
				.attr('r', '8')
				.attr('stroke', function (d) 
					{if (d.SHOT_MADE_FLAG == "1") {return "green"}
					 else {return "red"}})
				.attr('stroke-width', '3')
				.attr('fill', function (d) {
					if (d.TEAM_ID == "1610612744") {
						return "yellow"
					} else {
						return "blue"
					}
				})
				.append("title")
				.text(function(d) {
					return 'Player: ' + d.PLAYER_NAME + '\nAction Type: ' + d.ACTION_TYPE;
				}) 
				.on("mouseover", function(d) {
					var xPos = parseFloat(d3.select(this)
											.attr('cx'))
					var yPos = parseFloat(d3.select(this)
											.attr('cy'))

					d3.select('#tooltip')
						.style("left", xPos + 'px')
						.style("top", yPos + 'px')
						.select("#value")
						.text(d.PLAYER_NAME
							+ '\n' + d.ACTION_TYPE)
					d3.select("#tooltip").classed("hidden", false);

				})
				.on("mouseout", function() {
					//Hide the tooltip
					d3.select("#tooltip").classed("hidden", true);
					})
			
		}
	}, 30); // interval time
}); 

