(function(root){ "use-strict";

var http = require('http');
var fs = require('fs');

var http_server = http.createServer(function(req, res){
	var url = req.url;
	if(url == '/'){
		url = '/public/index.html';
	}

	fs.readFile('.'+url, { encoding: 'utf8' }, function(err, data){
		if(err){
			res.writeHead(404, { 'Content-Type': 'text/plain' });
			res.end('File not found.');
		}
		else{
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(data);
		}
	});
});
http_server.listen(80);

console.log('HTTP server running at port 80');
})(this);