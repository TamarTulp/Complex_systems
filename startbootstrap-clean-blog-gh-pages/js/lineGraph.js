function drawLineGraph(array_data) {
  d3.select("#graphSVG").remove();

  // dimensions
  var width = 750;
  var height = 400;

  var margin = {
      top: 40,
      bottom:75,
      left: 10,
      right: 50,
  };

  function zeroFill( number, width )
  {
    width -= number.toString().length;
    if ( width > 0 )
    {
      return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
    }
    return number + ""; // always return a string
  }

  // create an svg to draw in
  var svg = d3.select("#lineGraph")
      .append("svg")
      .attr("id", "graphSVG")
      .attr("width", width)
      .attr("height", height)
      .append('g')
      .attr('transform', 'translate(' + margin.top + ',' + margin.left + ')');

  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  var parseTime = d3.timeParse("%Y"),
      bisectDate = d3.bisector(function(d) { return d.year; }).left;

  var x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  var line = d3.line()
      .x(function(d) { return x(d.year); })
      .y(function(d) { return y(d.value); });

  var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("text").attr("x", margin.left)
                    .attr("y", margin.top/2)
                    .html("States activated during simulation")
                    .attr("font-family", "Times New Roman")
                    .attr("font-size", "20px")
                    .attr("font-weight", "bold")
                    .attr("fill", "#6F257F");

  // gridlines in y axis function
  function make_y_gridlines() {
      return d3.axisLeft(y);
  }

  var data = [];
  var N = array_data.length;
  xdata = Array.apply(null, {length: N}).map(Number.call, Number);
  xdata.forEach(function(d) {
    data.push({"year":parseTime(d), "value":array_data[d]});
  });

  x.domain(d3.extent(data, function(d) { return d.year; }));
  y.domain([0,14]);

  // add the Y gridlines
  g.append("g")
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-width)
          .tickFormat("")
              .ticks(6)
      );

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y)
              .ticks(6)
             )
      .append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .attr("fill", "#5D6971")
        .text("# of active symptoms");

    g.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

    var focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", height);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", width)
        .attr("x2", width);

    focus.append("circle")
        .attr("r", 15);

    focus.append("text")
        .attr("x", -10)
        .attr("y", 4)
        .attr("dy", ".15em")
        .style("fill", "#8b8d8f")
        .attr("font-family", "Times New Roman")
        .attr("font-size", "18px")
        .attr("font-weight", "bold");

    svg.append("rect")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
      var x0 = x.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.year > d1.year - x0 ? d1 : d0;
      focus.attr("transform", "translate(" + x(d.year) + "," + y(d.value) + ")");
      focus.select("text").text(function() { return zeroFill(d.value, 2); });
      focus.select(".x-hover-line").attr("y2", height - y(d.value));
      focus.select(".y-hover-line").attr("x2", width + width);
    }
}

function drawSlider() {
  var data1 = [0.5, 1, 1.5, 2, 2.5, 3];
  var data2 = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];

  var slider1 = d3.sliderHorizontal()
    .min(d3.min(data1))
    .max(d3.max(data1))
    .width(300)
    .tickFormat(d3.format('.2'))
    .ticks(5)
    .default(1.1)
    .on('onchange', val => {
      d3.select("p#value1").text(Math.round(val));
    });

  var g = d3.select("div#slider1").append("svg")
    .attr("width", 400)
    .attr("height", 100)
    .append("g")
    .attr("transform", "translate(30,30)");

  var text = g.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("dy", ".15em")
    .style("fill", "#8b8d8f")
    .attr("font-family", "Times New Roman")
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .text("C-Value");

  g.call(slider1);

  d3.select("p#value1").text(d3.format('.2')(slider1.value()));
  d3.select("a#setValue1").on("click", () => slider1.value(1.1));

  var slider2 = d3.sliderHorizontal()
    .min(d3.min(data2))
    .max(d3.max(data2))
    .width(300)
    .tickFormat(d3.format('.2'))
    .ticks(5)
    .default(1500)
    .on('onchange', val => {
      d3.select("p#value2").text(Math.round(val));
    });

  var g = d3.select("div#slider2").append("svg")
    .attr("width", 400)
    .attr("height", 100)
    .append("g")
    .attr("transform", "translate(30,30)");

  var text = g.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("dy", ".15em")
    .style("fill", "#8b8d8f")
    .attr("font-family", "Times New Roman")
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .text("Number of Iterations");

  g.call(slider2);

  d3.select("p#value2").text(d3.format('.2')(slider1.value()))
  d3.select("a#setValue2").on("click", () => slider1.value(1500));
}

function changeGraph() {
  string = '{"I":' + d3.select("p#value2").text() + ', "c":' + d3.select("p#value1").text() + '}'

  var client = new WebSocket("ws://localhost:8765");
      client.onopen = function(evt) {
          console.log("Connection Opened");
          client.send(string);
      };
      client.onmessage = function(evt) {
          drawLineGraph(JSON.parse(evt.data));
      };
      client.onclose = function(ect) {
          console.log("Connection Closed");
      };
}