(function(root){ "use-strict";

var nodeStatic = require('node-static');
var http = require('http');
var path = require('path');

console.log('__filename', __filename);
console.log('__dirname', __dirname);

var staticFilePath = './public';
var staticServer = new(nodeStatic.Server)(path.resolve(__dirname,'public'));

var http_server = http.createServer(function(req, res){
	var url = req.url;
	console.log(url);

	req.on('error', function(error){
		console.log('Request error: ', error);
	});

	staticServer.serve(req, res, function(err, result){
		if (err) { // There was an error serving the file
      console.log("Error serving " + req.url + " - " + err.message);

      // Respond to the client
      res.writeHead(err.status, err.headers);
      res.end();
    }
	});
});

http_server.on('clientError', function(exception, socket){
	console.log('HTTP Server client error: ', exception, socket);
});

try{
	http_server.listen(3000);
}
catch(err){
	console.log("HTTP Server listening error: ", err);
}

console.log('HTTP server running at port 3000');
})(this);