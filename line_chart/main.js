console.log('hello')

var margin = { top: 20, right: 20, bottom: 50, left: 50};
var width = 600 - margin.left - margin.right;
var height = 320 - margin.top - margin.bottom;

var svg = d3.select('body').append('svg')
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)

// main svg group
var g = svg.append('g')
	.attr('transform', `translate(${margin.left}, ${margin.right})`); // another way of doing string concatenation (use back ticks)

var xScale = d3.scaleTime().range([0, width]);
var yScale = d3.scaleLinear().range([height, 0]);

var valueLine = d3.area()
	.x(function(d) { return xScale(d.t); })
	// telling d3 what to do with top of line and bottom of line
	// so it can create the shape
	.y0(function(d) { return yScale(d.v); })
	// the same as y of d3.line graph
	.y1(function(d) { return yScale(-3);} )
	.curve(d3.curveBasis);

// set domain with API
// API expects some query parameters
// query parameters = ?..., but gets tedious, so use params
var baseURL = 'https://tidesandcurrents.noaa.gov/api/datagetter';

var params = {
	begin_date: '20171010', 	// hardcoded the begin and end date
	end_date: '20171011',
	interval: 'h',
	station: 9414290,
	product: 'predictions',
	datum: 'MSL',
	units: 'english',
	time_zone: 'lst',
	application: 'd3-tidal-chart',
	format: 'json',
};



// making params into query parameters
// concatenate params into one big string 'key=value&key2=value2& etc...'
var queryString = Object.keys(params) // just returns keys
	.reduce(function(str, key, idx, array) { //string, accumulator, interval, array
		str += key + '=' + params[key];
		if (idx !== array.length - 1){
			str += '&'
		}
		return str;
	}, '');



// ? indicates that we're using parameters
var queryURL = baseURL + '?' + queryString;



// parse time to correct format
var parseTime = d3.timeParse('%Y-%m-%d %H:%M');
// timeFormat is taking a js format and changing it to something humans can easily read
var formatTime = d3.timeFormat('%B %d %I%p');
// bisectDate to compare xScale by getting the first occurence of a date
var bisectDate = d3.bisector(function(d) { return d.t; }).left;


