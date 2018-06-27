function fut_expGraph(file, divRem, div) {
  console.log(file, divRem, div, "data/averages" + file + ".json");
  d3.json("data/averages" + file + ".json", function(error, graph) {
    if (error) throw error;
    console.log(graph);
  });
}