var express = require('express');
var dnode = require('dnode');

var server = express.createServer();

server.use(express.static(__dirname));

SESSIONS = {}

dnode(function (client, connection) {

    connection.on('request', function (req) {
        console.log("REQUEST");
      });
    
    connection.on('ready', function () {
        console.log("CLIENT");
        console.dir(client);
        console.log("CONN");
        console.dir(''+connection);
      });

    this.resumeSession = function (id) {
      if (SESSIONS[id]) {
        connection.session = id;
        client.session(id, SESSIONS[id]);
      } else {
        client.noSession("You need to sign on in");
      }
    };

    this.verify = function (assertion, callback) {
      verify_identity(assertion, function(response) {
          if (response.status == "okay") {
            // Look up user id
            var hash = require("crypto").createHash("sha256");
            hash.update("secret that doesn't belong on github");
            hash.update(response.email);
            hash.update(''+Math.random()); // >:(
            connection.session = hash.digest('base64');
            SESSIONS[connection.session] = response.email;
            client.session(connection.session, response.email);
            console.log("Identity verified", connection.session, response.email);
          } else {
            client.noSession("That's not legit");
          }
        });
    };

    this.signout = function () {
      delete SESSIONS[connection.session];
      client.noSession("Signed out");
    }

  }).listen(server);




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
          callback(JSON.parse(resp_body));
        });
    });

  req.on('error', function (e) { 
      console.log(JSON.stringify(e));
      callback({status:"Auth request failed"}); 
    });

  req.end(data);
}


var port = 9095;
server.listen(port);
console.log('http://localhost:' + port);
