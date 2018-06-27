function drawGraph() {
  d3.select("#graphNet").remove();

  // dimensions
  var width = 400;
  var height = 400;

  var margin = {
      top: 40,
      bottom:75,
      left: 10,
      right: 50,
  };

  var svg = d3.select("div#graph_network")
      .append("svg")
      .attr("id", "graphNet")
      .attr("width", width)
      .attr("height", height);

  var tooltip = d3.select("body")
    .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(function(d) {return Math.max(10, 50 / (d.weight)); }))
      .force('collision', d3.forceCollide().radius(function(d) { return 20;}))
      .force("center", d3.forceCenter(width / 2, height / 2));

  d3.json("data/data.json", function(error, graph) {
    if (error) throw error;

    // console.log(graph, global_nodeList);
    if (global_nodeList.length != 0) {
      graph = removeNodes(graph, global_nodeList);
    }

    optionList = graph["nodes"]
    optionList.push({"14":"Remove node"})

    d3.select("#dropdown")
      .selectAll("option")
      .data(optionList.reverse())
      .enter()
      .append("option")
      .attr("value", function(d) { return d.id; })
      .text(function(d) { return d.id; });

    var dropDown = d3.select("#dropdown");

    dropDown.on("change", function() {
      selected = d3.event.target.value;
      global_nodeList.push(selected);
      drawGraph();
    });

    var link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graph.links)
      .enter().append("line")
      .attr("id", function(d) { return d.source + "-" + d.target;})
      .attr("stroke-width", function(d) { return d.weight * d.weight; });

    var drag = d3.drag()
      .subject(function(d) { return {x: d[0], y: d[1]}; })
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);

    var node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(graph.nodes)
      .enter().append("circle")
      .attr("id", function(d) { return d.id; })
      .attr("class", "nodesC")
      .attr("r", 10)
      .attr("fill", function(d) { return color(d.id); })
          .on("mouseover", function(d) {
              tooltip.transition()
                  .duration(200)
                  .style("opacity", .9);
              tooltip .html("BAM!");
              })
          .on("mouseout", function(d) {
          tooltip.transition()
              .duration(500)
              .style("opacity", 0)
      })
      .call(drag);

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
      link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    }

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    function removeByKey(array, params){
      array.some(function(item, index) {
        return (array[index][params.key] === params.value) ? !!(array.splice(index, 1)) : false;
      });
      return array;
    }

    function removeNodes(graph, nodeNames) {
      for (index in nodeNames) {
        removeByKey(graph["nodes"], {
          key: 'id',
          value: nodeNames[index]
        });

        for (link in graph["links"]) {
          removeByKey(graph["links"], {
            key: 'source',
            value: nodeNames[index]
          });
          removeByKey(graph["links"], {
            key: 'target',
            value: nodeNames[index]
          });
        }
      }
      return graph;
    }
  });
}

function sim1() {
    global_1or2 = 1;
    changeGraph("#nwSVG1", "#graph_nw_lines", "_sim3");
}

function sim2() {
    global_1or2 = 2;
    changeGraph2("#nwSVG1", "#graph_nw_lines", "_sim3");
}

function sim1_2() {if (global_1or2 == 1) { sim1(); } else { sim2(); }}

var global_nodeList = [];
var global_1or2 = 1;
drawGraph();