

// This creates a new empty, undirected graph
var G = new jsnx.Graph();
console.log("Ik ben geladen!! :D")
// Generates a complete graph with six nodes
var G = jsnx.completeGraph(6);
console.log(G.nodes());
// Generates a random graph with six nodes and
// an edge between each node is created with a probability of 0.3
var G = jsnx.binomialGraph(6, 0.3);
G.addEdge(1,3);
G.addEdge(3,1); // does not do anything in undirected graphs
G.addEdgesFrom([[1,5], [1,7], [7,3], [7,9]]); // node 9 does not exist!
console.log(G.nodes());
console.log(G.edges());