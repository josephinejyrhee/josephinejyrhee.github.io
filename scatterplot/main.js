// console.log('hello world!')



// set variables for margin, width, and height for convenience
var margin = { top: 20, right: 20, bottom: 50, left: 50};
var width = 600 - margin.left - margin.right;
var height = 320 - margin.top - margin.bottom;

// make the d3 selection of the body element
var svg = d3.select('body')
	.append('svg')
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)

// main svg group element and translate its position from origin
var g = svg.append('g')
	.attr('transform', `translate(${margin.left}, ${margin.right})`); // another way of doing string concatenation (use back ticks)

// set x and y Scale
// use scaleLinear since we're choosing only numeric data for x and y
var xScale = d3.scaleLinear().range([0, width]);
var yScale = d3.scaleLinear().range([height, 0]);

// set color scale
// use scaleOrdinal since we're using categorical data to color the circles
var colors = d3.scaleOrdinal().range(d3.schemeCategory20b).domain(origin);

// set x and y axis functions
// xAxis has tickFormat so that we can input functions to make it horizontal instead of vertical
var xAxis = d3.axisBottom()
	.tickFormat(function(d) { return d; })
	.scale(xScale);
var yAxis = d3.axisLeft()
	.scale(yScale);

// (extra) x and y axis labels
var xAxisLabel = g.append('text')
					.attr('x', height)
					.attr('y', height + 40);
var yAxisLabel = g.append('text')
					.attr('transform', 'rotate(-90)')
					.attr('x', '-165')
					.attr('y', '-35');




// load the csv data asyncronously using d3.csv
// referenced: http://learnjsdata.com/read_data.html
d3.csv("./data/data.csv", function(d){
	return {
		// shortcut to parse things typed as a string to int since the data is numeric
		weight: parseInt(d.weight), 	// or you could use java's parseInt
		displacement: parseInt(d.displacement),
		horsepower: parseInt(d.horsepower),
		acceleration: parseInt(d.acceleration),
		// don't need to parse origin since it's already typed as a string
		origin: d.origin
	};
}, function(data){
	// sets xScale and yScale to first variables
	xScale.domain(d3.extent(data, function(d) { return d.displacement; }));
	yScale.domain(d3.extent(data, function(d) { return d.acceleration; }));

	// creates the x and y axis and ticks
	// xAxis has the 'transform' attribute to make the line horizontal
	g.append('g')
		.attr('transform', `translate(0, ${height})`)
		.call(xAxis);
	g.append('g')
		.call(yAxis);

	// create x and y axis labels
	xAxisLabel.text('displacement');
	yAxisLabel.text('acceleration');

	// creates initial circles
	g.selectAll('circle')
		.data(data)
		.enter().append('circle')
		.attr('class', 'circle')
		.attr('cx', function(d) { return xScale(d.displacement); })
		.attr('cy', function(d) { return yScale(d.acceleration); })
		.attr('r', 2)
		// passing in d.origin allows circles originating from the same country to have the same color
		.attr('fill', function(d) { return colors(d.origin); });

	// updating yScale and y-axis
	// referenced: https://github.com/d3/d3-timer
	// timeout allows the function to be called after 3000 milliseconds
	d3.timeout(function() {
		// sets new yScale to horsepower
		yScale.domain(d3.extent(data, function(d) { return d.horsepower; }));

		// remove group elements that no longer exist in our new data
		g.exit().remove();

		// create new group elements if our new data has more elements than our old data
		g.enter()
			.append('circle')
			.attr('cx', function(d) { return xScale(d.displacement); })
			.attr('cy', function(d) { return yScale(d.horsepower); })
			.attr('r', 2)
			.attr('fill', function(d) { return colors(d.origin); });

		// creates circles for each data point
		g.selectAll('circle')
			.transition()
			.attr('cx', function(d) { return xScale(d.displacement); })
			.attr('cy', function(d) { return yScale(d.horsepower); })
			.attr('r', 2)
			.attr('fill', function(d) { return colors(d.origin); });

		// removes existing x and y axis
		g.selectAll('g').remove();

		// creates new x and y axis and ticks
		// have to create new x-axis even though the variable didn't change because we removed both axes with g.selectAll('g').remove();
		g.append('g')
			.attr('transform', `translate(0, ${height})`)
			.call(xAxis);
		g.append('g')
			.call(yAxis);

		// create new y-axis label
		yAxisLabel.text('horsepower');
	}, 3000);


	// updating xScale and x-axis
	// timeout allows the function to be called after 6000 milliseconds
	d3.timeout(function() {
		// sets new xScale to weight
		xScale.domain(d3.extent(data, function(d) { return d.weight; }));
		
		// remove group elements that no longer exist in our new data
		g.exit().remove();

		// create new group elements if our new data has more elements than our old data
		g.enter()
			.append('circle')
			.attr('cx', function(d) { return xScale(d.weight); })
			.attr('cy', function(d) { return yScale(d.horsepower); })
			.attr('r', 2)
			.attr('fill', function(d) { return colors(d.origin); });

		// creates circles for each data point
		g.selectAll('circle')
			.transition()
			.attr('cx', function(d) { return xScale(d.weight); })
			.attr('cy', function(d) { return yScale(d.horsepower); })
			.attr('r', 2)
			.attr('fill', function(d) { return colors(d.origin); });

		// removes existing x and y axis
		g.selectAll('g').remove();

		// creates new x and y axis and ticks
		// have to create new y-axis even though the variable didnt' change from horsepower because we removed both axes with g.selectAll('g').remove();
		g.append('g')
			.attr('transform', `translate(0, ${height})`)
			.call(xAxis);
		g.append('g')
			.call(yAxis);

		// create new x-axis label
		xAxisLabel.text('weight');
	}, 6000);

	// console.log(data);
});



