(function(root){ "use-strict";

var net = require('net');
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: 8000});

wss.on('connection', function(ws) {
    ws.on('message', processMessage.bind(ws));

    ws.tcp = net.connect({port: 8080}, function(){ console.log('WS connected to TCP server.')});
    ws.tcp.on('data', function(data){
    	console.log('WS TCP data: ', data.toString());
    	//TODO: Check for special instructions from TCP or extract username
		  ws.send(data.toString(), sendCallback);
    });
    ws.tcp.on('end', function() {
		  console.log('WS TCP disconnected');
		  ws.send('The TCP server has disconnected', sendCallback);
		  //TODO: Close web socket if the user intentionally quit, 
		  //      otherwise attempt to reconnect
		});
    ws.tcp.on('error', function(error) {
		  console.log('WS TCP Error', error);
		  ws.send('Encountered TCP Socket Error.', sendCallback);
		});
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

})(this);