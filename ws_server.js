var net = require('net');
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: 8000});

wss.on('connection', function(ws) {
    ws.on('message', processMessage.bind(ws));
    ws.send('Server: Greetings!', sendCallback);
    ws.username = 'User' + wss.clients.length;
    ws.tcp = net.connect({port: 8080}, function(){ console.log('Socket connected to TCP server.')});
    ws.tcp.on('data', function(data){
    	console.log('ws.tcp.on data: ', data.toString());
    	//TODO: Check for special instructions from TCP or extract username
		  // wss.broadcast(data.toString());
		  ws.send(data.toString(), sendCallback);
    });
    ws.tcp.on('end', function() {
		  console.log('ws.tcp.on end disconnected');
		});
    wss.broadcast('Server: ' + ws.username + ' has joined the chat.');
});

wss.broadcast = function(data) {
    for(var i in this.clients)
        this.clients[i].send(data, sendCallback);
};

var sendCallback = function(error){
	if(error){
		console.log("Server socket Send error: " + error);
	}
	else{
		console.log("Server socket Send success");
	}
}

var processMessage = function(message){
  console.log('received: %s', message);
  var jsonData = {
  	message: message,
  	type: 'websocket'
  }
  this.tcp.write(JSON.stringify(jsonData));
};