(function(root){ "use-strict";

var net = require("net");

var RESERVED_NAMES = ['user', 'users', 'self', 'bot', 'mod', 'moderator', 'admin', 'administrator', 'system'];

var Client = function(stream) {
  this.name = null;
  this.stream = stream;
  this.message = "";
  this.room = null;
}

var Room = function(name){
	this.name = name;
	this.members = [];
}

var clients = [];
var rooms = [new Room('chat'), new Room('support'), new Room('contests')];

console.log("Creating server...");
var server = net.createServer(function (stream) {
	console.log("Server connected.");

  var client = new Client(stream);
  clients.push(client);

  stream.setTimeout(0);
  stream.setEncoding("utf8");

  var sendMessage = function(message, target, fromSystem){
  	if(!message){
  		message = client.message + "\r";
  		client.message = "";
  	}
  	switch(target){
  		case "self":
  			client.stream.write(message + "\r\n");
  		break;
  		case "global":
				fromName = fromSystem ? "System" : client.name

	  		clients.forEach(function(c) {
	        c.stream.write("\r\033[K" + fromName + ": " + message + "\r\n" + c.message);
	      });
  		break;
  		case "room":
  		default:
  			if(client.room) {
	  			fromName = fromSystem ? "System" : client.name

		  		client.room.members.forEach(function(c) {
		        c.stream.write("\r\033[K" + fromName + ": " + message + "\r\n" + c.message);
		      });
		  	}
		  	else {
		  		client.stream.write("Failed to send: " + message + "\r\nYou must be in a room to send messages.\r\n  **(Try /rooms then /join <room_name>)\r\n")
		  	}
	    break;
  	}
  };

	Client.prototype.changeRoom = function(newRoom){
		var client = this;
		if(client.room){
			client.room.members.splice(client.room.members.indexOf(client), 1);
			sendMessage(client.name + " has left the room.", "room", true);
		}

		client.room = newRoom;
		newRoom.members.push(client);
		sendMessage(client.name + " has joined the room.", "room", true);
		sendMessage("Welcome to the " + newRoom.name + " room!\r\nCurrent users:\r\n", "self", true);
		newRoom.members.forEach(function(c) {
      sendMessage("- " + c.name, 'self');
    });
	}

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

	  			sendMessage("Greetings, " + client.name + "!  Please join a room to start chatting. (Hint: /rooms or /join <room_name>)\r\n", "self", true);
  			}
  		}
  		else {
  			var clean_message = client.message.replace(/(\r\n|\n|\r)/gm,"");

		    if (clean_message[0] === "/") {
	  			var command = clean_message.match(/([^\/\s]\S*)/g);
		    	switch(command[0].toLowerCase()){
		    		case 'commands':
		    			sendMessage("/commands", 'self');
		    			sendMessage("/users", 'self');
		    			sendMessage("/quit, /end, /exit", 'self');
		    			sendMessage("/rooms", 'self');
		    			sendMessage("/join <room_name>", 'self');
		    		break;
		    		case 'users':
			  			client.message = "";
			    		clients.forEach(function(c) {
			    			var roomName = c.room ? c.room.name : "N/A"
			          sendMessage("- " + c.name + " [" + c.room.name + "]", 'self');
			        });
		    		break;
		    		case 'quit':
		    		case 'end':
		    		case 'exit':
		    		case 'leave':
			  			client.message = "";
			        stream.end();
			        return;
		    		break;
		    		case 'rooms':
			    		client.message = "";
			    		rooms.forEach(function(r) {
			    			roomName = r === client.room ? ("*" + r.name) : r.name
			          sendMessage("- " + roomName, 'self');
			        });
		    		break;
		    		case 'join':
		    			var joinRoom;
		    			rooms.forEach(function(r){
		    				if(r.name === command[1]){
		    					joinRoom = r;
		    					return;
		    				}
		    			});

		    			if(joinRoom){
		    				client.message = "";
		    				client.changeRoom(joinRoom);
		    			}
		    			else{
		    				debugger
			    			client.message = "";
			    			sendMessage("There is no room of the name: " + command[1], 'self');
		    			}
		    		break;
		    		default:
		    			message = client.message;
		    			client.message = "";
		    			sendMessage("Unrecognized command: " + message, 'self');
		    		break;
		    	}
		    }
		    else if (client.message.length){
		  		sendMessage();
		  	}
	  	}
  	}
  	else{
  		if(data === "\b"){
  			client.message = client.message.slice(0,-1);
  		}
  		else{
	  		client.message += data;
	  	}
	  	client.stream.write("\r\033[K" + client.message);
  	}

  });

  stream.addListener("end", function() {
    clients.splice(clients.indexOf(client), 1);

    sendMessage(client.name + " has left.\r\n", null, true);

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

})(this);