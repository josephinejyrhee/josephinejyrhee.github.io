console.log('hello world!')

var margin = { top: 20, right: 20, bottom: 50, left: 50};
var width = 600 - margin.left - margin.right;
var height = 320 - margin.top - margin.bottom;

var svg = d3.select('body').append('svg')
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)

// main svg group
var g = svg.append('g')
	.attr('transform', `translate(${margin.left}, ${margin.right})`); // another way of doing string concatenation (use back ticks)

var xScale = d3.scaleLinear().range([0, width]);
var yScale = d3.scaleLinear().range([height, 0]);

// color scale
var colors = d3.scaleOrdinal(d3.schemeCategory20);


function main(dataset, a, b) {
	// load the csv data asyncronously using d3.csv
	d3.csv(dataset, function(error, res){
		if (error) throw error;
		// console.log(res);
		// parse and format the data
		if ((a === 'weight') && (b === 'horsepower')) {
		// shortcut to parse things typed as a string to thing it would be without strings
			var data = res.map(function(d){
				return {
					x: parseInt(d.weight), 	// or you could use java's parseInt
					y: parseInt(d.horsepower)
				}
			});
		} else if (a.equals('weight') && b.equals('displacement')){
			var data = res.map(function(d){
				return {
					x: parseInt(d.weight),
					y: parseInt(d.displacement)
				}
			});
		} else if (a.equals('acceleration') && b.equals('horsepower')){
			var data = res.map(function(d){
				return {
					x : parseInt(d.acceleration),
					y : parseInt(d.horsepower)
				}
			});
		} else {
			var data = res.map(function(d){
				return {
					x : parseInt(d.acceleration),
					y : parseInt(d.displacement)
				}
			});
		};
		console.log(data);

		// choose a variable in the data set for the x scale
		if (a === 'weight'){
			xScale.domain(d3.extent(data, function(d){ return d.weight; }));
		} else{
			xScale.domain(d3.extent(data, function(d){ return d.acceleration; }));
		};


		// choose a variable in the data set for the y scale
		if (b === 'horsepower'){
			yScale.domain(d3.extent(data, function(d){ return d.horsepower; }));
		} else{
			yScale.domain(d3.extent(data, function(d){ return d.displacement; }));
		};

		// draw and label the x axis ("label" meaning the variable you are using)
		g.append('g')
			.attr('transform', `translate(0, ${height})`)
			.call(d3.axisBottom(xScale))
		g.append('text')
			.attr('x', height)
			.attr('y', height + 40)
			.text(a);

		// draw and label the y axis ("label" meaning the variable you are using)
		g.append('g')
			.call(d3.axisLeft(yScale))
		g.append('text')
			// rotates y-axis label counter-clockwise 90 degrees
			.attr('transform', 'rotate(-90)')
			.attr('x', '-165')
			.attr('y', '-35')
			.text(b);



		// draw circles for each data point that are positioned using the x and y scales and have a fill color using the color scale
		g.selectAll('scatterplot')
	    	.data(data)
	    	.enter().append('circle')
	    	.attr('class', 'circle')
	    	.attr("r", 2)
	    	//.attr("cx", function(d) { 
	   		// if (a === 'weight'){
				// 	return xScale(d.weight);
				// } else {
				// 	return xScale(d.acceleration)
				// }
			//	return xScale(d.weight);
	    	//})
			.attr("cx", function(d) { return xScale(d.weight); })
	   //  	.attr("cy", function(d) { 
	   //  		if (b === 'horsepower'){
				// 	return yScale(d.horsepower);
				// } else {
				// 	return yScale(d.displacement)
				// }
	   //  	})
			.attr("cy", function(d) { return yScale(d.horsepower); })
	    	.style("fill", colors) 

 
	});
}

main("./data/data.csv", 'weight', 'horsepower');
// function updateChart(site){
// 	var t = g.transition().duration(750); // in msec

// 	// array prototype .map not d3.map
// 	// setting yScale to main
// 	yScale.domain(site.values.map(function (d){ 
// 		return d.key; 	// d.key represents the barley varieties
// 	})
// 	.sort());
// 	yAxis.scale(yScale); 	// updates yAxis with new yScale
// 	// using our transition selection, we select the actual group element of the yAxis and recreate it
// 	t.select('g.y.axis').call(yAxis);


// 	// bind our data to the g element
// 	g.datum(site.values);

// 	// create an empty selection of groups for each genetic variety (gen)
// 	// bind data and set the data binding key
// 	var gens = g.selectAll('g.site')
// 		.data(
// 			function(d) { return d; },
// 			function(d) { 
// 				//console.log(d.key);
// 				return d.key;} // key represents barley genetic variety
// 		);

// 				// update, exit, enter can be in any order

// 	// remove group elements that no longer exists in our new data
// 	gens.exit().remove();

// 	// update existing groups left over from the previous data
// 	gens
// 		.transition(t) // allows us to make things transition at same time (t)
// 		.attr('transform', function(d){
// 			return 'translate(0, ' + yScale(d.key) + ')';
// 		});

// 	// create new group elements if our new data has more elements than our old data
// 	gens.enter().append('g')
// 		.attr('class', 'site')
// 		.transition(t)
// 		.attr('transform', function(d){
// 			return 'translate(0, ' + yScale(d.key) + ')';
// 		});

// 	// reselects our gen site groups
// 	gens = g.selectAll('g.site');


// 	// create circles
// 	var circles = gens.selectAll('circle')
// 		.data(
// 			function(d) { return d.values; },
// 			function(d) { return d.years; }
// 		);


// 	// go through the general update pattern again
// 	// exit remove circles
// 	circles.exit()
// 		.transition(t) // after we use the transition, everything after it is going to be animated (in our case, attr and style)
// 		.attr('r', 0)
// 		.style('fill', 'rgba(255, 255, 255, 0)') // rgba is same as rgb. the last is the opacity
// 		.remove();

// 	// update existing circles
// 	circles
// 		.attr('cy', 0) // y is 0 because each circle is in an svg group that's already positioned
// 		.attr('cx', function(d) { return xScale(d.year); })
// 		.transition(t)
// 		.attr('r', function(d) { return radius(d.yield); })
// 		.attr('fill', function(d) { return color(d.gen); });

// 	// create new circles
// 	circles
// 		.enter().append('circle')
// 		.attr('cy', 0)
// 		.attr('cx', function(d) { return xScale(d.year); })
// 		.transition(t)
// 		.attr('r', function(d) { return radius(d.yield); })
// 		.attr('fill', function(d) { return color(d.gen); });


// 	h3.text(site.key);
// }



