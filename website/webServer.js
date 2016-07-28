/*

This is the webServer file for this. To run the webServer type the command:
	node webServer.js
*/

var async = require('async');
var session = require('express-session');
var bodyParser = require('body-parser');
var express = require('express');
var request = require('request');
var app = express();

app.use(express.static(__dirname));

app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

request('http://www.google.com', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body) // Show the HTML for the Google homepage.
  }
})

// var options = {
//   url: 'https://api.github.com/repos/request/request',
//   headers: {
//     'User-Agent': 'request'
//   }
// };

// function callback(error, response, body) {
//   if (!error && response.statusCode == 200) {
//     var info = JSON.parse(body);
//     console.log(info.stargazers_count + " Stars");
//     console.log(info.forks_count + " Forks");
//   }
// }

// request(options, callback);

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});