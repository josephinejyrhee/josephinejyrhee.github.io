console.log('hello world!')

// set up chart area
// set margin, width, and height
var margin = { top: 20, right: 30, bottom: 30, left: 80 };
var width = 1800 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

// create svg element
var svg = d3.select('body')
	.append('svg')
	.attr('width', width)
	.attr('height', height);

// assign map projection
var projection = d3.geoAlbersUsa();

// new scale squareroot scale for radius
// states with the largest population will have a radius of 50 and smallest will have radius 8
var radius = d3.scaleSqrt()
	.range([8, 50]);

// new color scale with unit range in shades of blue
var color = d3.scaleQuantize()
	.range(['#deeef9', '#aad3ef', '#79b1d8', '#357bad', '#1d51a5']);


// Global variable so that simulation can be called referenced outside of the callback to d3.queue().await()
var simulation;

// data for two graphs
// called in d3.queue().defer()
var pop_data = d3.map();
var income_data = d3.map();

// global variable for nodes
var nodes;

// toggle boolean
// false = total population, true = median income
var buttonBool = true;

// d3.queue() allows multiple asyncronous calls at once and waits for it to be done
// useful when we need to load multiple files
// prevents having a callback within a callback within a callback...
d3.queue()
	// function to parse data. Used on every row of the csv file
	.defer(d3.csv, 'data/acs_pop_income.csv', function(d) {
		pop_data.set(d.name, d.toal_pop);
		income_data.set(d.name, d.median_income)
	})
	.defer(d3.json, 'data/us-states-centroids.json')
	// await: once we're done loading all the data, invoke the main function
	.await(main);

