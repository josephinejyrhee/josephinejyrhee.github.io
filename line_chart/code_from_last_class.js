console.log('hello world!');

var margin = { top: 20, right: 20, bottom: 50, left: 50 };
var width = 600 - margin.left - margin.right;
var height = 320 - margin.top - margin.bottom;

var svg = d3.select('body').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom);

var g = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.right})`);

var xScale = d3.scaleTime().range([0, width]);
var yScale = d3.scaleLinear().range([height, 0]);

var valueLine = d3.area()
  .x(function(d) { return xScale(d.t); })
  .y0(function(d) { return yScale(d.v); })
  .y1(function(d) { return yScale(d.v); })
  .curve(d3.curveBasis);

var baseURL = 'https://tidesandcurrents.noaa.gov/api/datagetter';

var params = {
  begin_date: '20171010',
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

var queryString = Object.keys(params)
  .reduce(function(str, key, idx, array) {
    str += key + '=' + params[key];

    if (idx !== array.length - 1) {
      str += '&'
    }

    return str;
  }, '');

var queryURL = baseURL + '?' + queryString;

var parseTime = d3.timeParse('%Y-%m-%d %H:%M');

d3.json(queryURL, function(error, res) {
  if (error) throw error;

  console.log(res);

  var data = res.predictions.map(function(d) {
    return {
      v: parseFloat(d.v, 10),
      t: parseTime(d.t),
    };
  });

  console.log(data);

  xScale.domain(d3.extent(data, function(d) { return d.t; }));
  yScale.domain(d3.extent(data, function(d) { return d.v; }));

  g.append('path')
    .datum(data)
    .attr('class', 'line')
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 2)
    .attr('d', valueLine);

  g.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

  g.append('g')
    .call(d3.axisLeft(yScale));

  // grid lines
  g.append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(0, ${height})`)
    .call(
      d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat('')
    );

  g.append('g')
    .attr('class', 'grid')
    .call(
      d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(-width)
        .tickFormat('')
    );
});

// console.log('this will finish before d3.json callback!');
