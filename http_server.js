(function(root){ "use-strict";

var node_static = require('node-static');
var http = require('http');

var static_server = new(node_static.Server)('./public');

var http_server = http.createServer(function(req, res){
	var url = req.url;
	console.log(url);

	static_server.serve(req, res, function(err, result){
		if (err) { // There was an error serving the file
      console.log("Error serving " + req.url + " - " + err.message);

      // Respond to the client
      res.writeHead(err.status, err.headers);
      res.end();
    }
	});
});
http_server.listen(80);

console.log('HTTP server running at port 80');
})(this);