// main function
// takes in both data files
function main(error, acs_pop_income, us_states_centroids){
	// check to see if something went wrong
	// "throw" the error which will prevent the rest of the code from running
	if (error) throw error;

	// define array of nodes prior to d3.simulation()
	// using projection, we assign x, y, x0, and y0
	nodes = us_states_centroids.features.map(function(d) {
		var point = projection(d.geometry.coordinates),
			value = pop_data.get(d.properties.name);
		return {
			id: d.id,
			name: d.properties.name,
			label: d.properties.label,
			coords: d.geometry.coordinates,
			x: point[0],
			y: point[1],
			x0: point[0],
			y0: point[1],
			r: radius(value),
			value: parseInt(value)
		};
	});

	// returns the min and max of values
	var extent = d3.extent(nodes, function(d) {
		return d.value;
	});

	// set domain of color and radius to extent
	color.domain(extent)
	radius.domain(extent)

	// once the simulation is invoked, it starts to automatically update the nodes over and over based on the forces applied
	simulation = d3.forceSimulation(nodes)
		.force('charge', d3.forceManyBody().strength(1))
		.force('collision', d3.forceCollide().strength(1)
			.radius(function(d) {
				return radius(d.value);
			}))
		.on('tick', total_population);
		// .stop();
	for (var i = 0; i < 100; i++) {
		simulation.tick();
	}
	
	// calling total_population()
	total_population();

	// sets nodes with data about total_population and create initial graph
	function total_population() {
		// bind data to bubbles
		var circle = svg.selectAll('circle')
			.data(nodes, function(d) {
				// use name as the key to bind data since all state names are unique
				return d.name;
			});

		// create initial graph 
		circle.enter()
			.append('circle')
			// set properties on circles
			.attr('r', function(d) {
				return radius(d.value);
			})
			.attr('cx', function(d) {
				return d.x;
			})
			.attr('cy', function(d) {
				return d.y;
			})
			.attr('label', function(d) {
				return d.label;
			})
			.attr('fill', function(d) {
				return color(d.value);
			})
			.attr('stroke', 'lightgrey')
			// tooltip
			.on('mouseover', function(d) {
				//toLocaleString makes the string more readable (15000 --> 15,000)
				tooltip.html(d.name + "<br>" + d.value.toLocaleString());
				tooltip.style('visibility', 'visible');
			})
			.on('mousemove', function(d) {
				// -10 and +10 pads our tooltip so that the mouse doesn't cover the info when we hover over a circle
				tooltip.style('left', (d3.event.pageX + 10) + 'px')
					.style('top', (d3.event.pageY - 10) + 'px');
			})
			.on('mouseout', function() {
				tooltip.style('visibility', 'hidden');
			});

		// bind data to text elements
		var text = svg.selectAll('text')
			.data(nodes, function(d) {
				// use name as the key to bind data since all state names are unique
				return d.name;
			});
		text.enter()
			.append('text')
			// set properties on text
			.attr('x', function(d) {
				return d.x;
			})
			.attr('y', function(d) {
				return d.y + 3;
			})
			.text(function(d) { 
				return d.label; 
			})
			.attr("text-anchor", "middle")
			.attr("font-family", "sans-serif")
			.attr("font-size", "10px");
		
	}
	// end total_population function


	// create legend
	svg.append('g')
		.attr('class', 'legend')
		.attr('transform', 'translate(800, 350)');
	var legend = d3.legendColor()
		.title('Total Population')
		.titleWidth(100)
		.scale(color);
	svg.select('.legend')
		.call(legend);

	// create toggle button
	var button = d3.select('body')
		.append('button')
		.text('Median Income');
	button.on('click', update);


	// update function
	function update() {
		// console.log('click works!');

		// select existing node data from DOM
		nodes = d3.selectAll('circle').data();
		// reassign nodes' values based on boolean
		// change range of radius based on boolean
		for (var i = 0; i < nodes.length; i++){
			if (buttonBool) {
				nodes[i].value = income_data.get(nodes[i].name);
				radius.range([8, 40]);
			}
			else {
				nodes[i].value = pop_data.get(nodes[i].name);
				radius.range([8, 50]);
			}
		}
		// re-evaluate min and max of nodes' values
		extent = d3.extent(nodes, function(d) {
			return parseInt(d.value);
		})

		// reassign radius domain
		radius.domain(extent);
		// reassign color domain
		color.domain(extent);

		// reassign each nodes' radius, x, y, x0, and y0 values
		for (var i = 0; i < nodes.length; i++){
			nodes[i].r = radius(parseInt(nodes[i].value));
			nodes[i].x = projection(nodes[i].coords)[0];
			nodes[i].x0 = projection(nodes[i].coords)[0];
			nodes[i].y = projection(nodes[i].coords)[1];
			nodes[i].y0 = projection(nodes[i].coords)[1];
		}

		// transition variable
		var t = d3.transition().duration(750),
		// delay function
			delay = function(d, i) { return i * 50; };

		// restart simulation
		simulation.nodes(nodes).alpha(1).restart();
		for (var i = 0; i < 100; i++) {
			simulation.tick();
		}

		// update circles with new values using transition
		t.selectAll('circle')
			// set properties on circles
			.attr('r', function(d) {
				return radius(d.value);
			})
			.attr('cx', function(d) {
				return d.x;
			})
			.attr('cy', function(d) {
				return d.y - 2;
			})
			.attr('label', function(d) {
				return d.label;
			})
			.attr('fill', function(d) {
				return color(d.value);
			})
			.attr('stroke', 'lightgrey')
		// tooltip
		svg.selectAll('circle')
			.attr('stroke', 'lightgrey')
			.on('mouseover', function(d) {
				//toLocaleString makes the string more readable (15000 --> 15,000)
				tooltip.html(d.name + "<br>" + parseInt(d.value).toLocaleString());
				tooltip.style('visibility', 'visible');
			})
			.on('mousemove', function(d) {
				// -10 and +10 pads our tooltip so that the mouse doesn't cover the info when we hover over a circle
				tooltip.style('left', (d3.event.pageX + 10) + 'px')
					.style('top', (d3.event.pageY - 10) + 'px');
				
			})
			.on('mouseout', function() {
				tooltip.style('visibility', 'hidden');
			});

		// update text with new values using transition
		t.selectAll('text')
			// set properties on text
			.attr('x', function(d) {
				return d.x;
			})
			.attr('y', function(d) {
				return d.y;
			})
			.text(function(d) { 
				return d.label; 
			})
			.attr("text-anchor", "middle")
			.attr("font-family", "sans-serif")
			.attr("font-size", "10px");

		// legendText variable to determine text in legend
		var legendText = buttonBool ?
			function() { return 'Median Income'; }:
			function() { return 'Total Population'; };

		// update legend
		svg.select('.legend')
			.remove();
		svg.append('g')
			.attr('class', 'legend')
			.attr('transform', 'translate(800, 350)');
		var legend = d3.legendColor()
			.title(legendText)
			.titleWidth(100)
			.scale(color);
		svg.select('.legend')
			.call(legend);

		// buttonText variable to determine text on button
		var buttonText = !buttonBool ?
			function() { return 'Median Income'; }:
			function() { return 'Total Population'; }
		// update button
		button.text(buttonText);

		// flip buttonBool boolean
		buttonBool = !buttonBool;
	}
}
// end main function




// tooltip
var tooltip = d3.select('body')
	.append('div')
	.style('position', 'absolute')
	.style('visibility', 'hidden')
	.style('color', 'white')
	.style('padding', '8px')
	.style('background-color', '#626D71')
	.style('border-radius', '6px')
	.style('text-align', 'center')
	.style('font-family', 'monospace')
	.text('');






























