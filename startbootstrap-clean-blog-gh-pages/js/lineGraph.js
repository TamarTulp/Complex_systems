function drawLineGraph(array_data) {
  d3.select("#graphSVG").remove();
  console.log(array_data);

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
      d3.select("p#value1").text(Math.round(val * 100) / 100);
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

  d3.select("p#value2").text(d3.format('.2')(slider2.value()))
  d3.select("a#setValue2").on("click", () => slider2.value(1500));
}

function changeGraph() {
  string = '{"simulation":1, "I":' + d3.select("p#value2").text() + ', "c":' + d3.select("p#value1").text() + '}';
  string2 = '{"simulation":2, "I":' + d3.select("p#value2").text() + ', "c":' + d3.select("p#value1").text() + '}';

  var client = new WebSocket("ws://localhost:39822");
      client.onopen = function(evt) {
          console.log("Connection Opened");
          client.send(string);
      };
      client.onmessage = function(evt) {
          console.log(JSON.parse(evt.data));
          drawLineGraph(JSON.parse(evt.data)["D"]);
      };
      client.onclose = function(ect) {
          console.log("Connection Closed");
      };
}

function adjacency() {

    var promiseWrapper = (d) => new Promise(resolve => d3.csv(d, (p) => resolve(p)));

    Promise.all([promiseWrapper("data/nodelist.csv"),promiseWrapper("data/edgelist.csv")]).then(resolve => {
        createAdjacencyMatrix(resolve[0],resolve[1]);
     });

    function createAdjacencyMatrix(nodes,edges){

    var width = 600;
    var height = 600;

    var edgeHash = {};
    edges.forEach(edge =>{
      var id = edge.source + "-" + edge.target;
      edgeHash[id] = edge;
    });

    var matrix = [];
    nodes.forEach((source, a) => {
      nodes.forEach((target, b) => {
        var grid = {id: source.id + "-" + target.id, x: b, y: a, weight: 0};
        if(edgeHash[grid.id]){
          grid.weight = edgeHash[grid.id].weight;
        }
      matrix.push(grid);
      });
    });

  var svg = d3.select("svg#adjacency");

  var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  d3.select("svg#adjacency").append("g")
    .attr("transform","translate(50,50)")
    .attr("id","adjacencyG")
    .selectAll("rect")
    .data(matrix)
    .enter()
    .append("rect")
    .attr("class","grid")
    .attr("width",35)
    .attr("height",35)
    .attr("x", d=> d.x*35)
    .attr("y", d=> d.y*35)
    .style("fill-opacity", d=> d.weight * .2);

  d3.select("svg#adjacency")
    .append("g")
    .attr("transform","translate(50,45)")
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .attr("x", (d,i) => i * 35 + 17.5)
    .text(d => d.id)
    .style("text-anchor","middle")
    .style("font-size","10px");

  d3.select("svg#adjacency")
    .append("g").attr("transform","translate(45,50)")
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .attr("y",(d,i) => i * 35 + 17.5)
    .text(d => d.id)
    .style("text-anchor","end")
    .style("font-size","10px");


  d3.selectAll("rect.grid").on("mouseover", function(d){
      div.transition()
       .duration(200)
       .style("opacity", .9);
     div.html(d.id + "<br/>" + d.weight)
       .style("left", (d3.event.pageX) + "px")
       .style("top", (d3.event.pageY - 28) + "px");
     gridOver(d);
     })
    .on("mouseout", function(d) {
      div.transition()
         .duration(500)
         .style("opacity", 0);
      gridOut(d);
    });

  function gridOver(d) {
    d3.select("svg#adjacency").selectAll("rect").style("stroke-width", function(p) { return p.x == d.x || p.y == d.y ? "3px" : "1px"; });
  }
  function gridOut(d) {
    console.log("out!")
    d3.select("svg#adjacency").selectAll("rect").style("stroke-width", function(p) { return "1px"; });
  }
  }
}
adjacency();

function drawLineGraph2(array_data) {
  d3.select("#graphSVG").remove();
  console.log(array_data);

  // dimensions
  var width = 900;
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
  var svg = d3.select("#lineGraph_sim2")
      .append("svg")
      .attr("id", "graphSVG")
      .attr("width", width)
      .attr("height", height)
      .append('g')
      .attr('transform', 'translate(' + margin.top + ',' + margin.left + ')');

  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  var parseTime = d3.timeParse("%Y"),
      bisectDate = d3.bisector(function(d) { return d.S; }).left;

  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  var line = d3.line()
      .x(function(d) { return x(d["S"]); })
      .y(function(d) { return y(d["DOWN"]["D"]); });

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

  x.domain(d3.extent(array_data["S"], function(d) { return d; }));
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

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
              .ticks(30)
             );

    g.append("path")
        .datum(array_data)
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
        .attr("height", height);
    //     .on("mouseover", function() { focus.style("display", null); })
    //     .on("mouseout", function() { focus.style("display", "none"); })
    //     .on("mousemove", mousemove);

    // function mousemove() {
    //   var x0 = x.invert(d3.mouse(this)[0]),
    //       i = bisectDate(data, x0, 1),
    //       d0 = data[i - 1],
    //       d1 = data[i],
    //       d = x0 - d0.year > d1.year - x0 ? d1 : d0;
    //   focus.attr("transform", "translate(" + x(d.year) + "," + y(d.value) + ")");
    //   focus.select("text").text(function() { return zeroFill(d.value, 2); });
    //   focus.select(".x-hover-line").attr("y2", height - y(d.value));
    //   focus.select(".y-hover-line").attr("x2", width + width);
    // }
}

function drawSlider2() {
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
      d3.select("p#value1").text(Math.round(val * 100) / 100);
    });

  var g = d3.select("div#slider1_sim2").append("svg")
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

  d3.select("p#value1_sim2").text(d3.format('.2')(slider1.value()));
  d3.select("a#setValue1_sim2").on("click", () => slider1.value(1.1));

  var slider2 = d3.sliderHorizontal()
    .min(d3.min(data2))
    .max(d3.max(data2))
    .width(300)
    .tickFormat(d3.format('.2'))
    .ticks(5)
    .default(1500)
    .on('onchange', val => {
      d3.select("p#value2_sim2").text(Math.round(val));
    });

  var g = d3.select("div#slider2_sim2").append("svg")
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

  d3.select("p#value2_sim2").text(d3.format('.2')(slider2.value()))
  d3.select("a#setValue2_sim2").on("click", () => slider2.value(1500));
}