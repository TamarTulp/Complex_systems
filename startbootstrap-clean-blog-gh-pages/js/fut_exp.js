function fut_expGraph(file, divRem, div, simulation) {
  console.log(file, divRem, div, "data/averages" + file + ".json");
  d3.json("data/averages" + file + ".json", function(error, graph) {
    if (error) throw error;
    console.log(graph["Averages" + file]);
    drawLineGraph(graph["Averages" + file], divRem, div);
    drawSlider("div#slider1_" + file, "div#slider2_" + file, "_" + file);
  });
}