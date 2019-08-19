		// Variables
		var body = d3.select('body')
		var h = 600
		var w = 800
		var colRx = 3.5;
		var colRy = 2.5;
		var cellSize = 10;
		var plotData = []
		var plotFunction;
		var leagueShotGrid;
		var sliceIndex = 0;
		var line = d3.line().curve(d3.curveBundle.beta(0.8))
		var myColor = d3.scaleSequential().domain([-20,20])
					.interpolator(d3.interpolateViridis);
					   
		var	teams = [{'id': 1610612737,
			  'full_name': 'Atlanta Hawks'},
			 {'id': 1610612738,
			  'full_name': 'Boston Celtics'},
			 {'id': 1610612739,
			  'full_name': 'Cleveland Cavaliers'},
			 {'id': 1610612740,
			  'full_name': 'New Orleans Pelicans'},
			 {'id': 1610612741,
			  'full_name': 'Chicago Bulls'},
			 {'id': 1610612742,
			  'full_name': 'Dallas Mavericks'},
			 {'id': 1610612743,
			  'full_name': 'Denver Nuggets'},
			 {'id': 1610612744,
			  'full_name': 'Golden State Warriors'},
			 {'id': 1610612745,
			  'full_name': 'Houston Rockets'},
			 {'id': 1610612746,
			  'full_name': 'Los Angeles Clippers'},
			 {'id': 1610612747,
			  'full_name': 'Los Angeles Lakers'},
			 {'id': 1610612748,
			  'full_name': 'Miami Heat'},
			 {'id': 1610612749,
			  'full_name': 'Milwaukee Bucks'},
			 {'id': 1610612750,
			  'full_name': 'Minnesota Timberwolves'},
			 {'id': 1610612751,
			  'full_name': 'Brooklyn Nets'},
			 {'id': 1610612752,
			  'full_name': 'New York Knicks'},
			 {'id': 1610612753,
			  'full_name': 'Orlando Magic'},
			 {'id': 1610612754,
			  'full_name': 'Indiana Pacers'},
			 {'id': 1610612755,
			  'full_name': 'Philadelphia 76ers'},
			 {'id': 1610612756,
			  'full_name': 'Phoenix Suns'},
			 {'id': 1610612757,
			  'full_name': 'Portland Trail Blazers'},
			 {'id': 1610612758,
			  'full_name': 'Sacramento Kings'},
			 {'id': 1610612759,
			  'full_name': 'San Antonio Spurs'},
			 {'id': 1610612760,
			  'full_name': 'Oklahoma City Thunder'},
			 {'id': 1610612761,
			  'full_name': 'Toronto Raptors'},
			 {'id': 1610612762,
			  'full_name': 'Utah Jazz'},
			 {'id': 1610612763,
			  'full_name': 'Memphis Grizzlies'},
			 {'id': 1610612764,
			  'full_name': 'Washington Wizards'},
			 {'id': 1610612765,
			  'full_name': 'Detroit Pistons'},
			 {'id': 1610612766,
			  'full_name': 'Charlotte Hornets'}]
		
		// SVG
		var svgContainer = d3.select(".visualization").append('svg')
			.attr('height', h)
			.attr('width', w)
			.attr("class", "plot-background")
	
			g = svgContainer.append("g")
		// Load league averages dataset and save it in a variable	
		d3.csv("data/leagueAverages.csv").then(function(data) {
			data.forEach(function(d) {
				d['xMin'] = +d['xMin'],
				d['xMax'] = +d['xMax'],
				d['yMin'] = +d['yMin'],
				d['yMax'] = +d['yMax'],
				d['shotPercentage'] = +d['shotPercentage']
			});
			leagueShotGrid = data;
		});
		
		// MAIN FUNCTION - load the shots dataset and add functions for plotting
		d3.csv("data/shots2.csv").then(function(data) {
			data.forEach(function(d) { d['NEW_Y'] = +d['NEW_Y'],
						  			   d['LOC_X'] = +d['LOC_X']; 
									});
			console.log(data)
									
			// Data point scaling functions
			var xScale = d3.scaleLinear()
				.domain([d3.min(data, function (d) {return d.NEW_Y;}), 325])
				.range([0, w]);

			var yScale = d3.scaleLinear()
				.domain([d3.min(data, function (d) {return d.LOC_X - 50;}),
						 d3.max(data, function (d) {return d.LOC_X + 200;})])
				.range([h, 0]);
			
			// Add and skew court outline image
			var backgroundImage = svgContainer.append("svg:image")
				.attr("xlink:href", "court5.svg")
				.attr("transform", "skewX(-33)")
				.attr("x", 390)
				.attr("y", 180)
				.attr("preserveAspectRatio", "none")
				.attr("height", 355)
				.attr("width", 500)
				.attr("opacity", 0.4)
			
			// Team button functionality
			d3.selectAll(".teamButton").on("click", function() {
				document.getElementById("teamsButton").innerHTML = this.id;
				
				// Remove previous plots
				removeCurves();
				removeCols();
				
				// Create team data variable and populate players drop down
				var teamData = getTeamData(this.id);
				var players = new Set(teamData.map(function(d) {
					return d.PLAYER_NAME;
				}));
				var select = document.getElementById("playersDropdown");
				while (select.firstChild) {
					select.removeChild(select.firstChild);
				}
				// Players drop down
				players.forEach(function(player) {
					var player = player
					var element = document.createElement("a")
					element.id = player
					element.textContent = player
					element.className = "playerButton"
					element.href = "#"
					element.onclick = function() {
						document.getElementById("playersButton").innerHTML = this.id;
						highlightPlayer(player)
					}
					select.appendChild(element)
				 })
				
				// Plotting blocks - according to the chart type button clicked
				if (plotFunction == plotCurves) {
					var teamDataSliced = sliceData(teamData, 50)
					var iterator = setInterval(function() {
						if (sliceIndex >= teamDataSliced.length) {
							clearInterval(iterator);
							sliceIndex = 0;
						}	
						plotCurves(teamDataSliced[sliceIndex])
						sliceIndex += 1;}, 25);
						
				} else if (plotFunction == plotCols) {
					var toPlot = createShotGrid(cellSize, teamData)
					var colRow = toPlot.length - 1;
					var iteratorCol = setInterval(function() {
						if (colRow <= 0) {
							clearInterval(iteratorCol);
							colRow = toPlot.length - 1;
						}	
						plotCols(toPlot[colRow])
						colRow -= 1;}, 50);
					drawColLegend();
				}
			});	
			
			// Filtering button and slider functionality
			d3.select("#madeShotsButton").on("click", function() {
				showMadeShots()
			});
			
			d3.select("#allShotsButton").on("click", function() {
				showAllShots()
			});
			
			d3.select(".curvesButton").on("click", function() {
				plotFunction = plotCurves;
				hidePercentageSliders();
				showShotButtons();
			});
			
			d3.select(".colsButton").on("click", function() {
				hideShotButtons();
				showPercentageSliders();
				plotFunction = plotCols;
			});
			
			d3.select("#mySlider").on("change", function(d){
				selectedValue = this.value
				updateDistance(selectedValue)
			  })
			  
			d3.select("#colSliderMin").on("change", function(d){
				selectedValue = this.value
				updateColumnsMin(selectedValue)
			  })
			  
			d3.select("#colSliderMax").on("change", function(d){
				selectedValue = this.value
				updateColumnsMax(selectedValue)
			  })
			
			// Tool tip for column chart
			var tool_tip = d3.tip()
				  .attr("class", "d3-tip")
				  .offset([-8, 0])
				  .html(function(d) {
						var xLoc = d.xMin;
						var yLoc = d.yMin;
					    return "Shots: " + d.totalShots + "<br/>" + 
							   "% Made: " + d.shotPercentage.toPrecision(3) + "<br/>" +
							   "League Average % Made: " + leagueShotGrid.filter(function(d) {
									return d.xMin == xLoc & d.yMin == yLoc;
									})[0].shotPercentage.toPrecision(3);
						});
				svgContainer.call(tool_tip);
			
			// Helper functions to get data of player/team
			function getTeamData(teamName) {
				return data.filter(function(d) { return d.TEAM_NAME == teamName; });
			}			
			function getPlayerData(playerName) {
				return data.filter(function(d) { return d.PLAYER_NAME == playerName; });
			}
			
			// Dataset slicer for curve plot
			function sliceData(data, sliceSize) {
				var dataSliced = [];
				if (sliceSize <= 0) {
					return data;
				}
				for (var i = 0; i < data.length; i += sliceSize) {
					dataSliced.push(data.slice(i, i + sliceSize))
				}
				return dataSliced;
			}
			
			// Draw legend for column chart
			function drawColLegend() {
					
				var legendData = [-20, -15, -10, -5, 0, 5, 10, 15, 20];	
				legend = svgContainer.selectAll(".legend")
					.data(legendData)
					.enter()
					
					legend
					.append("rect")
					.attr("x", function(d){
						return 657.5 + d * 4;
					})
					.attr("y", 40)
					.attr("width", 20)
					.attr("height", 15)
					.attr("fill", function(d) {
						return myColor(d);
					})
					
					legend
					.append("text")
					.text(function(d) {
						return " " + d;
					})
					.attr("x", function(d) {
						return 660 + d*4;
					})
					.attr("y", 68)
					.attr("font-family", "Arial")
					.attr("font-size", 10)
					.attr("fill", "white");
					
				svgContainer.append("text")
					.text("Shooting % vs. League avg.")
					.attr("y", 35)
					.attr("x", 578)
					.attr("font-size", 12)
					.attr("font-family", "Arial")
					.attr("fill", "white")
			}
			
			// Column chart plotting function
			function plotCols(data) {
			
				var col = svgContainer.append("g");
				
				col
				.selectAll("path")
				.data(data.filter(function(d) { return d.totalShots != 0 }))
				.enter()
				.append("ellipse")
					.attr("rx", colRx)
					.attr("ry", colRy)
					.attr("cx", function(d) {
						return xScale(((d.yMin + d.yMax)/2) + (Math.tan(15 * Math.PI / 180) * ((d.xMin + d.xMax)/2)));
					})
					.attr("cy", function(d) {
						return yScale(((d.xMin + d.xMax)/2));
					})
					.attr("fill", function(d) {
						var xLoc = d.xMin;
						var yLoc = d.yMin;
						var league = leagueShotGrid.filter(function(d) {
							return d.xMin == xLoc & d.yMin == yLoc;
						})[0].shotPercentage;
						var dif = d.shotPercentage - league;
						return myColor(dif);
					})
									
				col.selectAll("rect")
				.data(data.filter(function(d) { return d.totalShots != 0 }))
				.enter()
				.append("rect")
					.attr("x", function(d) {
						return xScale(((d.yMin + d.yMax)/2) + (Math.tan(15 * Math.PI / 180) * ((d.xMin + d.xMax)/2))) - colRx;
					})
					.attr("y", function(d) {
						return yScale(((d.xMin + d.xMax)/2)) - d.totalShots;
					})
					.attr("width", 2 * colRx)
					.attr("height", function(d) {
						return d.totalShots;
					})
					.attr("fill", function(d) {
						var xLoc = d.xMin;
						var yLoc = d.yMin;
						var league = leagueShotGrid.filter(function(d) {
							return d.xMin == xLoc & d.yMin == yLoc;
						})[0].shotPercentage;
						var dif = d.shotPercentage - league;
						return myColor(dif);
					})
					.attr("opacity", 0.5)
					.on('mouseover', tool_tip.show)
					.on('mouseout', tool_tip.hide)
										
				col.selectAll("path")
				.data(data.filter(function(d) { return d.totalShots != 0 }))
				.enter()
				.append("ellipse")
					.attr("rx", colRx)
					.attr("ry", colRy)
					.attr("cx", function(d) {
						return xScale(((d.yMin + d.yMax)/2) + (Math.tan(15 * Math.PI / 180) * ((d.xMin + d.xMax)/2)));
					})
					.attr("cy", function(d) {
						return yScale(((d.xMin + d.xMax)/2)) - d.totalShots;
					})
					.attr("fill", function(d) {
						var xLoc = d.xMin;
						var yLoc = d.yMin;
						var league = leagueShotGrid.filter(function(d) {
							return d.xMin == xLoc & d.yMin == yLoc;
						})[0].shotPercentage;
						var dif = d.shotPercentage - league;
						return myColor(dif);
					})
					
			}
			
			// Curve chart plotting function
			function plotCurves(data) {
				
				var curve = g.selectAll('path')
				.data(data, function(d) {return d;});
				
				curve
				.enter()
				.append('path')
				.attr('d', function(d){
						return 	line([[xScale(d.NEW_Y), yScale(d.LOC_X)],
									  [xScale(d.NEW_Y), yScale(d.LOC_X + 300)],
									  [xScale(0), yScale(300)],
									  [xScale(0), yScale(200)]])
									  })
						.attr("stroke", "#00FFFF")
						.attr("stroke-width", 0.25)
						.attr("fill", "none")
						.attr("class", "highlighted")
						.attr("stroke-dasharray", function(){
							var length = this.getTotalLength();
							return length + " " + length;
						})
						.attr("stroke-dashoffset", function(){
							var length = this.getTotalLength();
							return length;
						})
						.merge(curve)
						.transition()
							.duration(1000)
							.ease(d3.easeLinear)
							.attr("stroke-dashoffset", 0)
			
			}			
			
			// Show player plots, based on chart type chosen
			function highlightPlayer(playerName) {
				
				if (plotFunction == plotCurves) {
					g.selectAll("path")
						.classed("unhighlighted", false)
						.classed("highlightedPlayer", true)
						.filter(function(d) {return d.PLAYER_NAME != playerName; })
						.classed("unhighlighted", true)
						
				} else if (plotFunction == plotCols) {
					removeCols();
					var playerData = getPlayerData(playerName)
					var toPlot = createShotGrid(10, playerData)
					var colRow = toPlot.length - 1;
					var iteratorCol = setInterval(function() {
					if (colRow <= 0) {
						clearInterval(iteratorCol);
						colRow = toPlot.length - 1;
					}	
					plotCols(toPlot[colRow])
					colRow -= 1;}, 50);
					drawColLegend();
				}
			};
			
			// Self explanatory helper functions
			function showMadeShots() {
			g.selectAll("path")
				.filter(function(d) {
					return d.SHOT_MADE_FLAG == "0";
				})
				.attr("stroke-dasharray", function(){
							var length = this.getTotalLength();
							return length + " " + length;
						})
						.attr("stroke-dashoffset", 0)
						.transition()
							.duration(1000)
							.ease(d3.easeLinear)
							.attr("stroke-dashoffset", function() {
								return this.getTotalLength();
							})
		}

			function showAllShots() {
				g.selectAll("path")
					.filter(function(d) {
						return d.SHOT_MADE_FLAG == "0";
					})
					.attr("stroke-dasharray", function(){
							var length = this.getTotalLength();
							return length + " " + length;
						})
						.attr("stroke-dashoffset", function(){
							var length = this.getTotalLength();
							return length;
						})
						.transition()
							.duration(1000)
							.ease(d3.easeLinear)
							.attr("stroke-dashoffset", 0)
			}
		
			function updateDistance(distance) {
				g.selectAll("path")
					.classed("unhighlighted", false)
					.classed("highlighted", true)
					.filter(function(d) {
						return d.SHOT_DISTANCE != distance;
					})
					.classed("unhighlighted", true)
					
			}
			
			function updateColumnsMin(percentage) {
				svgContainer.selectAll("g")
					.selectAll("rect")
					.classed("colUnhighlighted", true)
					.filter(function(d) {
						return d.shotPercentage > percentage;
					})
					.classed("colUnhighlighted", false)
					
				svgContainer.selectAll("g")
					.selectAll("ellipse")
					.classed("colUnhighlighted", true)
					.filter(function(d) {
						return d.shotPercentage > percentage;
					})
					.classed("colUnhighlighted", false)
			}
			
			function updateColumnsMax(percentage) {
				svgContainer.selectAll("g")
					.selectAll("rect")
					.classed("colUnhighlighted", true)
					.filter(function(d) {
						return d.shotPercentage < percentage;
					})
					.classed("colUnhighlighted", false)
					
				svgContainer.selectAll("g")
					.selectAll("ellipse")
					.classed("colUnhighlighted", true)
					.filter(function(d) {
						return d.shotPercentage < percentage;
					})
					.classed("colUnhighlighted", false)
			}
			
			// Binning of dataset into grid of cells of chosen size
			function createShotGrid(cellSize, data) {
				var grid = [];
				var gridRow = 0;
				for ( var i = -250; i < 250; i += cellSize ) {
					grid[gridRow] = []
					for ( var j = 0; j < 300; j += cellSize ) {
						var totShots = data.filter(function(d) {
							return ((d.LOC_X < i + cellSize & d.LOC_X >= i) & 
									(d.LOC_Y < j + cellSize & d.LOC_Y >= j));
								}).length;
						var madeShots = data.filter(function(d) {
							return ((d.LOC_X < i + cellSize & d.LOC_X >= i) & 
									(d.LOC_Y < j + cellSize & d.LOC_Y >= j)) &
									(d.SHOT_MADE_FLAG == "1");
								}).length;		
						grid[gridRow].push({
							"xMin" : i,
							"xMax" : i + cellSize,
							"yMin" : j,
							"yMax" : j + cellSize,
							"totalShots" : totShots,
							"madeShots" : madeShots,
							"shotPercentage" : madeShots * 100 / totShots
							})
						}
					gridRow += 1;
					}		
				return grid;
			}
			
			
			// Removing plots
			function removeCurves() {
				d3.selectAll("path").transition().duration(1000).attr("opacity", 0).remove();
			}
			
			function removeCols() {
				d3.selectAll("rect").transition().duration(1000).attr("opacity", 0).remove();
				d3.selectAll("ellipse").transition().duration(1000).attr("opacity", 0).remove();
				d3.selectAll("line").transition().duration(1000).attr("opacity", 0).remove();
				d3.selectAll("text").remove();
			}
			
		});
			
			// Populate team drop down
			var select = document.getElementById("teamsDropdown");			
			for(var i = 0; i < teams.length; i++) {
				var team = teams[i].full_name
				var element = document.createElement("a");
				element.id = team;
				element.textContent = team;
				element.className = "teamButton"
				element.href = "#"
				select.appendChild(element)
			}
		
		// Reset curve plot after filtering by distance
		function resetDistance() {
				g.selectAll("path")
					.classed("unhighlighted", false)
					.classed("highlighted", true)
			}
		
		// Reveal team/player dropdowns
		function showTeams() {
			document.getElementById("teamsDropdown").classList.toggle("show");
		}
		
		function showPlayers() {
			document.getElementById("playersDropdown").classList.toggle("show");
		}
		
		// Reveal and hide filtering options
		function showShotButtons() {
			document.getElementById("shots").style.display = 'block';
			document.getElementById("distanceSlider").style.display = "block";
		}
		
		function hideShotButtons() {
			document.getElementById("shots").style.display = 'none';
			document.getElementById("distanceSlider").style.display = 'none';
		}
		
		function showPercentageSliders() {
			document.getElementById("percentageSlider").style.display = "block";
		}
		
		function hidePercentageSliders() {
			document.getElementById("percentageSlider").style.display = "none";
		}
		
		// Hide drop down when mouse is clicked elsewhere on the screen
		window.onclick = function(event) {
			if (!event.target.matches('.dropbtn')) {
				var dropdowns = document.getElementsByClassName("dropdown-content");
				for (var i = 0; i < dropdowns.length; i++) {
					var openDropdown = dropdowns[i];
					if (openDropdown.classList.contains('show')) {
						openDropdown.classList.remove('show');
					}
				}
			}
		}
		
		