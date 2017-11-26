console.log('hello world!');

// set up dimensions
// no need for margins
var width = 960,
	height = 600;

var svg = d3.select('body')
	.append('svg')
	.attr('width', width)
	.attr('height', height);

// svg filter
// defs = definitions element
var defs = svg.append('defs');

// use Gaussian filter
// creates drop shadow that exists behind map
defs.append('filter')
	.attr('id', 'blur')
	.append('feGaussianBlur')
	.attr('stdDeviation', 5);

// create hashmap
var overdoses = d3.map();

// create a path generator (used d3.line before, but now use d3.geoPath)
var path = d3.geoPath();

// create color scale
// use ordinal because the data already has a rate value (x overdoses / y number of people)
var color = d3.scaleOrdinal();

// load data
d3.queue()		// use queue to load multiple files
	.defer(d3.json, 'data/us-10m.topojson')
	.defer(d3.csv, 'data/2015_sorted.csv', function(d) {		// function to parse data. Used on every row of the csv file
		if (d.FIPS.length < 5) d.FIPS = '0' + d.FIPS;
		overdoses.set(d.FIPS, d.Rate);
	})
	.await(main);

function main(error, us) {
	if (error) throw error;

	// create an array that represents the unique categories from the rate column
	// overdoses.values() returns all values of the dataset
	var categories = overdoses.values()
		.reduce(function(acc, cur) {
			if (acc.indexOf(cur) === -1){
				acc.push(cur);
			}
			return acc;
		}, [])
		.sort(function(a, b) {
			var first = +a.split('-')[0];
			var second = +b.split('-')[0];
			return first - second;
		});

	//manually moving >30 to the end
	var idx = categories.indexOf('>30');
	categories.push(
		// splice removes element at idx and pushes it to the end
		categories.splice(idx, 1)[0]
	);

	var numCategories = categories.length;
	
	// map color scale to categories
	color.domain(categories)
		.range(categories.map(function(d, i) {
			return d3.interpolateYlGnBu(i / (numCategories - 1))	// order of operations matter!
		}));

	// make svg
	svg.append('g')
		.attr('class', 'legend')
		.attr('transform', 'translate(875, 225)');

	// make legend color generator using d3 legend plugin
	var legend = d3.legendColor()
		.title('Drug overdose deaths, per 100,000 ppl 2015')
		.titleWidth(75)
		.scale(color);

	svg.select('.legend')
		.call(legend);

	// create the drop shadow
	defs.append('path')
		.attr('id', 'nation')
		// using feature json to convert topojson to something that can be drawn
		.attr('d', path(topojson.feature(us, us.objects.nation)));
	// tell svg to use Gaussian blur
	// creates shadow outline
	svg.append('use')
		.attr('xlink:href', '#nation')
		.attr('fill-opacity', 0.4)
		.attr('filter', 'url(#blur)');
	// creates outline of the US
	svg.append('use')
		.attr('xlink:href', '#nation')
		.attr('fill', '#fff');

	// drawing paths for every single county in the US
	svg.append('g')
		.attr('class', 'counties')
		.selectAll('path')
		.data(topojson.feature(us, us.objects.counties).features)
		.enter().append('path')
		.attr('fill', function(d) {
			// data join rate data from csv and topojson with FIPS
			d.Rate = overdoses.get(d.id);
			return color(d.Rate);
		})
		.attr('d', path)
		// adds tooltip (but slow and can't style it)
		.on('mouseover', function(d) {
			var c = d3.select(this)
				.attr('stroke', 'red')
				.attr('stroke-width', 2);
			// chooses the lower line when the highlighted border (red) is thicker due to stacking order
			this.parentNode.appendChild(this);
		})
		.on('mouseout', function() {
			d3.select(this).attr('stroke-width', 0);
		})
		.append('title')
		.text(function(d) { return d.Rate; });

	// add state boundaries
	svg.append('path')
		// mesh doesn't return polygons, but just the border of states
		.datum(topojson.mesh(us, us.objects.states, function(a, b) {
			// if an arc is only used by a single geometry, a and b are identical
			// only returns shared borders
			return a !== b;
			// return true; creates a border around the entire state, even if a side is bordered by water
		}))
		.attr('class', 'states')
		.attr('stroke', '#fff')
		.attr('stroke-width', 2)
		.attr('fill', 'none')		// get rid of fill
		.attr('d', path);



};






















