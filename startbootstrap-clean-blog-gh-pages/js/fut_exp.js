function fut_expGraph(file, divRem, div, simulation) {
  d3.json("data/averages" + file + ".json", function(error, graph) {
    if (error) throw error;
    if (parseInt(file) < 1) {
      drawLineGraph(graph["Averages" + file], divRem, div);
    }
    else {
      drawLineGraph(graph["Averages" + file], divRem, div, "specific", graph["Paras" + file]);
    }
  });

  drawSlider("div#slider1_HN", "div#slider2_HN", "_HN", 2);
  drawSlider("div#slider1_sim3", "div#slider2_sim3", "_sim3");
  string = '{"simulation":1, "I":' + d3.select("p#value2_sim3").text() + ', "c":' + d3.select("p#value1_sim3").text() + '}';

  var client = new WebSocket("ws://localhost:39822");
      client.onopen = function(evt) {
          console.log("Connection Opened");
          client.send(string);
      };
      client.onmessage = function(evt) {
    drawLineGraph(JSON.parse(evt.data)["D"], "#heavy_networkSVG", "#heavy_network");
      };
      client.onclose = function(ect) {
          console.log("Connection Closed");
      };
}