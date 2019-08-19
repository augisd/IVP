// Variables
		var body = d3.select('body')
		var h = 600
		var w = 800
		var colRx = 3;
		var colRy = 1.5;
		var cellSize = 10;
		var plotData = []
		var plotFunction;
		var leagueShotGrid;
		var sliceIndex = 0;
		var line = d3.line().curve(d3.curveBundle.beta(0.8))

		var courtData = [{"x" : 50, "y" : -250},
						 {"x" : -0, "y" : -250},
						 {"x" :  0, "y" :  250},
						 {"x" : 50, "y" :  250}]
						 
		var arcData = [{"x":  50, "y" : 250},
					   {"x": 300, "y" : 250},
					   {"x": 300, "y" :   0},
					   {"x": 300, "y" :-250},
					   {"x":  50, "y" :-250}]
					   
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
		var svgContainer = body.append('svg')
			.attr('height', h)
			.attr('width', w)
			.attr("class", "plot-background")
	
			g = svgContainer.append("g")
							
		d3.csv("/data/leagueAverages.csv").then(function(data) {
			data.forEach(function(d) {
				d['xMin'] = +d['xMin'],
				d['xMax'] = +d['xMax'],
				d['yMin'] = +d['yMin'],
				d['yMax'] = +d['yMax'],
				d['shotPercentage'] = +d['shotPercentage']
			});
			leagueShotGrid = data;
		});
		
		d3.csv("/data/shots2.csv").then(function(data) {
			data.forEach(function(d) { d['NEW_Y'] = +d['NEW_Y'],
						  			   d['LOC_X'] = +d['LOC_X']; 
									});
			var xScale = d3.scaleLinear()
				.domain([d3.min(data, function (d) {return d.NEW_Y;}),400])
				.range([0, w]);

			var yScale = d3.scaleLinear()
				.domain([d3.min(data, function (d) {return d.LOC_X - 50;}),
						 d3.max(data, function (d) {return d.LOC_X + 200;})])
				.range([h, 0]);
				
			/* var line2 = d3.line()
				.x(function(d) { return xScale(d.x); })
				.y(function(d) { return yScale(d.y); })
			
			var arc = d3.line()
				.x(function(d) { return xScale(d.x); })
				.y(function(d) { return yScale(d.y); })
				.curve(d3.curveBundle.beta(0.9))
			
			svgContainer.append("path")
				.attr("d", line2(courtData))
				.attr("stroke", "gold")
				.attr("stroke-width", 2)
			
			svgContainer.append("path")
				.attr("d", arc(arcData))
				.attr("stroke", "gold")
				.attr("stroke-width", 2) */
				
			d3.selectAll(".teamButton").on("click", function() {
				removeCurves();
				removeCols();
				var teamData = getTeamData(this.id);
				var teamDataSliced = sliceData(teamData, 50)
				var players = new Set(teamData.map(function(d) {
					return d.PLAYER_NAME;
				}));
				var select = document.getElementById("playersDropdown");
				while (select.firstChild) {
					select.removeChild(select.firstChild);
				}
				players.forEach(function(player) {
					var player = player
					var element = document.createElement("a")
					element.id = player
					element.textContent = player
					element.className = "playerButton"
					element.href = "#"
					element.onclick = function() {						
						highlightPlayer(player)
					}
					select.appendChild(element)
				 })
				
				if (plotFunction == plot2) {
					var iterator = setInterval(function() {
						if (sliceIndex >= teamDataSliced.length) {
							clearInterval(iterator);
							sliceIndex = 0;
						}	
						plot2(teamDataSliced[sliceIndex])
						sliceIndex += 1;}, 50);
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
				}
			});	

			d3.select(".madeShotsButton").on("click", function() {
				showMadeShots()
			});
			
			d3.select(".allShotsButton").on("click", function() {
				showAllShots()
			});
			
			d3.select(".curvesButton").on("click", function() {
				plotFunction = plot2;
			});
			
			d3.select(".colsButton").on("click", function() {
				plotFunction = plotCols;
			});
			
			d3.select("#mySlider").on("change", function(d){
				selectedValue = this.value
				updateDistance(selectedValue)
			  })
							
			function getTeamData(teamName) {
				return data.filter(function(d) { return d.TEAM_NAME == teamName; });
			}
			
			function getPlayerData(playerName) {
				return data.filter(function(d) { return d.PLAYER_NAME == playerName; });
			}

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
			
			function plotCols(data) {
				var myColor = d3.scaleSequential().domain([-20,20])
					.interpolator(d3.interpolateViridis);
					
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
					/* .attr("stroke", function(d) {
						if (d.totalShots != 0) {
							return "black";
						} else {
							return "white";
						}
					})
					.attr("stroke-width", 0.1) */
					//.attr("opacity", 0.5)
					
				
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
					/* .attr("stroke", function(d) {
						if (d.totalShots != 0) {
							return "black";
						} else {
							return "white";
						}
					})
					.attr("stroke-width", 0.1) */
					//.attr("opacity", 0.5)
			}
									
			function plot2(data) {
				
				var curve = g.selectAll('path')
				.data(data, function(d) {return d;});
				
				/* curve
				.exit()
				.remove();  */
				
				curve
				.enter()
				.append('path')
				.attr('d', function(d){
						return 	line([[xScale(d.NEW_Y), yScale(d.LOC_X)],
									  [xScale(d.NEW_Y), yScale(d.LOC_X + 300)],
									  [xScale(0), yScale(300)],
									  [xScale(0), yScale(200)]])
									  })
						.attr("stroke", "gold")
						.attr("stroke-width", 0.25)
						.attr("fill", "none")
						.attr("opacity", 0.1)
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
								
				// Add points at the botton of curves:			
				/* var point = g.selectAll('circle')
					.data(data, function(d) { return d;});
					
				point.exit().remove();
				
				point.enter()
				.append('circle')
				.attr("r", 10)
				.attr("cx", function(d) { return xScale(d.NEW_Y); })
				.attr("cy", function(d) { return yScale(d.LOC_X); })
				.attr("opacity", 0.05) */
			
			}			
		
			function highlightPlayer(playerName) {
				
				if (plotFunction == plot2) {
					g.selectAll("path")
						.classed("unhighlighted", true)
						.filter(function(d) {return d.PLAYER_NAME == playerName; })
						.classed("unhighlighted", false)
						.classed("highlighted", true)
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
				}
			};
			
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
							.duration(2000)
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
							.duration(2000)
							.ease(d3.easeLinear)
							.attr("stroke-dashoffset", 0)
			}
		
			function updateDistance(distance) {
				g.selectAll("path")
					.classed("unhighlighted", true)
					.filter(function(d) {
						return d.SHOT_DISTANCE == distance
					})
					.classed("unhighlighted", false)
					.classed("highlighted", true)
			}
		
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
		
			function removeCurves() {
				d3.selectAll("path").transition().duration(1000).attr("opacity", 0).remove();
			}
			
			function removeCols() {
				d3.selectAll("rect").transition().duration(1000).attr("opacity", 0).remove();
				d3.selectAll("ellipse").transition().duration(1000).attr("opacity", 0).remove();
				d3.selectAll("line").transition().duration(1000).attr("opacity", 0).remove();
			}
		});
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


		function showTeams() {
			document.getElementById("teamsDropdown").classList.toggle("show");
		}
		
		function showPlayers() {
			document.getElementById("playersDropdown").classList.toggle("show");
		}

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