// 	// choose a variable in the data set for the x scale
// 	if (a === 'weight'){
// 		xScale.domain(d3.extent(data, function(d){ return d.weight; }));
// 	} else {
// 		xScale.domain(d3.extent(data, function(d){ return d.displacement; }));
// 	}

// 	// choose a variable in the data set for the y scale
// 	if (b === 'horsepower'){
// 		yScale.domain(d3.extent(data, function(d){ return d.horsepower; }));
// 	} else {
// 		yScale.domain(d3.extent(data, function(d){ return d.acceleration; }));
// 	}

// 	// draw and label the x axis ("label" meaning the variable you are using)
// 	g.append('g')
// 		.attr('transform', `translate(0, ${height})`)
// 		.call(xAxis)
// 	xAxisLabel.text(a);

// 	// draw and label the y axis ("label" meaning the variable you are using)
// 	g.append('g')
// 		.call(yAxis)
// 	yAxisLabel.text(b);

// 	// draw circles for each data point that are positioned using the x and y scales and have a fill color using the color scale
// 	g.selectAll('circle')
// 		.data(data)
// 		.enter().append('circle')
// 		.attr('class', 'circle')
// 		.attr("r", 2)
// 		.attr("cx", function(d) { 
// 			if (a !== 'weight'){
// 				return xScale(d.displacement); 
// 			}
// 			return xScale(d.weight);
// 		})
// 		.attr("cy", function(d) {
// 			if (b !== 'horsepower'){
// 				return yScale(d.acceleration); 
// 			}
// 			return yScale(d.horsepower);
// 		})
// 		.style("fill", colors); 

// });



// main('weight', 'horsepower');
// updateData('displacement', 'acceleration');
// //var inter = setInterval(function() { updateData('weight', 'acceleration'); }, 3000); 
// //var inter = setInterval(function() { updateData('displacement', 'acceleration'); }, 6000); 

// function updateData(a, b){
// 	d3.csv("./data/data.csv", function(error, res){
// 		if (error) throw error;
// 		// console.log(res);
// 		// parse and format the data
// 		var data = res.map(function(d){
// 			return {
// 				// shortcut to parse things typed as a string to thing it would be without strings
// 				weight: parseInt(d.weight), 	// or you could use java's parseInt
// 				displacement: parseInt(d.displacement),
// 				horsepower: parseInt(d.horsepower),
// 				acceleration: parseInt(d.acceleration)
// 			};
// 		});
// 		console.log(data);

// 		if (a === 'weight'){
// 			xScale.domain(d3.extent(data, function(d){ return d.weight; }));
// 		} else {
// 			xScale.domain(d3.extent(data, function(d){ return d.displacement; }));
// 		}

// 		// choose a variable in the data set for the y scale
// 		if (b === 'horsepower'){
// 			yScale.domain(d3.extent(data, function(d){ return d.horsepower; }));
// 		} else {
// 			yScale.domain(d3.extent(data, function(d){ return d.acceleration; }));
// 		}


// 		g.selectAll('circle')
// 			.data(data)
// 			.enter().append('circle')
// 			.transition()
// 			.duration(3000)
// 			//.ease('circle')
// 			.on('start', function() {
// 				d3.select(this)
// 					.attr('r', 2)
// 			})
// 			//.attr('class', 'circle')
// 			//.attr("r", 2)
// 			.attr("cx", function(d) { 
// 				if (a !== 'weight'){
// 					return xScale(d.displacement); 
// 				}
// 				return xScale(d.weight);
// 			})
// 			.attr("cy", function(d) {
// 				if (b !== 'horsepower'){
// 					return yScale(d.acceleration); 
// 				}
// 				return yScale(d.horsepower);
// 			})
// 			.transition()
// 			.duration(3000)
// 			.attr('fill', colors);
// 			//.style("fill", colors); 




// // draw and label the x axis ("label" meaning the variable you are using)
// 		g.append('g')
// 			.attr('transform', `translate(0, ${height})`)
// 			.transition()
// 			.duration(3000)
// 			.call(xAxis);
// 		xAxisLabel.text(a)
// 			.transition()
// 			.duration(3000);
// 		// g.append('text')
// 		// 	.attr('x', height)
// 		// 	.attr('y', height + 40)
// 		// 	.text(a);

// 		// draw and label the y axis ("label" meaning the variable you are using)
// 		g.append('g')
// 			.transition()
// 			.duration(3000)
// 			.call(yAxis);
// 		yAxisLabel.text(b)
// 			.transition()
// 			.duration(3000);
// 		// g.append('text')
// 		// 	// rotates y-axis label counter-clockwise 90 degrees
// 		// 	.attr('transform', 'rotate(-90)')
// 		// 	.attr('x', '-165')
// 		// 	.attr('y', '-35')
// 		// 	.text(b);



// 		// g.select('.x.axis')
// 		// 	.transition()
// 		// 	.duration(3000)
// 		// 	.call(xAxis);
// 		// g.select('.y.axis')
// 		// 	.transition()
// 		// 	.duration(3000)
// 		// 	.call(yAxis);

// 	});

// }




















