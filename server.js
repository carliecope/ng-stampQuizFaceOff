var http = require('http');
var express = require('express');
var socket_io = require('socket.io');
//var socket_fun = require('routes/socket.js');

var app = express();
app.use(express.static('public'));

var server = http.createServer(app);
var io = socket_io.listen(server);

io.on('connection', function (socket) {
	console.log('Client connected');

});

server.listen(8080);