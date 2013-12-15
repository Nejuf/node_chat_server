var net = require("net");

var RESERVED_NAMES = ['user', 'users', 'self', 'bot', 'mod', 'moderator', 'admin', 'administrator', 'system'];

function Client(stream) {
  this.name = null;
  this.stream = stream;
  this.message = "";
}

var clients = [];

console.log("Creating server...");
var server = net.createServer(function (stream) {
	console.log("Server connected.");

  var client = new Client(stream);
  clients.push(client);

  stream.setTimeout(0);
  stream.setEncoding("utf8");

  var sendMessage = function(message, target){
  	if(!message){
  		message = client.message + "\r";
  		client.message = "";
  	}
  	switch(target){
  		case "self":
  			client.stream.write(message + "\r\n");
  		break;
  		default:
	  		clients.forEach(function(c) {
	        c.stream.write("\r\033[K" + client.name + ": " + message + "\r\n" + c.message);
	      });
	    break;
  	}
  };

  stream.write("Welcome to Chat!\r\n Use /quit, /end, or /exit to leave chat.\r\n\nPlease enter your username:\r\n");
  var enteringUsername = true;

  stream.addListener("data", function (data) {
  	if (data.match(/\n/)){
  		stream.write('\033[1A' + '\r\033[K');//clears input (previous line)
  		
  		if(enteringUsername){
  			name = client.message;

  			if(nameReserved(name)){
  				client.message = "";
  				sendMessage("The name \"" + name + "\" is reserved.  Please select another.", "self");
  			}
  			else if(nameTaken(name)){
  				client.message = "";
					sendMessage("The name \"" + name + "\" is already taken by another user.", "self");
  			}
  			else{
  				enteringUsername = false;
	  			client.name = client.message;
	  			client.message = "";

	  			sendMessage(client.name + " has joined the room.");
  			}
  		}
  		else {
  			var command = client.message.match(/^\/(.*)/);

		    if (command) {
		    	switch(command[1].toLowerCase()){
		    		case 'users':
			  			client.message = "";
			    		clients.forEach(function(c) {
			          sendMessage("- " + c.name, 'self');
			        });
		    		break;
		    		case 'quit':
		    		case 'end':
		    		case 'exit':
			  			client.message = "";
			        stream.end();
			        return;
		    		break;
		    		default:
		    			message = client.message;
		    			client.message = "";
		    			sendMessage("Unrecognized command: " + client.message, 'self');
		    		break;
		    	}
		    }
		    else if (client.message.length){
		  		sendMessage();
		  	}
	  	}
  	}
  	else{
  		client.message += data;
  	}

  });

  stream.addListener("end", function() {
    clients.splice(clients.indexOf(client), 1);

    clients.forEach(function(c) {
      c.stream.write(client.name + " has left.\r\n");
    });

    stream.end();
  });
});

var nameTaken = function(name){
	var len = clients.length;
	for(var i = 0; i < len; i++){
		if (clients[i].name !== null){	
			if (clients[i].name.toLowerCase() == name.toLowerCase()){
				return true;
			}
		}
	}

	return false;
}

var nameReserved = function(name){
	if (RESERVED_NAMES.indexOf(name.toLowerCase()) >= 0){
		return true;
	}
	return false;
}

console.log("Server created.");
server.listen(7000, function(){
	console.log("Chat server listening on port 7000.")
});