// d3.csv is almost identical. the file is just in different formats
// csv is separated by commas, json is like an array of dictionaries
// asynchronously load d3 data
d3.json(queryURL, function(error, res) { 	
// ^arg: error when something goes wrong, res is the response from the d3.json call (what the API is sending back to us)
	if (error) throw error;
	console.log(res);
	var data = res.predictions.map(function(d){
		return {
			// v: +d.v,
			// shortcut to parse things typed as a string to thing it would be without strings
			v: parseFloat(d.v, 10), 	// or you could use java's parseInt
			t: parseTime(d.t),
		};
	});
	console.log(data);



	// returns the lowest y value so that we can set y1 and have the grid area filled in to the bottom
	var minYVal = d3.min(data, function(d) { return d.v; });
	console.log(minYVal) // checking what value we get
	valueLine.y1(function(d) { return yScale(minYVal); });



	xScale.domain(d3.extent(data, function(d){ return d.t; }));
	yScale.domain(d3.extent(data, function(d){ return d.v; }));

	// drawing on svg
	g.append('path')
		.datum(data) 	// .datum takes entire array of data and binds it to a single thing 
						// .data will take each value in your array and bind it to things
		.attr('class', 'line')
		.attr('fill', 'steelblue')
		.attr('stroke', 'none')
		.attr('stroke-width', 2)
		.attr('d', valueLine);	// d = how to get your path


	// add x axis
	g.append('g')
		.attr('transform', `translate(0, ${height})`)
		.call(d3.axisBottom(xScale));

	// add y axis
	g.append('g')
		.call(d3.axisLeft(yScale));

	// how to make gridlines
	g.append('g')
		.attr('class', 'grid') // we have to add a class because we're using axes again
		.attr('transform', `translate(0, ${height})`)
		.call(
			d3.axisBottom(xScale)
			.tickSize(-height)
			.tickFormat('')	// pass in empty string because we don't want ticks to be formatted
 		);


 	g.append('g')
 		.attr('class', 'grid')
 		.call(
 			d3.axisLeft(yScale)
 			.ticks(5)
 			.tickSize(-width)
 			.tickFormat('')
 		);

 	var tooltip = g.append('g') // g= group element
 		.attr('class', 'tooltip')
 		.style('display', 'none'); 	// hides it from screen readers too
 									// you can temporarily change attributes on element tab on chrome
 									// ex: change 'none' to 'initial' to see dash lines

 	// vertical line pointing to the x-axis
 	tooltip.append('line')
 		.attr('class', 'y-hover-line') // if I did 'y-hover line' I would be assigning two classes 'y-hover' and 'line'
 		.attr('y1', 0)
 		.attr('y2', height)
 		.attr('stroke', '#333')
 		.attr('stroke-width', 2)
 		.attr('stroke-dasharray', '3,3'); 	// stroke-dasharray is how to draw a dash on an svg path
 											// make sure '3,3' is a string

 	tooltip.append('line')
 		.attr('class', 'x-hover-line')
 		.attr('x1', 0)
 		.attr('x2', width)
 		.attr('stroke', '#333')
 		.attr('stroke-width', 2)
 		.attr('stroke-dasharray', '3,3');

 	// creating circle
 	tooltip.append('circle')
 		.attr('r', 5)
 		.attr('fill', '#fff')
 		.attr('stroke', 'orange')
 		.attr('stroke-width', 4);

 	// place to display the text readout 
 	var textbox = g.append('g')
 		.attr('class', 'text-box')
 		.attr('transform', 'translate(225, 10)')	// upper top-right corner
 		.style('display', 'none');	//using style property to set css display (be careful what you use it for)

 	textbox.append('text')
 		.attr('dy', '0.35em')	// set number
 		.style('font-size', '12px')
 		.append('tspan')	// tspan: how you can create an enclosement around text
 							// span: html element that allows you to isolate one line
 		.text('');

 	// append an invisible rectangle around our chart that can detect mouse movements
 	g.append('rect')
 		.attr('class', 'tooltip-overlay')
 		.attr('fill', 'none')
 		.attr('pointer-events', 'all')	// making sure the entire rectangle is sensitive to cursor
 		.attr('width', width)
 		.attr('height', height)
 		// event listener: makes tooltip and textbox show only when cursor is hovering over rect
 		.on('mouseover', function() {
 			tooltip.style('display', 'initial');	// making tooltip visible
 			textbox.style('display', 'initial');	// making textbox visible
 		})
 		.on('mouseout', function() {
 			tooltip.style('display', 'none');		// making tooltip disappear
 			textbox.style('display', 'none');		// making textbox disappear
 		})
 		.on('mousemove', mousemove);	// whenever mouse moves within rect, function is called
 		
 		// function still works even when defined after its called as long as it's in the same scope
 		function mousemove(){
 			//console.log('mouse moved!');

 			var mouseX = d3.mouse(this)[0];	 // gets mouse position in array, but we only want x position

 			var xValue = xScale.invert(mouseX)		// get back the date from the xScale (NOT THE DATASET)
 													// use bisector function to compare xValue to data
 			var i = bisectDate(data, xValue, 1)	 
 			var d0 = data[i - 1];					// data position
 			var d1 = data[i];						// next data position
 			var d = xValue - d0.t > d1.t - xValue ? d1 : d0;	// xValue: current date
 																// d0: datam
 																// d1: next datum
 			// allows tooltip to move across the top of the line moving between datapoints
 			tooltip.attr('transform', `translate(${xScale(d.t)}, ${yScale(d.v)})`);
 			// selecting line using css class
 			tooltip.select('.y-hover-line')
 				.attr('y2', height-yScale(d.v));
 			tooltip.select('.x-hover-line')
 				.attr('x2', -xScale(d.t));

 			d3.select('g.text-box') // selecting svg group g with textbox
 				.select('text')
 					.text(function(){ return formatTime(d.t); })	// gives the data/hour/ampm in textbox
 				.append('tspan')
 					.text(function(){ return ` ${d.v} ft`; })		// gives us the data at each xValue (of the data)
 					.style('font-weight', 'bold');
 		}
});		

// ends d3.json()


			// costly to call function everytime you scroll
			// alternatives: throttle the event or bounce which is waiting until the event(scrolling) is finished
			// d3.js doesn't do this, but lodash does!
			// npm has js packages (including lodash)
		// var body = d3.select('body')
		// 	.style('height', 1200000000000px)
		// 	.on('mousewheel', _throttle(handleScrolle, 200));

		// function handleScroll(){
		// 	console.log('scrolled! time elapsed:' + d3.now())
		// }


// this is because of the async/event loop (refer to video in week 1)
// console.log('this will finish before d3.json callback!')