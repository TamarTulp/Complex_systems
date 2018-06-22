var client = new WebSocket("ws://localhost:39822");

client.onopen = function(evt) {
    console.log("Connection Opened");
    client.send('{"simulation": 1, "I":1000, "c":1.1}');
    client.send('{"simulation": 2, "I":1000, "c":1.1}');
}
client.onmessage = function(evt) {
    console.log(JSON.parse(evt.data));
}
client.onclose = function(ect) {
    console.log("Connection Closed");
}