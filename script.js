//Load data
const NBA = require("nba");
const curry = NBA.findPlayer('Stephen Curry');
console.log(curry);


var i = 0
var plotData = []
var data = [1,2,3,4]

// Variables
var body = d3.select('body')
var h = 400
var w = 660
var formatPercent = d3.format('.2%')

// Scales
var xScale = d3.scaleLinear()
	.domain([d3.min(plotData, function (d) {return d.NEW_Y;}),
			 d3.max(plotData, function (d) {return d.NEW_Y;})])
	.range([0, w]);

var yScale = d3.scaleLinear()
	.domain([d3.min(plotData, function (d) {return d.LOC_X;}),
			 d3.max(plotData, function (d) {return d.LOC_X;})])
	.range([h, 0]);

// SVG container
var svgContainer = body.append('svg')
	.attr('height', h + 50)
	.attr('width', w + 50)

