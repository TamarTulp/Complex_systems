var client = new WebSocket(simServerAddress);
var data, link, node, circle_mask, circle, label;
var selected = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

function request(){
    json = '{"simulation": 1, "I":1000, "c": 2, "select": ' + JSON.stringify(selected) + '}';
    client.send(json);
}

function update(i) {
    X = data.X[i];
    P = data.P[i];

    circle
        .attr("fill-opacity", function(d) { return P[d.index]; })
        .attr("stroke-opacity", function(d) { return X[d.index] ? 1 : 0; });

    label.attr("opacity", function(d) { return X[d.index] ? 1 : 0.7; } )
}

function select(index) {
    selected[index] = selected[index] ? 0 : 1;
    circle_mask.style("stroke", function(d) { return (selected[d.index]) ? 'grey' : 'red'; })
    circle.style("stroke", function(d) { return (selected[d.index]) ? 'black' : 'red'; })
    request();
}

client.onopen = function(evt) {
    console.log("Connection Opened");
    request();
}

client.onmessage = function(evt) {
    data = JSON.parse(evt.data);
    if (circle != null) { update(999); };
}
client.onclose = function(ect) {
    console.log("Connection Closed");
}

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

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
        .enter().append("g")

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

    circle.append("title").text(function(d) { return d.name; })

    label = node.append("text")
        .attr("font-size", '20px')
        .text(function(d) { return d.id; })

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
            .attr("cy", function(d) { return d.y; })
        circle
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
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