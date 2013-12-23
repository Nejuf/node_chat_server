(function(root){ "use-strict";

var WebSocketIO = root.WebSocketIO = (root.WebSocketIO || {});
WebSocketIO.sockets = WebSocketIO.sockets || [];

WebSocketIO.createSocket = function(host, port, $ul){

	var ws = new WebSocket('ws://' + host + ':' + port.toString());
	WebSocketIO.sockets << ws;

	ws.onopen = function() {
		console.log('Socket has been opened');
		console.log('onopen', arguments);
	};
	ws.onmessage = function(event) {
		console.log('onMessage', event);
		var msg = event.data;
		var li = '<li class="chat-message">' + msg + '</li>'
		$ul.append(li);
	};

	ws.onerror = function(event){
		console.log('onerror', event);

	};

	ws.onclose = function(event){
		console.log('onclose', event);

	};

	ws.emit = function(message){
		try{
			ws.send(message);
			sendCallback();
		}
		catch(e){
			sendCallback(e);
		}
	};

	var sendCallback = function(error){
		if(error){
			console.log("socket Send error: ", error);
		}
		else{
			console.log("socket Send success");
		}
	}

	return ws;
	};

})(this);