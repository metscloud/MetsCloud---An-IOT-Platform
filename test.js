var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

socketApi.io = io;



socketApi.sendNotification = function() {
  
    io.sockets.emit('hello', {msg: 'Hello World!'},);
    console.log(">>><><><><><><><>< <><><><><><><<");
    console.log(">>><><><><><><><>< <><><><><><><<");
    console.log(">>><><><><><><><>< <><><><><><><<");
    console.log(">>><><><><><><><>< <><><><><><><<");
    console.log(">>><><><><><><><>< <><><><><><><<");
    console.log(">>><><><><><><><>< <><><><><><><<");
}


module.exports = socketApi;