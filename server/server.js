'use strict';

var express = require('express'),
	http = require('http'); 

const PORT = 7000; //port on which this server runs

var app = express();
var server = require('http').createServer(app); 
var bodyParser = require('body-parser');  //required to parse the body of requests/responses
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

require('./routes')(app);

server.listen(PORT, function(){
	//Callback triggered when server is successfully listening. Hurray!
	console.log("Server listening on: http://localhost:%s", PORT);
});	

exports = module.exports = app;
