var client = new WebSocket("ws://localhost:39822");
var data, link, node, circle_mask, circle, label;
var selected = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
var width = 720;
var height = 400;
var global_nodeList = [];
var global_1or2 = 1;
var init = 0;

drawSlider("div#slider1_HN", "div#slider2_HN", "_HN", 2);
drawSlider("div#slider1_sim3", "div#slider2_sim3", "_sim3", 2);

function request(sim){
    if (sim) { global_1or2 = sim }
    json = '{"simulation": ' + global_1or2 + ', "I":' + d3.select("p#value2_sim3").text() + ', "c": ' + d3.select("p#value1_sim3").text() + ', "select": ' + JSON.stringify(selected) + '}';
    if (init == 0) { json = '{"simulation": 1, "I":1500, "c": 2, "select": [1,1,1,1,1,1,1,1,1,1,1,1,1,1]}' }
    client.send(json);
}

function update(i) {
    if (data.simulation == 1){
        X = data.X[i];
        P = data.P[i];
    }
    else {
        X = data.UP.X[i];
        P = data.UP.P[i];
    }

    circle
        .attr("fill-opacity", function(d) { return P[d.index]; })
        .attr("stroke-opacity", function(d) { return X[d.index] ? 1 : 0; });

    label.attr("opacity", function(d) { return X[d.index] ? 1 : 0.7; } );
}

function select(index) {
    selected[index] = selected[index] ? 0 : 1;
    circle_mask.style("stroke", function(d) { return (selected[d.index]) ? 'grey' : 'red'; });
    circle.style("stroke", function(d) { return (selected[d.index]) ? 'black' : 'red'; });
    request();
}

var slider = document.getElementById("myRange");
slider.oninput = function() {
    if (circle !== null && data !== null) {
        update(Math.floor(this.value * d3.select("p#value2_sim3").text()));
    }
};

client.onopen = function(evt) {
    console.log("Connection Opened");
    request();
};

client.onmessage = function(evt) {
    data = JSON.parse(evt.data);
    if (init == 0) { drawLineGraph(data["D"], "#heavy_networkSVG", "#heavy_network"); init = 1;}
    if (circle !== null) { update(Math.floor(slider.value * d3.select("p#value2_sim3").text())); }
    sim1_2(data);
};

client.onclose = function(ect) {
    console.log("Connection Closed");
};

fut_expGraph("0", "#generalSVG", "#general");
fut_expGraph('1', '#general_specificSVG', '#general_specific');

var svg = d3.select("#graph_network")
    .append("svg")
      .attr("id", "#graph_networkSVG")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 " + width + " " + height)
      .classed("svg-content", true);

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(function(d) {
        return Math.max(10, 50 / (d.weight));
    }))
    .force('collision', d3.forceCollide().radius(function(d) { return 25;}))
    .force("center", d3.forceCenter(width / 2, height / 2));

d3.json("data/data.json", function(error, graph) {
    if (error) throw error;

    link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", function(d) {
            if (d.weight > 0) { return d.weight * d.weight; }
            else { return 0; }
         });

    node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter().append("g");

    circle_mask = node.append("circle")
        .attr("r", 10)
        .style("fill", 'white');

    circle = node.append("circle")
        .attr("r", 10)
        .style("fill", function(d) { return color(d.id); })
        .style("stroke", "black")
        .on("click", function(d) { return select(d.index); })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    circle.append("title").text(function(d) { return d.name; });

    label = node.append("text")
        .attr("font-size", '20px')
        .text(function(d) { return d.id; });

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
        circle_mask
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
        circle
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
        label
            .attr("x", function(d) { return d.x + 15; })
            .attr("y", function(d) { return d.y + 5; });
    }
});

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

function sim1(data) {
    global_1or2 = 1;
    console.log("hellaooo");
    console.log(data);
    changeGraph("#graph_nw_linesSVG", "#graph_nw_lines", "_sim3", data);
}

function sim2(data) {
    global_1or2 = 2;
    changeGraph2("#graph_nw_linesSVG", "#graph_nw_lines", "_sim3", data);
}

function sim1_2(data) {if (global_1or2 == 1) { sim1(data); } else { sim2(data); }}
