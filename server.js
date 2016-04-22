var http = require('http');
var express = require('express');
var socket_io = require('socket.io');


var app = express();
app.use(express.static('public'));

var server = http.createServer(app);
var io = socket_io.listen(server);
require('./routes/socket.js')(io);


server.listen(process.env.PORT || 8080);