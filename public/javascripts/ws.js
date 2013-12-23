(function(root){ "use-strict";

var WebSocketIO = root.WebSocketIO = (root.WebSocketIO || {});

var ws = WebSocketIO.socket = new WebSocket('ws://127.0.0.1:8000');

ws.onopen = function() {
	console.log('Socket has been opened');
	console.log('onopen', arguments);
};
ws.onmessage = function(event) {
	console.log('onMessage', event);
	var msg = event.data;
	var li = '<li class="chat-message">' + msg + '</li>'
	$('.chat-messages').append(li);
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
})(this);