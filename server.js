var express = require('express');
var dnode = require('dnode');

var server = express.createServer();

server.use(express.static(__dirname));


function verify_identity(assertion, callback) {
  var querystring = require('querystring');
  var https = require('https');
  var fs = require('fs');

  var data = querystring.stringify({
      assertion: assertion,
      audience: "localhost:9095"});//"pool-71-116-103-166.snfcca.dsl-w.verizon.net"});//"home.grumdrig.org"});//"grumdrig.com"});

  var opts = {
    host: "browserid.org",
    path: "/verify",
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': data.length,
      'User-Agent': "RPG Ops Backend",
      'Accept': '*/*'
      }
  };

  var req = https.request(opts, function(res) {
      console.log(res.statusCode);
      var resp_body = "";
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log(chunk);
          resp_body += chunk;
        });
      res.on('end', function () {
          console.log("VIend\n");
          callback(JSON.parse(resp_body));
        });
    });

  req.on('error', function (e) { 
      console.log(JSON.stringify(e));
      callback({status:"Auth request failed"}); 
    });

  req.end(data);
}


dnode(function (client) {
    this.signin = function (assertion, callback) {
      verify_identity(assertion, callback);
    };
  }).listen(server);


var port = 9095;
server.listen(port);
console.log('http://localhost:' + port);
