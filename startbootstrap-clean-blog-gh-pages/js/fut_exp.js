function fut_expGraph(file, divRem, div, simulation) {
  d3.json("data/averages" + file + ".json", function(error, graph) {
    if (error) throw error;
    if (parseInt(file) < 2) {
      drawLineGraph(graph["Averages" + file], divRem, div);
    }
    else {
      drawLineGraph(graph["Averages" + file], divRem, div, "specific", graph["Paras" + file]);
    }
  });
}